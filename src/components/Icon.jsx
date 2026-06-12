/* Icon set — minimal stroke icons. <Icon name="cart" /> */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
  cart: <><path d="M3 4h2l2.2 12.3a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6" /><circle cx="9.5" cy="20.5" r="1.4" /><circle cx="17.5" cy="20.5" r="1.4" /></>,
  heart: <path d="M12 20s-7-4.4-9.3-8.5C1 8.4 2.5 5 5.8 5c2 0 3.2 1.1 4.2 2.4C11 6.1 12.2 5 14.2 5 17.5 5 19 8.4 17.3 11.5 15 15.6 12 20 12 20Z" />,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.7-3.5 3.4-5.5 7-5.5s6.3 2 7 5.5" /></>,
  chevL: <path d="m14.5 6-6 6 6 6" />,
  chevR: <path d="m9.5 6 6 6-6 6" />,
  chevD: <path d="m6 9.5 6 6 6-6" />,
  arrowR: <path d="M4 12h15m-6-6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z" fill="currentColor" stroke="none" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19" /></>,
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />,
  fire: <path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c0-1 .8-2 .8-2 .7 1 2.2 2.3 2.2 4.8A5 5 0 1 1 7 11c1.8 1 2.5-.3 2.5-2C9.5 6.5 11 4.5 12 3Z" />,
  tag: <><path d="M3.5 11.5 11 4h6.5a2.5 2.5 0 0 1 2.5 2.5V13l-7.5 7.5a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8Z" /><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></>,
  truck: <><path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" /><circle cx="6.5" cy="17.5" r="1.6" /><circle cx="16.5" cy="17.5" r="1.6" /></>,
  shield: <path d="M12 3l7 2.5v5.5c0 5-3.4 8-7 9.5-3.6-1.5-7-4.5-7-9.5V5.5L12 3Z" />,
  code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4M13.5 5l-3 14" />,
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  check: <path d="m4 12 5 5 11-11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13h10l1-13" />,
  play: <path d="M7 5l12 7-12 7V5Z" fill="currentColor" stroke="none" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  gift: <><rect x="3.5" y="9" width="17" height="12" rx="1.5" /><path d="M3.5 13h17M12 9v12M12 9S10.5 4 7.8 5.2C6 6 7 9 9 9m3 0s1.5-5 4.2-3.8C18 6 17 9 15 9" /></>,
  spark: <path d="M12 3v6m0 6v6m9-9h-6m-6 0H3m13.5-6.5-3 3m-3 3-3 3m12 0-3-3m-3-3-3-3" />,
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />,
}

export default function Icon({ name, size, style, className }) {
  const p = paths[name]
  if (!p) return null
  return (
    <svg viewBox="0 0 24 24" width={size || 22} height={size || 22} className={className}
      style={style} {...P}>{p}</svg>
  )
}
