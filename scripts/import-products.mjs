/**
 * CrazyGame Product Import Script
 * 
 * Downloads images from crazygame-eg.com, converts to WebP,
 * uploads to Supabase Storage, and inserts product rows.
 * 
 * Usage: node scripts/import-products.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env file
try {
  if (typeof process.loadEnvFile === 'function') {
    const rootEnvPath = path.join(__dirname, '..', '.env')
    if (fs.existsSync(rootEnvPath)) {
      process.loadEnvFile(rootEnvPath)
    } else {
      process.loadEnvFile()
    }
  }
} catch (e) {
  // Ignore
}

// ── Supabase config ────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jbggnkegzwzvnkeaumii.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || ''
const BUCKET = 'product-images'

if (!SUPABASE_KEY) {
  console.warn('⚠ Warning: SUPABASE_SECRET_KEY is not defined in environment variables.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── CSV path ───────────────────────────────────────────────────────────────
const CSV_PATH = path.join(__dirname, '..', 'wc-product-export-5-6-2026-1780616246695.csv')

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function mapProductType(categories) {
  const cats = categories.toLowerCase()
  if (cats.includes('accessori')) return 'accessory'
  if (cats.includes('console')) return 'console'
  if (cats.includes('digital code') || cats.includes('psn digital') || cats.includes('eshop')) return 'digital_code'
  return 'game'
}

function mapPlatform(categories, brand) {
  const all = (categories + ' ' + brand).toLowerCase()
  if (all.includes('switch 2')) return 'Switch 2'
  if (all.includes('switch')) return 'Switch'
  if (all.includes('ps5') || all.includes('playstation 5')) return 'PS5'
  if (all.includes('ps4') || all.includes('playstation 4')) return 'PS4'
  if (all.includes('xbox')) return 'Xbox'
  return 'Other'
}

function mapCategories(catStr) {
  if (!catStr) return []
  return catStr.split(',').map(c => c.trim()).filter(Boolean)
}

function mapTags(tagStr) {
  if (!tagStr) return []
  return tagStr.split(',').map(t => t.trim()).filter(c => c && c !== 'New')
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = await res.arrayBuffer()
    return Buffer.from(buf)
  } catch (e) {
    console.warn(`  ⚠ Could not download ${url}: ${e.message}`)
    return null
  }
}

async function convertToWebP(buffer) {
  return sharp(buffer)
    .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

async function uploadToSupabase(buffer, filename) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: 'image/webp',
      upsert: true
    })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return publicUrl
}

async function insertProduct(row, imageUrl) {
  const price = row['Regular price'] ? parseInt(row['Regular price']) : null
  const salePrice = row['Sale price'] ? parseInt(row['Sale price']) : null
  const cats = row['Categories'] || ''

  const { error } = await supabase.from('products').insert({
    name: row['Name'],
    short_description: row['Short description'] || null,
    description: row['Description'] || null,
    in_stock: row['In stock?'] === '1',
    stock: row['Stock'] ? parseInt(row['Stock']) : null,
    price: salePrice || price,
    was: salePrice && price && salePrice < price ? price : null,
    platform: mapPlatform(cats, row['Brands']),
    product_type: mapProductType(cats),
    categories: mapCategories(cats),
    tags: mapTags(row['Tags']),
    image_url: imageUrl,
    brand: row['Brands'] || null,
  })
  if (error) throw error
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎮 CrazyGame Product Importer')
  console.log('═══════════════════════════════════════')

  // Parse CSV
  const raw = fs.readFileSync(CSV_PATH, 'utf-8')
  // Strip UTF-8 BOM if present
  const cleanRaw = raw.replace(/^\uFEFF/, '')
  const records = parse(cleanRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  })

  console.log(`📦 Found ${records.length} products\n`)

  let success = 0, failed = 0, noImage = 0

  for (let i = 0; i < records.length; i++) {
    const row = records[i]
    const name = (row['Name'] || '').trim()
    if (!name) { console.log(`[${i + 1}] Skipping empty row`); continue }
    const imgUrl = (row['Images'] || '').split('|')[0]?.trim()

    process.stdout.write(`[${i + 1}/${records.length}] ${name.slice(0, 50)}... `)

    let publicUrl = null

    if (imgUrl) {
      try {
        const imgBuf = await downloadImage(imgUrl)
        if (imgBuf) {
          const webpBuf = await convertToWebP(imgBuf)
          const filename = `${slugify(name)}.webp`
          publicUrl = await uploadToSupabase(webpBuf, filename)
          process.stdout.write('🖼 ')
        } else {
          noImage++
        }
      } catch (e) {
        process.stdout.write(`⚠ img err: ${e.message.slice(0, 30)} `)
        noImage++
      }
    } else {
      noImage++
    }

    try {
      await insertProduct(row, publicUrl)
      success++
      console.log('✅')
    } catch (e) {
      failed++
      console.log(`❌ DB err: ${e.message.slice(0, 60)}`)
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`✅ Inserted: ${success}`)
  console.log(`❌ Failed:   ${failed}`)
  console.log(`⚠  No image: ${noImage}`)
  console.log('Done!')
}

main().catch(console.error)
