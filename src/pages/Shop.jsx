/* Shop / category listing with filters + sort */
import { useState, useMemo, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { ProductCard } from '../components/UI.jsx'
import { useShop, EGP } from '../context.js'
import { useSeo } from '../seo.js'

function Checkbox({ label, count, on, onClick }) {
  return (
    <div className={'fopt' + (on ? ' on' : '')} onClick={onClick}>
      <span className="fbox">{on ? <Icon name="check" size={13} /> : null}</span>
      <span>{label}</span>
      {count != null ? <span className="fcount">{count}</span> : null}
    </div>
  )
}

export default function Shop() {
  const shop = useShop()
  const params = shop.route.params || {}

  // Title reflects the active filter; canonical always points to the clean /shop
  // (filters are ?query strings → avoid duplicate-content). Search results are noindex.
  const filterLabel = params.platform || params.genre || params.type ||
    (params.sale ? 'On sale' : params.preowned ? 'Pre-owned' : '')
  const shopTitle = params.q
    ? `Search: ${params.q}`
    : filterLabel
      ? `${filterLabel} — Shop`
      : 'Shop all games, consoles & accessories'
  useSeo(
    {
      title: shopTitle,
      description: filterLabel
        ? `Browse ${filterLabel} at Crazy Game — genuine sealed copies, fast delivery across Egypt, cash on delivery.`
        : 'Shop video games, consoles, accessories and digital codes at Crazy Game Egypt. Fast delivery, genuine stock, cash on delivery.',
      path: '/shop',
      noindex: !!params.q,
    },
    [params.platform, params.genre, params.type, params.sale, params.preowned, params.q],
  )

  const [platSel, setPlatSel] = useState(params.platform ? [params.platform] : [])
  const [genreSel, setGenreSel] = useState(params.genre ? [params.genre] : [])
  const [typeSel, setTypeSel] = useState(params.type ? [params.type] : [])
  const [saleOnly, setSaleOnly] = useState(!!params.sale)
  const [preOwnedOnly, setPreOwnedOnly] = useState(!!params.preowned)

  // Dynamic price ceiling so expensive items (consoles, bundles) aren't hidden by default.
  const priceCeiling = useMemo(() => {
    const max = shop.allProducts.reduce((m, p) => Math.max(m, p.price || 0), 0)
    // Round up to nearest 1000 and add a little headroom
    return Math.max(5000, Math.ceil(max / 1000) * 1000)
  }, [shop.allProducts])
  const [maxPrice, setMaxPrice] = useState(priceCeiling)
  useEffect(() => { setMaxPrice(priceCeiling) }, [priceCeiling])
  const [sort, setSort] = useState(params.sort || 'featured')
  const [q] = useState(params.q || '')

  useEffect(() => {
    setPlatSel(params.platform ? [params.platform] : [])
    setGenreSel(params.genre ? [params.genre] : [])
    setTypeSel(params.type ? [params.type] : [])
    setSaleOnly(!!params.sale)
    setPreOwnedOnly(!!params.preowned)
    setSort(params.sort || 'featured')
  }, [params.platform, params.genre, params.type, params.sale, params.preowned, params.sort, params.q])

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  const counts = useMemo(() => {
    const pc = {}, gc = {}
    shop.allProducts.forEach(p => {
      p.platforms.forEach(pl => pc[pl] = (pc[pl] || 0) + 1)
      gc[p.genre] = (gc[p.genre] || 0) + 1
    })
    return { pc, gc }
  }, [shop.allProducts])

  const filtered = useMemo(() => {
    let list = shop.allProducts.filter(p => {
      if (platSel.length && !p.platforms.some(pl => platSel.includes(pl))) return false
      if (genreSel.length && !genreSel.includes(p.genre)) return false
      if (typeSel.length && !typeSel.includes(p.productType)) return false
      if (saleOnly && !(p.was && p.was > p.price)) return false
      if (preOwnedOnly && !(Array.isArray(p.tags) && p.tags.includes('preowned'))) return false
      if (p.price > maxPrice && p.price !== 0) return false
      if (q && !(p.title + ' ' + p.genre + ' ' + p.platform).toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    const s = {
      'price-low': (a, b) => (a.price || 1e9) - (b.price || 1e9),
      'price-high': (a, b) => b.price - a.price,
      'rating': (a, b) => b.rating - a.rating,
      'new': (a, b) => b.year - a.year,
      'featured': (a, b) => (b.tags.includes('featured') - a.tags.includes('featured')) || b.rating - a.rating,
    }[sort]
    return [...list].sort(s)
  }, [shop.allProducts, platSel, genreSel, typeSel, saleOnly, preOwnedOnly, maxPrice, sort, q])

  const title = q ? `Results for "${q}"`
    : typeSel.includes('console') ? 'Consoles'
    : typeSel.includes('accessory') ? 'Accessories'
    : platSel.length === 1 ? shop.platforms.find(p => p.key === platSel[0])?.name
    : genreSel.length === 1 ? genreSel[0] + ' games'
    : saleOnly ? 'On sale now' : 'All games'

  const activeChips = [
    ...platSel.map(v => ({ t: 'plat', v })),
    ...genreSel.map(v => ({ t: 'genre', v })),
    ...typeSel.map(v => ({ t: 'type', v })),
    ...(saleOnly ? [{ t: 'sale', v: 'On sale' }] : [])
  ]

  function clearAll() { setPlatSel([]); setGenreSel([]); setTypeSel([]); setSaleOnly(false); setPreOwnedOnly(false); setMaxPrice(priceCeiling) }

  return (
    <div className="page wrap" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="crumb">
        <a onClick={() => shop.goHome()}>Home</a> <Icon name="chevR" /> <span>{title}</span>
      </div>

      <div className="section-head" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)' }}>{title}</h1>
          <div className="sub">{filtered.length} {filtered.length === 1 ? 'title' : 'titles'} available</div>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="filter-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-display)', fontWeight: 700 }}><Icon name="filter" size={18} /> Filters</div>
            {activeChips.length ? <button className="faint" style={{ fontSize: 13, fontWeight: 600 }} onClick={clearAll}>Clear</button> : null}
          </div>

          <div className="filter-group">
            <h5>Platform</h5>
            {shop.platforms.map(pl => <Checkbox key={pl.key} label={pl.name} count={counts.pc[pl.key] || 0} on={platSel.includes(pl.key)} onClick={() => toggle(platSel, setPlatSel, pl.key)} />)}
          </div>

          <div className="filter-group">
            <h5>Genre</h5>
            {shop.genres.filter(g => counts.gc[g]).map(g => <Checkbox key={g} label={g} count={counts.gc[g]} on={genreSel.includes(g)} onClick={() => toggle(genreSel, setGenreSel, g)} />)}
          </div>

          <div className="filter-group">
            <h5>Max price — {maxPrice >= priceCeiling ? 'No limit' : EGP(maxPrice)}</h5>
            <input type="range" min="300" max={priceCeiling} step="100" value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }} />
          </div>

          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <Checkbox label="On sale only" on={saleOnly} onClick={() => setSaleOnly(!saleOnly)} />
          </div>
        </aside>

        <div>
          <div className="shop-toolbar">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeChips.length ? activeChips.map((c, i) => (
                <span key={i} className="chip active" style={{ cursor: 'pointer', textTransform: c.t === 'type' ? 'capitalize' : 'none' }}
                  onClick={() => {
                    if (c.t === 'plat') toggle(platSel, setPlatSel, c.v);
                    else if (c.t === 'genre') toggle(genreSel, setGenreSel, c.v);
                    else if (c.t === 'type') toggle(typeSel, setTypeSel, c.v);
                    else setSaleOnly(false)
                  }}>
                  {c.v} <Icon name="close" size={13} />
                </span>
              )) : <span className="muted" style={{ fontSize: 14 }}>Showing everything</span>}
            </div>
            <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="new">Newest</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {filtered.length ? (
            <div className="product-grid">
              {filtered.map(p => <ProductCard key={p.id} p={p} w="100%" />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-faint)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><Icon name="search" size={48} /></div>
              <h3 style={{ marginBottom: 8 }}>No games match those filters</h3>
              <button className="btn btn-ghost" onClick={clearAll}>Reset filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
