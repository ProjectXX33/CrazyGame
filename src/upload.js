/* Product image upload — converts to WebP in the browser, uploads to Supabase Storage,
   and lists existing images for the Media picker. */
import { supabase } from './supabase.js'

const BUCKET = 'product-images'

// ── YouTube URL helpers (used by gallery items) ────────────────────────────
export function youtubeId(url) {
  if (!url || typeof url !== 'string') return null
  // Accepts: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[1] : null
}
export function isYouTube(url) { return !!youtubeId(url) }
export function youtubeThumb(url) {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
export function youtubeEmbed(url) {
  const id = youtubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

// ── WebP conversion (browser-side, via canvas) ─────────────────────────────
export async function convertToWebp(file, quality = 0.85, maxSide = 2000) {
  if (file.type === 'image/webp') return file

  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })

  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })

  // Down-scale if huge — keeps storage costs sane
  let w = img.naturalWidth, h = img.naturalHeight
  if (Math.max(w, h) > maxSide) {
    const scale = maxSide / Math.max(w, h)
    w = Math.round(w * scale); h = Math.round(h * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  const blob = await new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error('WebP encode failed')), 'image/webp', quality))

  const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'image'
  return new File([blob], baseName + '.webp', { type: 'image/webp' })
}

// ── Upload (always WebP) ────────────────────────────────────────────────────
export async function uploadProductImage(file) {
  const webp = await convertToWebp(file)
  const path = Date.now() + '-' + webp.name
  const { error } = await supabase.storage.from(BUCKET).upload(path, webp, {
    cacheControl: '3600', upsert: false, contentType: 'image/webp',
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path, name: webp.name, size: webp.size }
}

// ── Media library — list uploaded images ───────────────────────────────────
// Walks the bucket, including subfolders (depth-limited), and returns every image.
// Throws a verbose error if the SELECT policy on storage.objects is missing.
export async function listProductImages(limit = 500) {
  const seen = []
  const visited = new Set()

  async function walk(prefix, depth) {
    if (depth > 3 || seen.length >= limit) return
    if (visited.has(prefix)) return
    visited.add(prefix)

    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) {
      const msg = error.message || JSON.stringify(error)
      throw new Error(
        `Storage list failed for "${prefix || '/'}" in bucket "${BUCKET}": ${msg}\n` +
        `→ Run scripts/product-images-policies.sql in Supabase to grant read/list permission.`
      )
    }

    for (const f of (data || [])) {
      if (!f.name || f.name.startsWith('.')) continue
      // Folder entries from Supabase list() have id=null and no metadata.
      const isFile = !!f.id || !!f.metadata
      if (isFile) {
        const path = prefix ? `${prefix}/${f.name}` : f.name
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
        seen.push({
          name: path,
          url: pub.publicUrl,
          created_at: f.created_at,
          size: f.metadata?.size || 0,
        })
      } else {
        // Subfolder — recurse.
        const sub = prefix ? `${prefix}/${f.name}` : f.name
        await walk(sub, depth + 1)
      }
      if (seen.length >= limit) return
    }
  }

  await walk('', 0)
  // Newest first if we have timestamps
  seen.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  return seen
}
