/* Admin Dashboard — /dashboard
   Material Dashboard 2 React look, MUI-based. Supabase Auth gated. */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Box, Card, CardContent, Grid, Typography, Divider, IconButton,
  TextField, MenuItem, Button, Chip, Stack, Avatar, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, Drawer, AppBar, Toolbar,
  InputAdornment, Table, TableBody, TableCell, TableHead, TableRow,
  ThemeProvider, CssBaseline, Switch, FormControlLabel, Alert, Tooltip, Checkbox,
  Badge, Popover,
} from '@mui/material'
// Tree-shaken SVG icons (no font dependency)
import DashboardIcon       from '@mui/icons-material/Dashboard'
import BoltIcon            from '@mui/icons-material/Bolt'
import ViewQuiltIcon       from '@mui/icons-material/ViewQuilt'
import Inventory2Icon      from '@mui/icons-material/Inventory2'
import PeopleIcon          from '@mui/icons-material/People'
import SettingsIcon        from '@mui/icons-material/Settings'
import SportsEsportsIcon   from '@mui/icons-material/SportsEsports'
import CheckIcon           from '@mui/icons-material/Check'
import CheckCircleIcon     from '@mui/icons-material/CheckCircle'
import OpenInNewIcon       from '@mui/icons-material/OpenInNew'
import LogoutIcon          from '@mui/icons-material/Logout'
import LocalOfferIcon      from '@mui/icons-material/LocalOffer'
import PersonAddIcon       from '@mui/icons-material/PersonAdd'
import RocketLaunchIcon    from '@mui/icons-material/RocketLaunch'
import StorefrontIcon      from '@mui/icons-material/Storefront'
import StorageIcon         from '@mui/icons-material/Storage'
import VisibilityIcon      from '@mui/icons-material/Visibility'
import ViewCarouselIcon    from '@mui/icons-material/ViewCarousel'
import ImageIcon           from '@mui/icons-material/Image'
import StarIcon            from '@mui/icons-material/Star'
import CloudUploadIcon     from '@mui/icons-material/CloudUpload'
import ArrowBackIcon       from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon    from '@mui/icons-material/ArrowForward'
import CloseIcon           from '@mui/icons-material/Close'
import CollectionsIcon     from '@mui/icons-material/Collections'
import SmartDisplayIcon    from '@mui/icons-material/SmartDisplay'
import DeleteIcon          from '@mui/icons-material/Delete'
import AddIcon             from '@mui/icons-material/Add'
import AddBoxIcon          from '@mui/icons-material/AddBox'
import EditIcon            from '@mui/icons-material/Edit'
import SearchIcon          from '@mui/icons-material/Search'
import RestartAltIcon      from '@mui/icons-material/RestartAlt'
import PlayArrowIcon       from '@mui/icons-material/PlayArrow'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import ArticleIcon         from '@mui/icons-material/Article'
import MailOutlineIcon     from '@mui/icons-material/MailOutlined'
import ReceiptLongIcon     from '@mui/icons-material/ReceiptLong'
import LocalShippingIcon   from '@mui/icons-material/LocalShipping'
import NotificationsIcon   from '@mui/icons-material/Notifications'
import WarningAmberIcon    from '@mui/icons-material/WarningAmber'
import FiberNewIcon        from '@mui/icons-material/FiberNew'
// Platform brand SVGs (clean, scalable)
import playstationLogo from '../assets/background/playstation-svgrepo-com.svg'
import switch1Logo     from '../assets/background/nintendo-switch-svgrepo-com.svg'
import switch2Logo     from '../assets/background/nintendo-switch2-svgrepo-com.svg'
import heroBgImg       from '../assets/herosection.png'
import { useShop, EGP } from '../context.js'
import { useSeo } from '../seo.js'
import { saveSettings, uploadHeroImage, DEFAULT_SETTINGS } from '../settings.js'
import { supabase } from '../supabase.js'
import { listCustomers, isAdmin, signIn, signOut } from '../auth.js'
import { uploadProductImage, listProductImages, isYouTube, youtubeThumb } from '../upload.js'
import RichTextEditor from '../components/RichTextEditor.jsx'
import { mdTheme, gradients, COLORS } from '../dashboard/theme.js'
import { StatCard, PanelCard, PlainCard } from '../dashboard/md.jsx'

const DRAWER_WIDTH = 250

// Resolve the platform brand logo for a product.
// Looks at platform + title + categories, in that order.
function productPlatformInfo(prod) {
  const platform = (prod?.platform || '').toLowerCase()
  const title    = (prod?.title    || '').toLowerCase()
  const cats     = (prod?.categories || []).join(' ').toLowerCase()
  const haystack = `${platform} ${title} ${cats}`

  // Switch 2 first (so "switch 2" doesn't fall through to plain "switch")
  if (/switch\s*2/.test(haystack)) return { src: switch2Logo, label: 'Switch 2', bg: '#cc0000' }

  // Nintendo digital codes — eShop, Switch Online, Nintendo cards → Switch 1 logo
  if (/eshop|nintendo|switch\s*online/.test(haystack)) return { src: switch1Logo, label: 'Nintendo', bg: '#e60012' }

  // Plain Switch
  if (/\bswitch\b/.test(haystack)) return { src: switch1Logo, label: 'Switch', bg: '#e60012' }

  // PlayStation family
  if (platform === 'ps5' || /\bps5\b|playstation\s*5/.test(haystack)) return { src: playstationLogo, label: 'PS5', bg: '#0070d1' }
  if (platform === 'ps4' || /\bps4\b|playstation\s*4/.test(haystack)) return { src: playstationLogo, label: 'PS4', bg: '#003087' }
  if (/playstation|psn|\bps\b/.test(haystack))
    return { src: playstationLogo, label: prod?.platform || 'PSN', bg: '#0070d1' }

  return null
}

// Small inline platform badge — colored pill with the brand logo
function PlatformBadge({ product, platform }) {
  // Backward-compat: still accept a bare platform string
  const info = product ? productPlatformInfo(product) : productPlatformInfo({ platform })
  if (!info) {
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        background: '#6c757d', color: '#fff',
        px: 0.75, py: 0.25, borderRadius: 0.75,
        fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em',
      }}>
        <SportsEsportsOutlinedIcon sx={{ fontSize: 12 }} />
        {product?.platform || platform || 'Other'}
      </Box>
    )
  }
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      background: info.bg, color: '#fff',
      px: 0.75, py: 0.25, borderRadius: 0.75,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em',
    }}>
      <Box component="img" src={info.src} alt={info.label} sx={{
        width: 14, height: 14, objectFit: 'contain',
        filter: 'brightness(0) invert(1)',  // force white logo
      }} />
      {info.label}
    </Box>
  )
}

// Shared pill-field style — used for toolbar search/filter inputs on gradient panels
const pillFieldSx = (width) => ({
  width,
  background: 'rgba(0, 0, 0, 0.25)',
  borderRadius: '20px',
  boxShadow: 'none',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxSizing: 'border-box',
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px', height: 38, paddingLeft: 1.5,
    color: '#ffffff',
  },
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiInputBase-input': {
    py: 0, fontSize: 13.5, fontWeight: 500, color: '#ffffff',
    '&::placeholder': { color: 'rgba(255, 255, 255, 0.65)', opacity: 1 },
  },
  '& .MuiSelect-select': {
    py: 0, pl: 0.5, fontSize: 13.5, fontWeight: 600,
    color: '#ffffff !important',
    display: 'flex', alignItems: 'center', minHeight: '38px !important',
  },
  '& .MuiSelect-select span': { color: '#ffffff !important' },
  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7) !important' },
  '& .MuiInputAdornment-root svg': { color: 'rgba(255, 255, 255, 0.7) !important' },
})

// ── Login (gradient brand panel like MD2 React auth pages) ──────────────────
function LoginScreen({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await signIn({ email, password: pw })
    if (!res.ok) { setBusy(false); setErr(res.error); return }
    const admin = await isAdmin(res.user.id)
    setBusy(false)
    if (!admin) { setErr('This account is not an admin.'); return }
    onAuthed(res.user)
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      position: 'relative',
      backgroundImage: `url(${heroBgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      p: 3,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(30,15,60,0.5) 0%, rgba(6,3,15,0.92) 100%)',
        zIndex: 1,
      },
      '& > *': {
        position: 'relative',
        zIndex: 2,
      }
    }}>
      <Card sx={{
        width: 'min(420px, 100%)',
        overflow: 'visible',
        background: 'rgba(12, 6, 26, 0.65)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6)',
        borderRadius: '20px',
      }}>
        <Box sx={{
          mt: -3, mx: 2, py: 3, borderRadius: '14px',
          background: 'linear-gradient(135deg, #ff8c00 0%, #f52200 100%)',
          color: '#fff', textAlign: 'center',
          boxShadow: '0 6px 20px rgba(245, 34, 0, 0.4)',
        }}>
          <Typography variant="h4" sx={{ color: '#fff', mb: 0.5, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Sign in</Typography>
          <Typography variant="body2" sx={{ color: '#fff', opacity: 0.85, fontWeight: 500 }}>
            Crazy Game Admin
          </Typography>
        </Box>
        <CardContent component="form" onSubmit={submit} sx={{ pt: 4, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            size="small"
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ff8c00' },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#ff8c00' },
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            size="small"
            value={pw}
            onChange={e => setPw(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#ff8c00' },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#ff8c00' },
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }
            }}
          />
          {err && <Alert severity="error" sx={{ py: 0.5, borderRadius: '8px' }}>{err}</Alert>}
          <Button
            type="submit"
            disabled={busy}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #f52200 100%)',
              color: '#fff',
              mt: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(245, 34, 0, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff9d24 0%, #ff3714 100%)',
                boxShadow: '0 6px 22px rgba(245, 34, 0, 0.55)',
              },
            }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', mt: 1 }}>
            Admins are managed in the <code style={{ color: '#ff8c00', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>admins</code> Supabase table
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

// ── Sidenav ─────────────────────────────────────────────────────────────────
const NAV = [
  { key: 'overview',  label: 'Dashboard',  icon: DashboardIcon },
  { key: 'hero',      label: 'Hero',       icon: BoltIcon },
  { key: 'sections',  label: 'Sections',   icon: ViewQuiltIcon },
  { key: 'products',  label: 'Products',   icon: Inventory2Icon },
  { key: 'orders',    label: 'Orders',     icon: ReceiptLongIcon },
  { key: 'blog',      label: 'Blog',       icon: ArticleIcon },
  { key: 'requests',  label: 'Requests',   icon: MailOutlineIcon },
  { key: 'customers', label: 'Customers',  icon: PeopleIcon },
  { key: 'settings',  label: 'Settings',   icon: SettingsIcon },
]

function Sidenav({ page, setPage, user }) {
  return (
    <Drawer variant="permanent"
      sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH, boxSizing: 'border-box',
          background: 'linear-gradient(195deg, #42424a, #191919)',
          color: '#fff', border: 'none',
          m: 2, height: 'calc(100vh - 32px)', borderRadius: '12px',
          boxShadow: '0 20px 27px 0 rgba(0,0,0,.05)',
        },
      }}>
      <Box sx={{ px: 3, py: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1,
            background: gradients.info, display: 'grid', placeItems: 'center',
          }}>
            <SportsEsportsIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography variant="button" sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            Crazy Game
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ background: 'rgba(255,255,255,0.15)', mx: 2, mb: 1 }} />
      <List sx={{ px: 2 }}>
        {NAV.map(item => {
          const active = page === item.key
          const NavIcon = item.icon
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => setPage(item.key)} sx={{
                borderRadius: 1.5, py: 1.25,
                background: active ? gradients.info : 'transparent',
                boxShadow: active ? '0 4px 20px 0 rgba(245,34,0,.4)' : 'none',
                '&:hover': { background: active ? gradients.info : 'rgba(255,255,255,0.1)' },
              }}>
                <ListItemIcon sx={{ minWidth: 36, color: '#fff' }}>
                  <NavIcon sx={{ color: '#fff' }} />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{
                  fontSize: 14, fontWeight: 600, color: '#fff',
                }} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Card sx={{
          background: 'rgba(255,255,255,0.05)', boxShadow: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, background: gradients.info, fontSize: 14 }}>
                {(user?.email || '?')[0].toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{user?.email}</Typography>
                <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Administrator</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Drawer>
  )
}

// ── Notifications ───────────────────────────────────────────────────────────
function useNotifications() {
  const shop = useShop()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const dismissedRef = useRef(new Set())

  const refresh = useCallback(async () => {
    try {
      const notes = []

      // 1. New orders (status = 'new')
      const { data: newOrders } = await supabase
        .from('orders').select('id, customer_name, total, created_at')
        .eq('status', 'new').order('created_at', { ascending: false }).limit(20)
      if (newOrders) {
        for (const o of newOrders) {
          const nid = `order-${o.id}`
          if (!dismissedRef.current.has(nid)) {
            notes.push({
              id: nid, type: 'order', page: 'orders', entityId: o.id,
              icon: ReceiptLongIcon, color: 'info',
              title: `New order #${o.id}`,
              body: `${o.customer_name} — ${EGP(Number(o.total) || 0)}`,
              time: o.created_at,
            })
          }
        }
      }

      // 2. New requests (status = 'new')
      const { data: newReqs } = await supabase
        .from('requests').select('id, name, game_title, created_at')
        .eq('status', 'new').order('created_at', { ascending: false }).limit(20)
      if (newReqs) {
        for (const r of newReqs) {
          const nid = `request-${r.id}`
          if (!dismissedRef.current.has(nid)) {
            notes.push({
              id: nid, type: 'request', page: 'requests', entityId: r.id,
              icon: MailOutlineIcon, color: 'warning',
              title: 'New game request',
              body: `${r.name} wants "${r.game_title}"`,
              time: r.created_at,
            })
          }
        }
      }

      // 3. Out of stock products
      const outOfStock = (shop.allProducts || []).filter(p =>
        (p.stock != null && p.stock <= 0) || p.in_stock === false
      )
      for (const p of outOfStock.slice(0, 10)) {
        const nid = `oos-${p.id}`
        if (!dismissedRef.current.has(nid)) {
          notes.push({
            id: nid, type: 'stock', page: 'products', entityId: p.id,
            icon: WarningAmberIcon, color: 'error',
            title: 'Out of stock',
            body: p.title,
            time: null,
          })
        }
      }

      // sort by time, newest first (nulls last)
      notes.sort((a, b) => {
        if (!a.time && !b.time) return 0
        if (!a.time) return 1
        if (!b.time) return -1
        return new Date(b.time) - new Date(a.time)
      })

      setItems(notes)
    } catch (e) {
      console.error('Notification fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [shop.allProducts])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000) // refresh every 60s
    return () => clearInterval(interval)
  }, [refresh])

  const dismiss = useCallback((id) => {
    dismissedRef.current.add(id)
    setItems(prev => prev.filter(n => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    for (const n of items) dismissedRef.current.add(n.id)
    setItems([])
  }, [items])

  return { items, loading, dismiss, dismissAll, refresh }
}

function NotificationBell({ notifications, onNavigate }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const count = notifications.items.length

  function timeAgo(ts) {
    if (!ts) return ''
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const colorMap = { info: '#1a73e8', warning: '#fb8c00', error: '#ef4444', success: '#4caf50' }

  return (
    <>
      <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}
        sx={{ color: count > 0 ? 'info.main' : 'text.secondary' }}>
        <Badge badgeContent={count} color="error" max={99}
          sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: {
          sx: { width: 360, maxHeight: 420, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,.12)', overflow: 'hidden' }
        }}}>
        <Box sx={{
          px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid', borderColor: 'divider',
          background: 'linear-gradient(195deg, #42424a, #191919)', color: '#fff',
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            Notifications {count > 0 && `(${count})`}
          </Typography>
          {count > 0 && (
            <Button size="small" sx={{ color: 'rgba(255,255,255,.7)', fontSize: 11, textTransform: 'none' }}
              onClick={() => notifications.dismissAll()}>Clear all</Button>
          )}
        </Box>
        <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
          {count === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">All caught up!</Typography>
            </Box>
          ) : (
            notifications.items.map(n => {
              const NIcon = n.icon
              return (
                <Box key={n.id} sx={{
                  display: 'flex', gap: 1.5, px: 2, py: 1.25,
                  borderBottom: '1px solid', borderColor: 'divider',
                  cursor: 'pointer', transition: 'background .15s',
                  '&:hover': { background: 'rgba(26,115,232,.04)' },
                }} onClick={() => { onNavigate(n.page, n.entityId, n.type); setAnchorEl(null) }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `${colorMap[n.color] || colorMap.info}15`,
                    color: colorMap[n.color] || colorMap.info,
                    display: 'grid', placeItems: 'center',
                  }}>
                    <NIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{n.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.body}
                    </Typography>
                    {n.time && (
                      <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.25 }}>
                        {timeAgo(n.time)}
                      </Typography>
                    )}
                  </Box>
                  <Tooltip title="Dismiss">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); notifications.dismiss(n.id) }}
                      sx={{ alignSelf: 'center', color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            })
          )}
        </Box>
      </Popover>
    </>
  )
}

// ── Top navbar ──────────────────────────────────────────────────────────────
function TopBar({ title, onSave, saving, dirty, savedAt, saveErr, onLogout, notifications, onNotificationNavigate }) {
  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: 'transparent', color: 'text.primary',
      mb: 4,
    }}>
      <Toolbar disableGutters sx={{
        background: 'rgba(18, 10, 34, 0.65)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        borderRadius: '12px',
        minHeight: '56px !important', px: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 11 }}>
            Pages / {title}
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.primary', lineHeight: 1.1 }}>{title}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {savedAt > 0 && Date.now() - savedAt < 3000 && (
            <Chip label="Saved" color="success" size="small" icon={<CheckIcon />} />
          )}
          {saveErr && <Chip label={saveErr} color="error" size="small" />}
          {notifications && <NotificationBell notifications={notifications} onNavigate={onNotificationNavigate} />}
          <Button component="a" href="/" target="_blank" rel="noreferrer"
            variant="outlined" size="small" startIcon={<OpenInNewIcon />}>
            View site
          </Button>
          {onSave && (
            <Button onClick={onSave} disabled={saving || !dirty}
              variant="contained" size="small"
              sx={{ background: gradients.info, '&:hover': { background: gradients.info, opacity: 0.92 } }}>
              {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </Button>
          )}
          <IconButton onClick={onLogout} size="small" sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

// ── Page: Overview ──────────────────────────────────────────────────────────
function OverviewPage() {
  const shop = useShop()
  const [customerCount, setCustomerCount] = useState(null)
  const [recentCustomers, setRecentCustomers] = useState([])

  useEffect(() => {
    listCustomers().then(rows => {
      setCustomerCount(rows.length)
      setRecentCustomers(rows.slice(0, 5))
    }).catch(() => {})
  }, [])

  const P = shop.allProducts
  const inStock = P.filter(p => p.inStock).length
  const onSale = P.filter(p => p.was && p.was > p.price).length
  const games = P.filter(p => p.productType === 'game').length

  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard color="dark" icon={Inventory2Icon} title="Total Products" count={P.length}
            percentage={{ color: 'success.main', amount: `${games}`, label: 'games tracked' }} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard color="success" icon={CheckCircleIcon} title="In Stock" count={inStock}
            percentage={{ color: 'error.main', amount: `${P.length - inStock}`, label: 'out of stock' }} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard color="warning" icon={LocalOfferIcon} title="On Sale" count={onSale}
            percentage={{ color: 'success.main', amount: '', label: 'active discounts' }} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard color="primary" icon={PeopleIcon} title="Customers" count={customerCount ?? '—'}
            percentage={{ color: 'success.main', amount: '+', label: 'registered accounts' }} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <PanelCard title="Recent customers" color="info" icon={PersonAddIcon}>
            {recentCustomers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No customers yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary' }}>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCustomers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{c.full_name || '—'}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </PanelCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <PanelCard title="Quick actions" color="dark" icon={RocketLaunchIcon}>
            <Stack spacing={1.5}>
              <Button component="a" href="/" target="_blank" rel="noreferrer"
                variant="outlined" fullWidth startIcon={<StorefrontIcon />}>
                Open public site
              </Button>
              <Button component="a" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
                variant="outlined" fullWidth startIcon={<StorageIcon />}>
                Supabase
              </Button>
            </Stack>
          </PanelCard>
        </Grid>
      </Grid>
    </Box>
  )
}

// ── Category picker ─────────────────────────────────────────────────────────
const BASELINE_CATEGORIES = [
  'Action', 'Adventure', 'RPG', 'Shooter', 'Racing',
  'Sports', 'Horror', 'Casual', 'Fighting', 'Strategy', 'Indie',
  'PS5', 'PS4', 'Switch', 'Switch 2', 'Xbox',
  'Accessories', 'Consoles', 'Digital Code', 'PSN Digital', 'eShop', 'Membership',
]

function CategoryPicker({ value, onChange }) {
  const shop = useShop()
  const [newCat, setNewCat] = useState('')
  const allCats = useMemo(() => {
    const set = new Set(BASELINE_CATEGORIES)
    for (const p of shop.allProducts) for (const c of (p.categories || [])) set.add(c)
    for (const c of value) set.add(c)
    return [...set].sort()
  }, [shop.allProducts, value])
  const toggle = (c) => onChange(value.includes(c) ? value.filter(x => x !== c) : [...value, c])
  const addNew = () => { const t = newCat.trim(); if (t && !value.includes(t)) { onChange([...value, t]); setNewCat('') } }

  return (
    <Box>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {allCats.map(c => {
          const on = value.includes(c)
          return (
            <Chip key={c} label={c} onClick={() => toggle(c)} size="small"
              color={on ? 'info' : 'default'} variant={on ? 'filled' : 'outlined'}
              icon={on ? <CheckIcon /> : undefined} />
          )
        })}
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField size="small" fullWidth value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNew())}
          placeholder="Add a new category…" />
        <Button variant="outlined" onClick={addNew} startIcon={<AddIcon />}>Add</Button>
      </Stack>
    </Box>
  )
}

// ── Media library ───────────────────────────────────────────────────────────
function MediaPicker({ onPick, onClose }) {
  const [items, setItems] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const load = () => {
    setItems(null); setErr('')
    listProductImages().then(setItems).catch(e => setErr(e.message))
  }
  useEffect(load, [])
  const filtered = useMemo(() => {
    if (!items) return []
    const t = q.toLowerCase().trim()
    return t ? items.filter(it => it.name.toLowerCase().includes(t)) : items
  }, [items, q])

  return (
    <Box onClick={onClose} sx={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 1300, display: 'grid', placeItems: 'center', p: 2,
    }}>
      <Card onClick={e => e.stopPropagation()} sx={{
        width: 'min(1000px, 100%)', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }}>
        <Box sx={{
          p: 2, borderBottom: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Typography variant="h6" sx={{ flex: 1 }}>Media library</Typography>
          <TextField size="small" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} sx={{ width: 240 }} />
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {err && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
              action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
              {err}
            </Alert>
          )}
          {!items && !err && <Typography color="text.secondary">Loading…</Typography>}
          {items && items.length === 0 && !err && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>Bucket appears empty.</Typography>
              <Typography variant="caption" color="text.secondary">
                Run <code>scripts/product-images-policies.sql</code> if list permission is missing.
              </Typography>
              <Box sx={{ mt: 2 }}><Button size="small" variant="outlined" onClick={load}>Retry</Button></Box>
            </Box>
          )}
          {filtered.length > 0 && (
            <Grid container spacing={1.5}>
              {filtered.map(it => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} key={it.name}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                    onClick={() => onPick(it.url)}>
                    <Box sx={{ aspectRatio: '1 / 1', background: `#000 url(${it.url}) center/cover no-repeat` }} />
                    <Box sx={{ px: 1, py: 0.75 }}>
                      <Typography variant="caption" sx={{
                        display: 'block', color: 'text.secondary',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{it.name}</Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Card>
    </Box>
  )
}

// ── Single image picker (cover image) ───────────────────────────────────────
function ImagePickerField({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [showMedia, setShowMedia] = useState(false)
  async function handleUpload(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploading(true); setErr('')
    try { const { url } = await uploadProductImage(file); onChange(url) }
    catch (ex) { setErr(ex.message || 'Upload failed') }
    finally { setUploading(false) }
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 2 }}>
      <Box sx={{
        aspectRatio: '3/4', borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
        background: value ? `url(${value}) center/cover no-repeat` : 'grey.200',
        display: 'grid', placeItems: 'center', color: 'text.secondary', fontSize: 12,
      }}>{!value && 'No image'}</Box>
      <Stack spacing={1.5}>
        <Button variant="contained" component="label"
          startIcon={<CloudUploadIcon />} disabled={uploading}
          sx={{ background: gradients.info, '&:hover': { background: gradients.info, opacity: 0.92 } }}>
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
          {uploading ? 'Uploading…' : 'Upload image'}
        </Button>
        <Button variant="outlined" onClick={() => setShowMedia(true)} startIcon={<CollectionsIcon />}>
          Pick from Media library
        </Button>
        {value && <Button color="error" onClick={() => onChange('')} startIcon={<DeleteIcon />}>Remove</Button>}
        {err && <Alert severity="error">{err}</Alert>}
        <Typography variant="caption" color="text.secondary">
          Auto-converts to WebP. Stored in <code>product-images</code>.
        </Typography>
      </Stack>
      {showMedia && <MediaPicker onClose={() => setShowMedia(false)} onPick={u => { onChange(u); setShowMedia(false) }} />}
    </Box>
  )
}

// ── Lightbox for click-to-zoom preview ──────────────────────────────────────
function MediaLightbox({ url, onClose }) {
  const yt = isYouTube(url)
  return (
    <Box onClick={onClose} sx={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 1400, display: 'grid', placeItems: 'center', p: 3,
    }}>
      <IconButton onClick={onClose} sx={{
        position: 'absolute', top: 16, right: 16, color: '#fff',
        background: 'rgba(255,255,255,0.1)',
        '&:hover': { background: 'rgba(255,255,255,0.2)' },
      }}><CloseIcon /></IconButton>
      <Box onClick={e => e.stopPropagation()} sx={{
        width: 'min(1200px, 95vw)',
        aspectRatio: '16/9', maxHeight: '85vh',
        background: '#000', borderRadius: 2, overflow: 'hidden',
        boxShadow: '0 30px 90px rgba(0,0,0,.6)',
      }}>
        {yt ? (
          <iframe src={`https://www.youtube.com/embed/${url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)?.[1]}?autoplay=1`}
            style={{ width: '100%', height: '100%', border: 0 }}
            allow="autoplay; encrypted-media" allowFullScreen />
        ) : (
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        )}
      </Box>
    </Box>
  )
}

// ── Multi-image picker (gallery / screenshots) — image OR YouTube ───────────
function MultiImagePicker({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [showMedia, setShowMedia] = useState(false)
  const [zoomUrl, setZoomUrl] = useState(null)
  const removeAt = (i) => onChange(value.filter((_, idx) => idx !== i))
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= value.length) return
    const next = [...value]; [next[i], next[j]] = [next[j], next[i]]; onChange(next)
  }
  async function handleUpload(e) {
    const files = Array.from(e.target.files || []); e.target.value = ''
    if (!files.length) return
    setUploading(true); setErr('')
    try { const urls = []; for (const f of files) { const { url } = await uploadProductImage(f); urls.push(url) } onChange([...value, ...urls]) }
    catch (ex) { setErr(ex.message || 'Upload failed') } finally { setUploading(false) }
  }
  function addYT() {
    const url = window.prompt('YouTube video URL', 'https://www.youtube.com/watch?v=')
    if (!url || !isYouTube(url)) { alert('Not a valid YouTube URL.'); return }
    onChange([...value, url])
  }

  const imageCount = value.filter(u => !isYouTube(u)).length
  const videoCount = value.filter(u => isYouTube(u)).length

  return (
    <Box>
      {value.length > 0 ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          mb: 1.5, p: 1.25, borderRadius: 1.5,
          background: 'grey.100', border: '1px solid', borderColor: 'divider',
        }}>
          <CollectionsIcon sx={{ color: 'info.main' }} />
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
            {value.length} item{value.length === 1 ? '' : 's'} in gallery
          </Typography>
          <Chip size="small" label={`${imageCount} image${imageCount === 1 ? '' : 's'}`} color="success" variant="outlined" />
          <Chip size="small" label={`${videoCount} video${videoCount === 1 ? '' : 's'}`} color="error" variant="outlined" />
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Click any thumbnail to preview · ← → to reorder
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          mb: 1.5, p: 2.5, borderRadius: 1.5, textAlign: 'center',
          border: '2px dashed', borderColor: 'divider', background: 'grey.100',
        }}>
          <CollectionsIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            No screenshots or videos yet. Upload images, pick from your media library, or paste a YouTube URL.
          </Typography>
        </Box>
      )}

      {value.length > 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 1.5, mb: 1.5,
        }}>
          {value.map((url, i) => {
            const yt = isYouTube(url)
            const thumb = yt ? youtubeThumb(url) : url
            return (
              <Box key={url + i} sx={{
                position: 'relative', borderRadius: 1.5, overflow: 'hidden',
                background: '#000', border: '1px solid', borderColor: 'divider',
                boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                transition: 'transform .15s, box-shadow .15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,.15)' },
              }}>
                {/* Clickable image area — explicit height so the preview always shows */}
                <Box onClick={() => setZoomUrl(url)} sx={{
                  position: 'relative', width: '100%', height: 160,
                  cursor: 'zoom-in', display: 'block',
                  backgroundImage: `url(${thumb})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: '#1a1a1a',
                }}>
                  {/* Fallback img tag for browsers that fail to load via CSS background */}
                  <img src={thumb} alt="" loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block', opacity: 0,
                    }} />
                  {yt && (
                    <Box sx={{
                      position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                      background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
                      pointerEvents: 'none',
                    }}>
                      <Box sx={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'rgba(255,0,0,0.9)', color: '#fff',
                        display: 'grid', placeItems: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,.4)',
                      }}>
                        <PlayArrowIcon sx={{ fontSize: 30, ml: 0.25 }} />
                      </Box>
                    </Box>
                  )}
                  {/* Index badge */}
                  <Box sx={{
                    position: 'absolute', top: 6, left: 6,
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    px: 0.75, py: 0.25, borderRadius: 0.75, fontSize: 11, fontWeight: 700,
                  }}>#{i + 1}</Box>
                  {/* Type chip */}
                  <Chip size="small" label={yt ? 'VIDEO' : 'IMAGE'}
                    color={yt ? 'error' : 'success'}
                    sx={{
                      position: 'absolute', bottom: 6, left: 6,
                      height: 20, fontSize: 10, fontWeight: 700,
                    }} />
                </Box>

                {/* Toolbar — always visible, never overlaps the image */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 1, py: 0.75, background: '#fff', gap: 0.5,
                }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Move left">
                      <span>
                        <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0}>
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move right">
                      <span>
                        <IconButton size="small" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Tooltip title="Remove">
                    <IconButton size="small" color="error" onClick={() => removeAt(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" component="label" disabled={uploading}
          startIcon={<CloudUploadIcon />}
          sx={{ background: gradients.info, '&:hover': { background: gradients.info, opacity: 0.92 } }}>
          <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        <Button variant="outlined" onClick={() => setShowMedia(true)} startIcon={<CollectionsIcon />}>Media library</Button>
        <Button variant="outlined" color="error" onClick={addYT} startIcon={<SmartDisplayIcon />}>YouTube</Button>
      </Stack>
      {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
      {showMedia && <MediaPicker onClose={() => setShowMedia(false)} onPick={u => { onChange([...value, u]); setShowMedia(false) }} />}
      {zoomUrl && <MediaLightbox url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </Box>
  )
}
const miniBtnSx = { background: 'rgba(0,0,0,0.7)', color: '#fff', width: 26, height: 26, '&:hover': { background: 'rgba(0,0,0,0.85)' } }

// ── Status helpers ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'new',       label: 'New release' },
  { value: 'preowned',  label: 'Pre-Owned' },
  { value: 'preorder',  label: 'Coming soon / Pre-order' },
]
function getStatus(p) {
  const t = p?.tags || []
  // Upcoming/preorder = truly unavailable. 'new' alone = still available (just a badge).
  if (t.includes('upcoming') || t.includes('preorder')) return 'preorder'
  if (t.includes('preowned')) return 'preowned'
  if (t.includes('new')) return 'new'
  return 'available'
}
function setStatusOnTags(t, s) {
  const out = (t || []).filter(x => !['new', 'upcoming', 'preorder', 'preowned'].includes(x))
  if (s === 'new') out.push('new')
  if (s === 'preowned') out.push('preowned')
  if (s === 'preorder') { out.push('upcoming'); out.push('preorder') }
  return out
}
const BLANK_PRODUCT = {
  id: null, title: '', slug: '', price: 0, was: null, stock: null, inStock: true,
  productType: 'game', platform: 'PS5', categories: [], tags: [],
  img: '', screenshots: [], blurb: '', description: '', brand: '',
}

// ── Page: Hero ──────────────────────────────────────────────────────────────
function HeroPage({ settings, setSettings }) {
  const shop = useShop()
  const hero = settings.hero
  const update = (patch) => setSettings({ ...settings, hero: { ...hero, ...patch } })
  const updateImg = (patch) => update({ customImage: { ...hero.customImage, ...patch } })
  const [uploading, setUploading] = useState(false)
  async function handleUpload(e) {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return; setUploading(true)
    try { updateImg({ url: await uploadHeroImage(f) }) }
    catch (ex) { alert(ex.message) } finally { setUploading(false) }
  }

  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PanelCard title="Hero mode" color="info" icon={VisibilityIcon}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button onClick={() => update({ mode: 'carousel' })}
                variant={hero.mode === 'carousel' ? 'contained' : 'outlined'}
                startIcon={<ViewCarouselIcon />}
                sx={hero.mode === 'carousel' ? { background: gradients.info, '&:hover': { background: gradients.info } } : null}>
                Product carousel
              </Button>
              <Button onClick={() => update({ mode: 'custom-image' })}
                variant={hero.mode === 'custom-image' ? 'contained' : 'outlined'}
                startIcon={<ImageIcon />}
                sx={hero.mode === 'custom-image' ? { background: gradients.info, '&:hover': { background: gradients.info } } : null}>
                Custom image
              </Button>
              <Button onClick={() => update({ mode: 'mixed' })}
                variant={hero.mode === 'mixed' ? 'contained' : 'outlined'}
                startIcon={<CollectionsIcon />}
                sx={hero.mode === 'mixed' ? { background: gradients.info, '&:hover': { background: gradients.info } } : null}>
                Mixed (both)
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.6 }}>
              <strong>Mixed</strong> mode shows your custom image as the first slide and rotates through the featured products after it.
            </Typography>
          </PanelCard>
        </Grid>

        {(hero.mode === 'carousel' || hero.mode === 'mixed') && (
          <Grid item xs={12}>
            <PanelCard title="Featured products in carousel" color="primary" icon={StarIcon}
              action={<Button color="inherit" size="small" onClick={() => update({ featuredProductIds: [] })}>Clear all</Button>}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Up to 8 products. Empty → falls back to products tagged <code>featured</code>.
                {hero.mode === 'mixed' && <> The custom image below will be the <strong>first slide</strong>.</>}
              </Typography>
              <ProductsCheckList products={shop.products}
                selectedIds={hero.featuredProductIds || []}
                onChange={ids => update({ featuredProductIds: ids.slice(0, 8) })} />
            </PanelCard>
          </Grid>
        )}

        {(hero.mode === 'custom-image' || hero.mode === 'mixed') && (
          <Grid item xs={12}>
            <PanelCard title="Custom hero image" color="primary" icon={ImageIcon}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" component="label" disabled={uploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ background: gradients.info, '&:hover': { background: gradients.info } }}>
                    <input type="file" accept="image/*" hidden onChange={handleUpload} />
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </Button>
                  <TextField size="small" fullWidth value={hero.customImage.url}
                    onChange={e => updateImg({ url: e.target.value })}
                    placeholder="…or paste image URL" />
                </Stack>
                {hero.customImage.url && (
                  <Box sx={{ height: 220, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                    background: `url(${hero.customImage.url}) center/cover no-repeat` }} />
                )}
                <TextField fullWidth label="Overlay headline" value={hero.customImage.headline}
                  onChange={e => updateImg({ headline: e.target.value })} />
                <TextField fullWidth label="Overlay subtext" value={hero.customImage.subtext}
                  onChange={e => updateImg({ subtext: e.target.value })} />
                <TextField fullWidth select label="Click action" value={hero.customImage.linkType}
                  onChange={e => updateImg({ linkType: e.target.value, linkValue: '' })}>
                  <MenuItem value="none">No action</MenuItem>
                  <MenuItem value="product">Open a product page</MenuItem>
                  <MenuItem value="shop">Open the shop</MenuItem>
                  <MenuItem value="url">Open external URL</MenuItem>
                </TextField>
                {hero.customImage.linkType === 'url' && (
                  <TextField fullWidth label="External URL" value={hero.customImage.linkValue}
                    onChange={e => updateImg({ linkValue: e.target.value })} placeholder="https://…" />
                )}
                {hero.customImage.linkType !== 'none' && (
                  <TextField fullWidth label="Button text (optional)" value={hero.customImage.ctaText}
                    onChange={e => updateImg({ ctaText: e.target.value })} />
                )}
              </Stack>
            </PanelCard>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

function ProductsCheckList({ products, selectedIds, onChange, single }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    if (!t) return products.slice(0, 30)
    return products.filter(p => (p.title || '').toLowerCase().includes(t) || (p.platform || '').toLowerCase().includes(t)).slice(0, 50)
  }, [products, q])
  const is = (id) => single ? selectedIds === id : selectedIds.includes(id)
  const toggle = (id) => single ? onChange(selectedIds === id ? null : id) : onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  return (
    <Box>
      <TextField fullWidth size="small" sx={{ mb: 1.5 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" />
      <Box sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
        {filtered.map(p => (
          <Box key={p.id} onClick={() => toggle(p.id)} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1, cursor: 'pointer',
            background: is(p.id) ? 'rgba(26,115,232,0.08)' : 'transparent',
            borderBottom: '1px solid', borderColor: 'divider',
          }}>
            <Avatar variant="rounded" src={p.img} sx={{ width: 36, height: 48, bgcolor: 'grey.200' }}>
              <ImageIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</Typography>
              <Typography variant="caption" color="text.secondary">{p.platform} · {EGP(p.price || 0)}</Typography>
            </Box>
            {is(p.id) && <CheckCircleIcon sx={{ color: 'info.main' }} />}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ── Marquee strip editor ────────────────────────────────────────────────────
// Storefront Icon names available for marquee bullets (see components/Icon.jsx).
const MARQUEE_ICONS = ['check', 'truck', 'shield', 'bolt', 'tag', 'gift', 'fire', 'star', 'spark', 'heart', 'code', 'download']

function MarqueeEditor({ items, onChange }) {
  const list = Array.isArray(items) ? items : []
  const setItem = (i, patch) => onChange(list.map((it, idx) => idx === i ? { ...it, ...patch } : it))
  const removeItem = (i) => onChange(list.filter((_, idx) => idx !== i))
  const addItem = () => onChange([...list, { icon: 'check', text: '' }])
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const copy = [...list]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    onChange(copy)
  }
  return (
    <Box>
      <Stack spacing={1.25}>
        {list.map((it, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="center">
            <TextField select size="small" label="Icon" value={MARQUEE_ICONS.includes(it.icon) ? it.icon : 'check'}
              onChange={e => setItem(i, { icon: e.target.value })} sx={{ width: 120, flexShrink: 0 }}>
              {MARQUEE_ICONS.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </TextField>
            <TextField fullWidth size="small" label={`Message ${i + 1}`} value={it.text || ''}
              onChange={e => setItem(i, { text: e.target.value })} placeholder="e.g. Free delivery over EGP 1,500" />
            <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
              <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
            </IconButton>
            <IconButton size="small" onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Move down">
              <ArrowForwardIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => removeItem(i)} title="Remove">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }} variant="outlined" size="small">
        Add message
      </Button>
    </Box>
  )
}

// ── Page: Sections ──────────────────────────────────────────────────────────
function SectionsPage({ settings, setSettings }) {
  const shop = useShop()
  const s = settings.sections
  const update = (patch) => setSettings({ ...settings, sections: { ...s, ...patch } })
  const toggles = [
    ['marquee', 'Marquee strip'], ['platforms', 'Platform shortcuts'],
    ['newReleases', 'New releases rail'], ['featureBanner', 'Deal-of-the-week banner'],
    ['ps5', 'PS5 section'], ['switch2', 'Switch 2 section'],
    ['switch', 'Switch section'], ['ps4', 'PS4 section'],
    ['genres', 'Genre strip'], ['upcoming', 'Upcoming & pre-orders'],
    ['psnDigital', 'PSN Cards section'],
    ['nintendoDigital', 'eShop Digital Codes & Memberships'],
    ['sale', 'On sale rail'], ['blog', 'Blog section'],
  ]
  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PanelCard title="Homepage sections" color="info" icon={ViewQuiltIcon}>
            <Grid container spacing={1}>
              {toggles.map(([k, label]) => (
                <Grid item xs={12} sm={6} md={4} key={k}>
                  <FormControlLabel
                    control={<Switch checked={s[k] !== false} onChange={e => update({ [k]: e.target.checked })} color="info" />}
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </PanelCard>
        </Grid>
        <Grid item xs={12}>
          <PanelCard title="Deal of the week" color="warning" icon={LocalOfferIcon}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pick which product the feature banner highlights.
            </Typography>
            <ProductsCheckList products={shop.products} selectedIds={s.featureBannerProductId} single
              onChange={id => update({ featureBannerProductId: id })} />
          </PanelCard>
        </Grid>
        <Grid item xs={12}>
          <PanelCard title="Marquee strip" color="info" icon={ViewCarouselIcon}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The scrolling trust strip under the hero. Edit the messages and icons below.
              Use the "Marquee strip" toggle above to show or hide it.
            </Typography>
            <MarqueeEditor
              items={(settings.marqueeItems && settings.marqueeItems.length)
                ? settings.marqueeItems
                : DEFAULT_SETTINGS.marqueeItems}
              onChange={items => setSettings({ ...settings, marqueeItems: items })} />
          </PanelCard>
        </Grid>
      </Grid>
    </Box>
  )
}

// ── Product editor ──────────────────────────────────────────────────────────
// ── Variant image picker — compact 56×56 thumbnail with overlay actions ────
function VariantImagePicker({ value, onChange }) {
  const [showMedia, setShowMedia] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploading(true)
    try { const { url } = await uploadProductImage(file); onChange(url) }
    catch (ex) { alert(ex.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <>
      <Box sx={{ width: 56, height: 56, flexShrink: 0, position: 'relative' }}>
        <Tooltip title={value ? 'Click to change image' : 'Click to pick from media library'}>
          <Box onClick={() => setShowMedia(true)} sx={{
            width: '100%', height: '100%', borderRadius: 1,
            backgroundImage: value ? `url(${value})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            background: value ? `url(${value}) center/cover no-repeat` : 'grey.200',
            border: '1px solid', borderColor: value ? 'divider' : '#ced4da',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            color: 'text.disabled', transition: 'border-color .15s',
            '&:hover': { borderColor: 'info.main' },
          }}>
            {!value && <ImageIcon sx={{ fontSize: 22 }} />}
          </Box>
        </Tooltip>
        {/* Upload-from-file button */}
        <Tooltip title="Upload from device">
          <IconButton component="label" size="small" disabled={uploading}
            sx={{
              position: 'absolute', bottom: -6, right: -6, padding: 0,
              width: 22, height: 22,
              background: 'info.main', color: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              '&:hover': { background: 'info.dark' },
            }}>
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
            <CloudUploadIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        {value && (
          <Tooltip title="Remove image">
            <IconButton size="small" onClick={() => onChange('')}
              sx={{
                position: 'absolute', top: -6, right: -6, padding: 0,
                width: 20, height: 20,
                background: 'error.main', color: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                '&:hover': { background: 'error.dark' },
              }}>
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {showMedia && <MediaPicker onClose={() => setShowMedia(false)}
        onPick={u => { onChange(u); setShowMedia(false) }} />}
    </>
  )
}

// ── Variants editor (denominations / sizes / tiers) ─────────────────────────
function VariantsEditor({ variants, onChange }) {
  const updateAt = (i, patch) => onChange(variants.map((v, idx) => idx === i ? { ...v, ...patch } : v))
  const removeAt = (i) => onChange(variants.filter((_, idx) => idx !== i))
  const addNew = () => onChange([...variants, { id: null, label: '', price: 0 }])
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= variants.length) return
    const next = [...variants]; [next[i], next[j]] = [next[j], next[i]]; onChange(next)
  }

  return (
    <Box>
      {variants.length === 0 ? (
        <Box sx={{
          p: 2.5, borderRadius: 1.5, textAlign: 'center',
          border: '2px dashed', borderColor: 'divider', background: 'grey.100', mb: 1.5,
        }}>
          <LocalOfferIcon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            No variants yet. Add denominations like <code>$10</code>, <code>50 Euro</code>, or sizes like <code>S / M / L</code>.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1} sx={{ mb: 1.5 }}>
          {variants.map((v, i) => (
            <Box key={(v.id ?? 'new') + ':' + i} sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25,
              background: '#fff', border: '1px solid', borderColor: 'divider',
              borderRadius: 1.5,
            }}>
              <Box sx={{
                width: 26, height: 26, borderRadius: 0.75, flexShrink: 0,
                background: 'grey.200', color: 'text.secondary',
                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>#{i + 1}</Box>

              <VariantImagePicker value={v.img || ''} onChange={url => updateAt(i, { img: url })} />

              <TextField size="small" placeholder="Label (e.g. $10)" value={v.label || ''}
                onChange={e => updateAt(i, { label: e.target.value })}
                sx={{ flex: 1, minWidth: 120 }} />
              <TextField size="small" type="number" placeholder="Price" value={v.price ?? ''}
                onChange={e => updateAt(i, { price: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">EGP</InputAdornment>,
                }}
                sx={{ width: 150 }} />
              <Tooltip title="Move up">
                <span>
                  <IconButton size="small" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton size="small" onClick={() => move(i, 1)} disabled={i === variants.length - 1}>
                    <ArrowForwardIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => removeAt(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addNew}>
        Add variant
      </Button>

      {variants.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.5 }}>
          Variants override the product's base price on the customer-facing page.
          The customer picks a denomination chip before adding to cart.
          Saved to the <code>product_variants</code> table — duplicate labels get rejected by the unique index.
        </Typography>
      )}
    </Box>
  )
}

function ProductEditor({ initial, isNew, onClose, onEditOther }) {
  const shop = useShop()
  const [p, setP] = useState(initial)
  const [variants, setVariants] = useState(
    Array.isArray(initial.variants) ? initial.variants.map(v => ({ ...v })) : []
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const set = (patch) => setP({ ...p, ...patch })
  const status = getStatus(p)
  const setStatus = (s) => set({ tags: setStatusOnTags(p.tags, s) })

  async function remove() {
    if (!p.id) return
    const ok = window.confirm(
      `Delete "${p.title}"?\n\n` +
      `This permanently removes the product and any of its variants.\n` +
      `This action cannot be undone.`
    )
    if (!ok) return
    setDeleting(true); setMsg('')
    try {
      const { error } = await supabase.from('products').delete().eq('id', p.id)
      if (error) throw error
      setMsgType('success'); setMsg('Deleted.')
      await shop.refetchProducts?.()
      setTimeout(() => onClose(), 600)
    } catch (e) {
      setMsgType('error'); setMsg('Delete failed: ' + e.message)
    } finally {
      setDeleting(false)
    }
  }

  async function save() {
    setSaving(true); setMsg('')
    try {
      if (!p.title?.trim()) throw new Error('Title is required')
      const stockNum = p.stock === '' || p.stock == null ? null : Number(p.stock)
      const payload = {
        name: p.title.trim(), slug: p.slug?.trim() || null,
        price: Number(p.price) || 0, was: p.was ? Number(p.was) : null,
        in_stock: stockNum == null ? !!p.inStock : stockNum > 0, stock: stockNum,
        categories: p.categories || [], product_type: p.productType || 'game',
        platform: p.platform || null, brand: p.brand || null,
        short_description: p.blurb || '', description: p.description || '',
        image_url: p.img || null, screenshots: p.screenshots || [],
        tags: p.tags || [],
      }
      let productId = p.id
      if (isNew) {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single()
        if (error) throw error
        productId = data.id
        setMsgType('success'); setMsg('Product created.')
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', p.id)
        if (error) throw error
        setMsgType('success'); setMsg('Saved.')
      }

      // Persist variants (delete-then-insert is simplest and atomic enough at admin scale)
      if (productId) {
        const { error: delErr } = await supabase.from('product_variants').delete().eq('product_id', productId)
        if (delErr) throw delErr
        const validVariants = variants
          .map(v => ({
            label: (v.label || '').trim(),
            price: Number(v.price) || 0,
            image_url: v.img || null,
          }))
          .filter(v => v.label)
        if (validVariants.length > 0) {
          const rows = validVariants.map((v, i) => ({
            product_id: productId,
            label: v.label,
            price: v.price,
            image_url: v.image_url,
            sort_order: i + 1,
          }))
          const { error: insErr } = await supabase.from('product_variants').insert(rows)
          if (insErr) throw insErr
        }
      }

      await shop.refetchProducts?.()
      setTimeout(() => onClose(), 900)
    } catch (e) { setMsgType('error'); setMsg(e.message) } finally { setSaving(false) }
  }

  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <PanelCard title={isNew ? 'New product' : `Edit: ${p.title || '(untitled)'}`} color="info" icon={isNew ? 'add_box' : 'edit'}
        action={<Button color="inherit" size="small" onClick={onClose} startIcon={<ArrowBackIcon />}>Back</Button>}>
        {msg && <Alert severity={msgType} sx={{ mb: 2 }}>{msg}</Alert>}

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>Status</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {STATUS_OPTIONS.map(opt => (
            <Chip key={opt.value} label={opt.label} clickable
              color={status === opt.value ? 'info' : 'default'}
              variant={status === opt.value ? 'filled' : 'outlined'}
              onClick={() => setStatus(opt.value)} />
          ))}
        </Stack>

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>Cover image</Typography>
        <Box sx={{ mb: 3 }}><ImagePickerField value={p.img} onChange={u => set({ img: u })} /></Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Title *" value={p.title || ''} onChange={e => set({ title: e.target.value })} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Slug" placeholder="auto" value={p.slug || ''} onChange={e => set({ slug: e.target.value })} helperText="Leave blank to auto-generate." /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Price (EGP)" value={p.price || 0} onChange={e => set({ price: e.target.value })} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Sale price — was" value={p.was || ''} onChange={e => set({ was: e.target.value })} helperText="Original price; shows strike-through." /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Stock quantity" value={p.stock ?? ''} onChange={e => set({ stock: e.target.value })} helperText="Blank = unlimited, 0 = out of stock." /></Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Product type" value={p.productType || 'game'} onChange={e => set({ productType: e.target.value })}>
              <MenuItem value="game">Game</MenuItem>
              <MenuItem value="accessory">Accessory</MenuItem>
              <MenuItem value="console">Console</MenuItem>
              <MenuItem value="digital_code">Digital code</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Platform" value={p.platform || ''} onChange={e => set({ platform: e.target.value })}>
              <MenuItem value="">— None —</MenuItem>
              <MenuItem value="PS5">PS5</MenuItem><MenuItem value="PS4">PS4</MenuItem>
              <MenuItem value="Switch 2">Switch 2</MenuItem><MenuItem value="Switch">Switch</MenuItem>
              <MenuItem value="Xbox">Xbox</MenuItem><MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Brand / publisher" value={p.brand || ''} onChange={e => set({ brand: e.target.value })} /></Grid>
        </Grid>

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>Categories</Typography>
        <CategoryPicker value={p.categories || []} onChange={cats => set({ categories: cats })} />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>Short description</Typography>
        <RichTextEditor value={p.blurb || ''} onChange={h => set({ blurb: h })} minHeight={80} placeholder="One-line pitch." />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>Full description</Typography>
        <RichTextEditor value={p.description || ''} onChange={h => set({ description: h })} minHeight={200} placeholder="Full marketing copy." />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>Screenshots & media (images or YouTube)</Typography>
        <MultiImagePicker value={p.screenshots || []} onChange={ss => set({ screenshots: ss })} />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>
          Variants (denominations / sizes)
        </Typography>
        <VariantsEditor variants={variants} onChange={setVariants} />

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, alignItems: 'center' }}>
          <Button variant="contained" disabled={saving || deleting} onClick={save}
            sx={{ background: gradients.info, '&:hover': { background: gradients.info, opacity: 0.92 } }}>
            {saving ? 'Saving…' : (isNew ? 'Create product' : 'Save changes')}
          </Button>
          <Button variant="outlined" onClick={onClose} disabled={saving || deleting}>Cancel</Button>
          {!isNew && (
            <>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" color="error" disabled={saving || deleting}
                onClick={remove} startIcon={<DeleteIcon />}
                sx={{ '&:hover': { background: 'rgba(239,68,68,0.08)' } }}>
                {deleting ? 'Deleting…' : 'Delete product'}
              </Button>
            </>
          )}
        </Stack>
      </PanelCard>
    </Box>
  )
}

// ── Page: Products ──────────────────────────────────────────────────────────
function ProductsPage({ deepLink, onDeepLinkConsumed }) {
  const shop = useShop()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteErr, setDeleteErr] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [quickEditId, setQuickEditId] = useState(null)
  const [stockFilter, setStockFilter] = useState('')
  const [quickEditData, setQuickEditData] = useState({})
  const [quickSaving, setQuickSaving] = useState(false)

  const startQuickEdit = (p) => {
    setQuickEditId(p.id)
    setQuickEditData({ price: p.price || '', was: p.was || '', stock: p.stock ?? '', in_stock: p.in_stock ?? true })
  }

  const saveQuickEdit = async (p) => {
    setQuickSaving(true); setDeleteErr('')
    try {
      const stockNum = quickEditData.stock === '' || quickEditData.stock == null ? null : Number(quickEditData.stock)
      const payload = {
        price: Number(quickEditData.price) || 0,
        was: quickEditData.was ? Number(quickEditData.was) : null,
        stock: stockNum,
        in_stock: stockNum == null ? quickEditData.in_stock : stockNum > 0,
      }
      const { error } = await supabase.from('products').update(payload).eq('id', quickEditId)
      if (error) throw error
      setQuickEditId(null)
      await shop.refetchProducts?.()
    } catch (e) {
      setDeleteErr('Quick edit failed: ' + e.message)
      setTimeout(() => setDeleteErr(''), 6000)
    } finally {
      setQuickSaving(false)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const clearSelection = () => setSelectedIds(new Set())

  async function deleteSelected() {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    const ok = window.confirm(
      `Delete ${ids.length} product${ids.length === 1 ? '' : 's'}?\n\n` +
      `This permanently removes them and any variants.\n` +
      `This action cannot be undone.`
    )
    if (!ok) return
    setBulkDeleting(true); setDeleteErr('')
    try {
      const { error } = await supabase.from('products').delete().in('id', ids)
      if (error) throw error
      clearSelection()
      await shop.refetchProducts?.()
    } catch (e) {
      setDeleteErr('Bulk delete failed: ' + e.message)
      setTimeout(() => setDeleteErr(''), 6000)
    } finally {
      setBulkDeleting(false)
    }
  }

  async function deleteProduct(prod) {
    if (!prod?.id) return
    const ok = window.confirm(
      `Delete "${prod.title}"?\n\n` +
      `This permanently removes the product and any of its variants.\n` +
      `This action cannot be undone.`
    )
    if (!ok) return
    setDeletingId(prod.id); setDeleteErr('')
    try {
      const { error } = await supabase.from('products').delete().eq('id', prod.id)
      if (error) throw error
      await shop.refetchProducts?.()
    } catch (e) {
      setDeleteErr('Delete failed: ' + e.message)
      setTimeout(() => setDeleteErr(''), 6000)
    } finally {
      setDeletingId(null)
    }
  }

  // Unique sorted list of every category present across products
  const categoryOptions = useMemo(() => {
    const set = new Set()
    for (const p of shop.allProducts) for (const c of (p.categories || [])) if (c) set.add(c)
    return [...set].sort()
  }, [shop.allProducts])

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    let list = shop.allProducts
    if (categoryFilter) {
      list = list.filter(p => Array.isArray(p.categories) && p.categories.includes(categoryFilter))
    }
    if (stockFilter === 'in_stock') {
      list = list.filter(p => (p.stock == null || p.stock > 0) && p.in_stock !== false)
    } else if (stockFilter === 'out_of_stock') {
      list = list.filter(p => (p.stock != null && p.stock <= 0) || p.in_stock === false)
    } else if (stockFilter === 'sale') {
      list = list.filter(p => p.was && p.was > p.price)
    }
    if (t) {
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(t) ||
        (p.platform || '').toLowerCase().includes(t) ||
        (p.slug || '').toLowerCase().includes(t)
      )
    }
    return list
  }, [shop.allProducts, q, categoryFilter, stockFilter])

  // Deep-link from notification: open product editor
  useEffect(() => {
    if (deepLink?.page === 'products' && deepLink?.entityId) {
      const p = shop.allProducts.find(x => x.id === deepLink.entityId)
      if (p) setEditing({ ...p })
      if (onDeepLinkConsumed) onDeepLinkConsumed()
    }
  }, [deepLink])

  if (creating) return <ProductEditor initial={BLANK_PRODUCT} isNew onClose={() => setCreating(false)} />

  if (editing) return <ProductEditor initial={editing} onClose={() => setEditing(null)} />

  const filteredIds = filtered.map(p => p.id)
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.has(id))
  const someSelected = !allFilteredSelected && filteredIds.some(id => selectedIds.has(id))
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Clear only the filtered ids from the selection
      setSelectedIds(prev => {
        const next = new Set(prev); filteredIds.forEach(id => next.delete(id)); return next
      })
    } else {
      // Add every filtered id to the selection
      setSelectedIds(prev => {
        const next = new Set(prev); filteredIds.forEach(id => next.add(id)); return next
      })
    }
  }

  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <PanelCard title={`Products (${filtered.length}/${shop.allProducts.length})`}
        color="info" icon={Inventory2Icon}
        action={
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField size="small" select
              value={categoryFilter || '__all__'}
              onChange={e => setCategoryFilter(e.target.value === '__all__' ? '' : e.target.value)}
              sx={pillFieldSx(200)}
              SelectProps={{
                IconComponent: (props) => <ArrowForwardIcon {...props} sx={{ transform: 'rotate(90deg)', color: '#6c757d', mr: 1 }} />,
              }}>
              <MenuItem value="__all__">All categories</MenuItem>
              <Divider />
              {categoryOptions.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" select
              value={stockFilter || '__all__'}
              onChange={e => setStockFilter(e.target.value === '__all__' ? '' : e.target.value)}
              sx={pillFieldSx(160)}
              SelectProps={{
                IconComponent: (props) => <ArrowForwardIcon {...props} sx={{ transform: 'rotate(90deg)', color: '#6c757d', mr: 1 }} />,
              }}>
              <MenuItem value="__all__">All stock</MenuItem>
              <Divider />
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              <MenuItem value="sale">On Sale</MenuItem>
            </TextField>
            <TextField size="small" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search products…"
              sx={pillFieldSx(240)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <SearchIcon fontSize="small" sx={{ color: '#9ba3b4' }} />
                  </InputAdornment>
                ),
              }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}
              sx={{
                background: gradients.success, color: '#fff',
                px: 2.5, height: 40, borderRadius: '20px', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(76,175,80,0.35)',
                '&:hover': { background: gradients.success, opacity: 0.92 },
              }}>
              New
            </Button>
          </Stack>
        }>
        {deleteErr && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setDeleteErr('')}>{deleteErr}</Alert>}

        {/* Selection toolbar — visible whenever the list has rows */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{
          mb: 1.5, px: 1, py: 0.5, borderRadius: 1.5,
          background: selectedIds.size > 0 ? 'rgba(244,67,53,0.06)' : 'transparent',
          border: '1px solid', borderColor: selectedIds.size > 0 ? 'rgba(244,67,53,0.25)' : 'transparent',
          transition: 'background .15s, border-color .15s',
        }}>
          <Checkbox size="small"
            checked={allFilteredSelected}
            indeterminate={someSelected}
            disabled={filtered.length === 0}
            onChange={toggleSelectAll} />
          <Typography variant="body2" sx={{ fontWeight: selectedIds.size > 0 ? 700 : 500, color: selectedIds.size > 0 ? 'error.main' : 'text.secondary' }}>
            {selectedIds.size === 0
              ? `Select ${filtered.length === shop.allProducts.length ? 'all' : 'visible'}`
              : `${selectedIds.size} selected`}
          </Typography>
          <Box sx={{ flex: 1 }} />
          {selectedIds.size > 0 && (
            <>
              <Button size="small" onClick={clearSelection} disabled={bulkDeleting}>
                Clear
              </Button>
              <Button size="small" variant="contained" color="error"
                startIcon={<DeleteIcon />} disabled={bulkDeleting}
                onClick={deleteSelected}
                sx={{ boxShadow: '0 2px 8px rgba(244,67,53,0.35)' }}>
                {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
              </Button>
            </>
          )}
        </Stack>

        {(categoryFilter || q) && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            {categoryFilter && (
              <Chip size="small" color="info" label={`Category: ${categoryFilter}`}
                onDelete={() => setCategoryFilter('')} />
            )}
            {q && (
              <Chip size="small" label={`Search: "${q}"`} onDelete={() => setQ('')} />
            )}
          </Stack>
        )}
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {filtered.length === 0 && <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No products match.</Typography>}
          <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 600 }}>
            <TableBody>
              {filtered.map(p => {
                const st = getStatus(p)
                return (
                  <TableRow key={p.id} hover
                    selected={selectedIds.has(p.id)}
                    sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1 } }}>
                    <TableCell padding="checkbox" sx={{ pl: 0, width: 40 }}>
                      <Checkbox size="small"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)} />
                    </TableCell>
                    <TableCell sx={{ width: 60 }}>
                      <Avatar variant="rounded" src={p.img} sx={{ width: 40, height: 52, bgcolor: 'grey.200' }}><ImageIcon /></Avatar>
                    </TableCell>
                    <TableCell sx={{ pr: 2 }}>
                      <Typography sx={{
                        fontWeight: 600, fontSize: 14, lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                      }}>{p.title}</Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, overflow: 'hidden' }}>
                        <PlatformBadge product={p} />
                        {quickEditId === p.id ? (
                          <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                            <TextField size="small" variant="standard" type="number" label="Price" value={quickEditData.price} onChange={e => setQuickEditData({ ...quickEditData, price: e.target.value })} sx={{ width: 60 }} InputLabelProps={{ shrink: true }} />
                            <TextField size="small" variant="standard" type="number" label="Sale" value={quickEditData.was} onChange={e => setQuickEditData({ ...quickEditData, was: e.target.value })} sx={{ width: 60 }} InputLabelProps={{ shrink: true }} />
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {(p.price ? EGP(p.price) : '—') + (p.slug ? ` · ${p.slug}` : '')}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: 180, whiteSpace: 'nowrap' }}>
                      {quickEditId === p.id ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TextField size="small" variant="standard" type="number" label="Stock" placeholder="unlimited" value={quickEditData.stock} onChange={e => setQuickEditData({ ...quickEditData, stock: e.target.value })} sx={{ width: 60 }} InputLabelProps={{ shrink: true }} />
                          {(quickEditData.stock === '' || quickEditData.stock == null) && (
                            <TextField size="small" select variant="standard" label="Status"
                              value={quickEditData.in_stock ? 'in' : 'out'}
                              onChange={e => setQuickEditData({ ...quickEditData, in_stock: e.target.value === 'in' })}
                              sx={{ width: 95 }} InputLabelProps={{ shrink: true }}>
                              <MenuItem value="in">In Stock</MenuItem>
                              <MenuItem value="out">Out of Stock</MenuItem>
                            </TextField>
                          )}
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0.75}>
                          {st !== 'available' && <Chip size="small" label={STATUS_OPTIONS.find(o => o.value === st)?.label} color="info" />}
                          {p.stock != null && (
                            <Chip size="small" label={p.stock > 0 ? `${p.stock} in stock` : 'OUT'}
                              color={p.stock > 0 ? 'success' : 'error'} />
                          )}
                          {p.was && p.was > p.price && <Chip size="small" label="SALE" color="warning" />}
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell sx={{ width: 130, whiteSpace: 'nowrap', pr: 0, textAlign: 'right' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {quickEditId === p.id ? (
                          <>
                            <Tooltip title="Save">
                              <IconButton size="small" color="success" disabled={quickSaving} onClick={() => saveQuickEdit(p)}
                                sx={{ border: '1px solid', borderColor: 'success.main', '&:hover': { background: 'rgba(46,125,50,0.08)' } }}>
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton size="small" color="inherit" disabled={quickSaving} onClick={() => setQuickEditId(null)}
                                sx={{ border: '1px solid', borderColor: 'rgba(0,0,0,0.2)', '&:hover': { background: 'rgba(0,0,0,0.08)' } }}>
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Quick Edit">
                              <IconButton size="small" color="warning" onClick={() => startQuickEdit(p)}
                                sx={{ border: '1px solid', borderColor: 'rgba(237,108,2,0.4)', '&:hover': { background: 'rgba(237,108,2,0.08)' } }}>
                                <BoltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit product">
                              <IconButton size="small" color="info" onClick={() => setEditing({ ...p })}
                                sx={{
                                  border: '1px solid', borderColor: 'rgba(26,115,232,0.4)',
                                  '&:hover': { background: 'rgba(26,115,232,0.08)' },
                                }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete product">
                              <span>
                                <IconButton size="small" color="error"
                                  disabled={deletingId === p.id}
                                  onClick={() => deleteProduct(p)}
                                  sx={{
                                    border: '1px solid', borderColor: 'rgba(239,68,68,0.4)',
                                    '&:hover': { background: 'rgba(239,68,68,0.08)' },
                                  }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </PanelCard>
    </Box>
  )
}

// ── Page: Customers ─────────────────────────────────────────────────────────
function CustomersPage() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => { listCustomers().then(setRows).catch(e => setErr(e.message)) }, [])
  const filtered = useMemo(() => {
    if (!rows) return []
    const t = q.toLowerCase().trim()
    return t ? rows.filter(r => (r.email || '').toLowerCase().includes(t) || (r.full_name || '').toLowerCase().includes(t) || (r.phone || '').toLowerCase().includes(t)) : rows
  }, [rows, q])

  return (
    <Box sx={{ pt: 0, pb: 2 }}>
      <PanelCard title={`Customers${rows ? ' (' + rows.length + ')' : ''}`} color="primary" icon={PeopleIcon}
        action={
          <TextField size="small" value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers…"
            sx={pillFieldSx(260)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0 }}>
                  <SearchIcon fontSize="small" sx={{ color: '#9ba3b4' }} />
                </InputAdornment>
              ),
            }} />
        }>
        {err && <Alert severity="error">{err}</Alert>}
        {!rows && !err && <Typography color="text.secondary">Loading…</Typography>}
        {rows && rows.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.full_name || '—'}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.phone || '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PanelCard>
    </Box>
  )
}

// ── Page: Settings ──────────────────────────────────────────────────────────
// ── Blog post editor ────────────────────────────────────────────────────────
const BLANK_POST = {
  id: null, slug: '', title: '', category: 'News',
  excerpt: '', body: '', author: '', hue: 230, read_time: '5 min',
  image_url: '', published_at: null,
}

function BlogPostEditor({ initial, isNew, onClose }) {
  const shop = useShop()
  const [p, setP] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const set = (patch) => setP({ ...p, ...patch })

  async function save() {
    setSaving(true); setMsg('')
    try {
      if (!p.title?.trim()) throw new Error('Title is required')
      const payload = {
        title: p.title.trim(),
        slug: p.slug?.trim() || null,
        category: p.category || 'News',
        excerpt: p.excerpt || '',
        body: p.body || '',
        author: p.author || '',
        hue: Number(p.hue) || 230,
        read_time: p.read_time || '5 min',
        image_url: p.image_url || null,
        published_at: p.published_at || new Date().toISOString(),
      }
      if (isNew) {
        const { error } = await supabase.from('blog_posts').insert(payload)
        if (error) throw error
        setMsgType('success'); setMsg('Post published.')
      } else {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', p.id)
        if (error) throw error
        setMsgType('success'); setMsg('Saved.')
      }
      await shop.refetchPosts?.()
      setTimeout(() => onClose(), 900)
    } catch (e) { setMsgType('error'); setMsg(e.message) } finally { setSaving(false) }
  }

  async function remove() {
    if (!p.id) return
    if (!window.confirm(`Delete "${p.title}"?\nThis cannot be undone.`)) return
    setDeleting(true); setMsg('')
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', p.id)
      if (error) throw error
      setMsgType('success'); setMsg('Deleted.')
      await shop.refetchPosts?.()
      setTimeout(() => onClose(), 600)
    } catch (e) { setMsgType('error'); setMsg('Delete failed: ' + e.message) }
    finally { setDeleting(false) }
  }

  return (
    <Box sx={{ pt: 4, pb: 2 }}>
      <PanelCard title={isNew ? 'New blog post' : `Edit: ${p.title || '(untitled)'}`}
        color="info" icon={isNew ? AddBoxIcon : EditIcon}
        action={<Button color="inherit" size="small" onClick={onClose} startIcon={<ArrowBackIcon />}>Back</Button>}>
        {msg && <Alert severity={msgType} sx={{ mb: 2 }}>{msg}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Title *" value={p.title || ''}
              onChange={e => set({ title: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Slug (URL)" placeholder="auto" value={p.slug || ''}
              onChange={e => set({ slug: e.target.value })}
              helperText="Leave blank to auto-generate." />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth select label="Category" value={p.category || 'News'}
              onChange={e => set({ category: e.target.value })}>
              {['News', 'Guides', 'Reviews', 'Deals', 'Updates'].map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Author" value={p.author || ''}
              onChange={e => set({ author: e.target.value })} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Read time" value={p.read_time || ''}
              onChange={e => set({ read_time: e.target.value })}
              placeholder="5 min" />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth type="number" label="Hue (0-360)"
              value={p.hue ?? 230} onChange={e => set({ hue: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: `linear-gradient(135deg, oklch(0.55 0.2 ${p.hue || 230}), oklch(0.3 0.1 ${(Number(p.hue) || 230) + 40}))`,
                      border: '1px solid', borderColor: 'divider',
                    }} />
                  </InputAdornment>
                ),
              }}
              helperText="Cover gradient color" />
          </Grid>
        </Grid>

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>
          Cover image (shown on cards, hero & social share)
        </Typography>
        <ImagePickerField value={p.image_url || ''} onChange={url => set({ image_url: url })} />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>
          Excerpt (shown on cards & under hero)
        </Typography>
        <TextField fullWidth multiline rows={2} value={p.excerpt || ''}
          onChange={e => set({ excerpt: e.target.value })}
          placeholder="One-sentence hook." />

        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1, mt: 3 }}>
          Body (rich text)
        </Typography>
        <RichTextEditor value={p.body || ''} onChange={h => set({ body: h })}
          minHeight={300} placeholder="Write the full article…" />

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, alignItems: 'center' }}>
          <Button variant="contained" disabled={saving || deleting} onClick={save}
            sx={{ background: gradients.info, '&:hover': { background: gradients.info, opacity: 0.92 } }}>
            {saving ? 'Saving…' : (isNew ? 'Publish post' : 'Save changes')}
          </Button>
          <Button variant="outlined" onClick={onClose} disabled={saving || deleting}>Cancel</Button>
          {!isNew && (
            <>
              <Box sx={{ flex: 1 }} />
              <Button variant="outlined" color="error" disabled={saving || deleting}
                onClick={remove} startIcon={<DeleteIcon />}>
                {deleting ? 'Deleting…' : 'Delete post'}
              </Button>
            </>
          )}
        </Stack>
      </PanelCard>
    </Box>
  )
}

// ── Page: Blog ──────────────────────────────────────────────────────────────
function BlogManagementPage() {
  const shop = useShop()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    if (!t) return shop.posts
    return shop.posts.filter(p =>
      (p.title || '').toLowerCase().includes(t) ||
      (p.cat || '').toLowerCase().includes(t) ||
      (p.author || '').toLowerCase().includes(t)
    )
  }, [shop.posts, q])

  if (creating) return <BlogPostEditor initial={BLANK_POST} isNew onClose={() => setCreating(false)} />
  if (editing) {
    // Hydrate full row from DB if missing fields (the cached version may be shaped)
    const initial = {
      id: editing.id,
      slug: editing.slug || '',
      title: editing.title || '',
      category: editing.cat || 'News',
      excerpt: editing.excerpt || '',
      body: editing.body || '',
      author: editing.author || '',
      hue: editing.hue ?? 230,
      read_time: editing.read || '5 min',
      image_url: editing.image || '',
      published_at: null, // server will keep existing
    }
    return <BlogPostEditor initial={initial} onClose={() => setEditing(null)} />
  }

  return (
    <Box sx={{ pt: 4, pb: 2 }}>
      <PanelCard title={`Blog posts (${shop.posts.length})`}
        color="info" icon={ArticleIcon}
        action={
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField size="small" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search posts…" sx={pillFieldSx(240)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <SearchIcon fontSize="small" sx={{ color: '#9ba3b4' }} />
                  </InputAdornment>
                ),
              }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}
              sx={{
                background: gradients.success, color: '#fff',
                px: 2.5, height: 40, borderRadius: '20px', fontWeight: 700,
                boxShadow: '0 4px 12px rgba(76,175,80,0.35)',
                '&:hover': { background: gradients.success, opacity: 0.92 },
              }}>
              New post
            </Button>
          </Stack>
        }>
        {filtered.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            No posts yet. Click "New post" to publish your first article.
          </Typography>
        ) : (
          <Table size="small">
            <TableBody>
              {filtered.map(post => {
                const h = post.hue ?? 230, h2 = (h + 40) % 360
                return (
                  <TableRow key={post.id} hover sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1.25 } }}>
                    <TableCell sx={{ width: 80, pl: 0 }}>
                      <Box sx={{
                        width: 64, height: 48, borderRadius: 1,
                        background: `linear-gradient(135deg, oklch(0.5 0.18 ${h}), oklch(0.25 0.08 ${h2}))`,
                      }} />
                    </TableCell>
                    <TableCell sx={{ width: '100%', minWidth: 0 }}>
                      <Typography sx={{
                        fontWeight: 600, fontSize: 14, lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                      }}>{post.title}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip size="small" label={post.cat} sx={{ height: 20, fontSize: 10.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.author || '—'} · {post.date || '—'} · {post.read}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', pr: 0 }}>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />}
                        onClick={() => setEditing(post)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </PanelCard>
    </Box>
  )
}

// ── Page: Orders ────────────────────────────────────────────────────────────
const ORDER_STATUS = [
  { value: 'new',       label: 'New',       color: 'info' },
  { value: 'confirmed', label: 'Confirmed', color: 'primary' },
  { value: 'shipped',   label: 'Shipped',   color: 'warning' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
]
const PAYMENT_LABEL = {
  cod: 'Cash on delivery',
  card: 'Credit / debit card',
  fawry: 'Fawry / Meeza',
  instapay: 'Instapay',
}

function OrderRow({ order, onStatus, onDelete, busy, expanded, onToggle }) {
  const st = ORDER_STATUS.find(s => s.value === order.status) || ORDER_STATUS[0]
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <Box sx={{
      background: '#fff', borderRadius: 1.5,
      border: '1px solid', borderColor: 'divider',
      transition: 'box-shadow .15s',
      ...(expanded ? { boxShadow: '0 4px 16px rgba(0,0,0,.05)' } : {}),
    }}>
      {/* Header row — always visible */}
      <Box onClick={onToggle} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, cursor: 'pointer',
        '&:hover': { background: 'rgba(0,0,0,0.02)' },
      }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
          background: 'rgba(26,115,232,0.1)', color: 'info.main',
          display: 'grid', placeItems: 'center',
        }}>
          <ReceiptLongIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>
              #{order.id} · {order.customer_name}
            </Typography>
            <Chip size="small" label={st.label} color={st.color} />
            <Chip size="small" variant="outlined" label={`${order.item_count || items.length} item${(order.item_count || items.length) === 1 ? '' : 's'}`} />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {EGP(Number(order.total) || 0)} · {PAYMENT_LABEL[order.payment_method] || order.payment_method} · {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
          </Typography>
        </Box>
        <ArrowForwardIcon sx={{
          color: 'text.secondary', fontSize: 18,
          transform: expanded ? 'rotate(270deg)' : 'rotate(90deg)',
          transition: 'transform .15s',
        }} />
      </Box>

      {expanded && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', background: 'grey.50' }}>
          <Grid container spacing={2}>
            {/* Items */}
            <Grid item xs={12} md={7}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                Items
              </Typography>
              <Stack spacing={1}>
                {items.map((it, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1,
                    background: '#fff', borderRadius: 1, border: '1px solid', borderColor: 'divider',
                  }}>
                    <Avatar variant="rounded" src={it.img} sx={{ width: 40, height: 52, bgcolor: 'grey.200' }}>
                      <ImageIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {it.title}{it.variant_label ? ` — ${it.variant_label}` : ''}
                        {it.digital ? <Chip label="DIGITAL" size="small" sx={{ ml: 1, height: 16, fontSize: 9 }} /> : null}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qty {it.qty} × {EGP(Number(it.unit_price) || 0)} = {EGP((Number(it.unit_price) || 0) * (Number(it.qty) || 0))}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 13 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{EGP(Number(order.subtotal) || 0)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 13 }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2">{order.shipping ? EGP(Number(order.shipping)) : 'Free'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5, fontWeight: 700 }}>
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, color: 'info.main' }}>{EGP(Number(order.total) || 0)}</Typography>
                </Stack>
              </Box>
            </Grid>

            {/* Delivery + status controls */}
            <Grid item xs={12} md={5}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                Delivery
              </Typography>
              <Stack spacing={0.75} sx={{
                p: 1.5, background: '#fff', borderRadius: 1,
                border: '1px solid', borderColor: 'divider', fontSize: 13.5,
              }}>
                <Box><strong>{order.customer_name}</strong></Box>
                <Box>
                  <a href={`tel:${order.phone}`} style={{ color: '#344767' }}>{order.phone}</a>
                  {' · '}
                  <a href={`https://wa.me/${(order.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#22c55e', fontWeight: 600 }}>WhatsApp ↗</a>
                </Box>
                {order.email && <Box style={{ color: '#6c757d' }}>{order.email}</Box>}
                {order.address && (
                  <Box style={{ color: '#6c757d' }}>
                    {order.address}{order.city ? `, ${order.city}` : ''}{order.governorate ? `, ${order.governorate}` : ''}
                  </Box>
                )}
              </Stack>

              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mt: 2, mb: 1 }}>
                Status
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {ORDER_STATUS.map(s => (
                  <Chip key={s.value} label={s.label} size="small" clickable
                    color={order.status === s.value ? s.color : 'default'}
                    variant={order.status === s.value ? 'filled' : 'outlined'}
                    disabled={busy}
                    onClick={() => onStatus(s.value)} />
                ))}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button size="small" variant="outlined" color="error"
                  startIcon={<DeleteIcon />} disabled={busy}
                  onClick={onDelete}>
                  Delete order
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

function OrdersPage({ deepLink, onDeepLinkConsumed }) {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // Deep-link from notification: expand the order
  useEffect(() => {
    if (deepLink?.page === 'orders' && deepLink?.entityId) {
      setExpandedId(deepLink.entityId)
      if (onDeepLinkConsumed) onDeepLinkConsumed()
    }
  }, [deepLink])

  const load = async () => {
    setRows(null); setErr('')
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      setRows(data || [])
    } catch (e) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    const t = q.toLowerCase().trim()
    let list = rows
    if (statusFilter) list = list.filter(r => r.status === statusFilter)
    if (t) list = list.filter(r =>
      String(r.id).includes(t) ||
      (r.customer_name || '').toLowerCase().includes(t) ||
      (r.phone || '').toLowerCase().includes(t) ||
      (r.email || '').toLowerCase().includes(t)
    )
    return list
  }, [rows, q, statusFilter])

  async function setStatus(id, status) {
    setBusyId(id)
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
      setRows(rows.map(r => r.id === id ? { ...r, status } : r))
    } catch (e) { alert('Update failed: ' + e.message) }
    finally { setBusyId(null) }
  }

  async function remove(id) {
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    setBusyId(id)
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) throw error
      setRows(rows.filter(r => r.id !== id))
    } catch (e) { alert('Delete failed: ' + e.message) }
    finally { setBusyId(null) }
  }

  // Stats for the toolbar
  const stats = useMemo(() => {
    const all = rows || []
    const open = all.filter(r => ['new', 'confirmed', 'shipped'].includes(r.status))
    const revenue = all.filter(r => r.status === 'delivered').reduce((s, r) => s + (Number(r.total) || 0), 0)
    const countByStatus = {}
    for (const s of ORDER_STATUS) countByStatus[s.value] = all.filter(r => r.status === s.value).length
    return { total: all.length, open: open.length, revenue, countByStatus }
  }, [rows])

  return (
    <Box sx={{ pt: 4, pb: 2 }}>
      {/* Quick stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <StatCard color="info"    icon={ReceiptLongIcon}   title="Total orders" count={stats.total} />
          <StatCard color="warning" icon={LocalShippingIcon} title="In progress"  count={stats.open} percentage={{ color: 'warning.main', amount: '', label: 'new + confirmed + shipped' }} />
          <StatCard color="success" icon={CheckCircleIcon}   title="Delivered"    count={stats.countByStatus.delivered || 0} />
          <StatCard color="primary" icon={LocalOfferIcon}    title="Revenue"      count={EGP(stats.revenue)} percentage={{ color: 'success.main', amount: '', label: 'from delivered orders' }} />
      </Box>

      <PanelCard title={`Orders${rows ? ' (' + rows.length + ')' : ''}`}
        color="info" icon={ReceiptLongIcon}
        action={
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField size="small" select
              value={statusFilter || '__all__'}
              onChange={e => setStatusFilter(e.target.value === '__all__' ? '' : e.target.value)}
              sx={pillFieldSx(180)}
              SelectProps={{
                IconComponent: (props) => <ArrowForwardIcon {...props} sx={{ transform: 'rotate(90deg)', color: '#6c757d', mr: 1 }} />,
              }}>
              <MenuItem value="__all__">All statuses</MenuItem>
              <Divider />
              {ORDER_STATUS.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label} ({stats.countByStatus[s.value] || 0})</MenuItem>
              ))}
            </TextField>
            <TextField size="small" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Order #, name, phone…" sx={pillFieldSx(240)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <SearchIcon fontSize="small" sx={{ color: '#9ba3b4' }} />
                  </InputAdornment>
                ),
              }} />
          </Stack>
        }>
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err} — make sure you've run <code>scripts/orders-setup.sql</code>.
          </Alert>
        )}
        {!rows && !err && <Typography color="text.secondary">Loading…</Typography>}
        {rows && rows.length === 0 && !err && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No orders yet.</Typography>
          </Box>
        )}
        {rows && rows.length > 0 && filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>No orders match.</Typography>
        )}
        {filtered.length > 0 && (
          <Stack spacing={1.25}>
            {filtered.map(o => (
              <OrderRow key={o.id}
                order={o}
                busy={busyId === o.id}
                expanded={expandedId === o.id}
                onToggle={() => setExpandedId(prev => prev === o.id ? null : o.id)}
                onStatus={(s) => setStatus(o.id, s)}
                onDelete={() => remove(o.id)} />
            ))}
          </Stack>
        )}
      </PanelCard>
    </Box>
  )
}

// ── Page: Requests ──────────────────────────────────────────────────────────
const REQUEST_STATUS = [
  { value: 'new',       label: 'New',       color: 'info' },
  { value: 'contacted', label: 'Contacted', color: 'warning' },
  { value: 'sourced',   label: 'Sourced',   color: 'primary' },
  { value: 'done',      label: 'Done',      color: 'success' },
  { value: 'dropped',   label: 'Dropped',   color: 'default' },
]

function RequestsPage({ deepLink, onDeepLinkConsumed }) {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [zoomUrl, setZoomUrl] = useState(null)
  const [highlightId, setHighlightId] = useState(null)

  // Deep-link from notification: filter to new and highlight
  useEffect(() => {
    if (deepLink?.page === 'requests' && deepLink?.entityId) {
      setStatusFilter('new')
      setHighlightId(deepLink.entityId)
      setTimeout(() => {
        const el = document.getElementById(`request-${deepLink.entityId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      setTimeout(() => setHighlightId(null), 4000)
      if (onDeepLinkConsumed) onDeepLinkConsumed()
    }
  }, [deepLink])

  const load = async () => {
    setRows(null); setErr('')
    try {
      const { data, error } = await supabase
        .from('game_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      setRows(data || [])
    } catch (e) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    const t = q.toLowerCase().trim()
    let list = rows
    if (statusFilter) list = list.filter(r => r.status === statusFilter)
    if (t) list = list.filter(r =>
      (r.game_title || '').toLowerCase().includes(t) ||
      (r.name || '').toLowerCase().includes(t) ||
      (r.phone || '').toLowerCase().includes(t)
    )
    return list
  }, [rows, q, statusFilter])

  async function setStatus(id, status) {
    setBusyId(id)
    try {
      const { error } = await supabase.from('game_requests').update({ status }).eq('id', id)
      if (error) throw error
      setRows(rows.map(r => r.id === id ? { ...r, status } : r))
    } catch (e) { alert('Update failed: ' + e.message) }
    finally { setBusyId(null) }
  }

  async function remove(id) {
    if (!window.confirm('Delete this request? This cannot be undone.')) return
    setBusyId(id)
    try {
      const { error } = await supabase.from('game_requests').delete().eq('id', id)
      if (error) throw error
      setRows(rows.filter(r => r.id !== id))
    } catch (e) { alert('Delete failed: ' + e.message) }
    finally { setBusyId(null) }
  }

  const counts = useMemo(() => {
    const c = { all: rows?.length || 0 }
    for (const s of REQUEST_STATUS) c[s.value] = (rows || []).filter(r => r.status === s.value).length
    return c
  }, [rows])

  return (
    <Box sx={{ pt: 4, pb: 2 }}>
      <PanelCard title={`Game requests${rows ? ' (' + rows.length + ')' : ''}`}
        color="info" icon={MailOutlineIcon}
        action={
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField size="small" select
              value={statusFilter || '__all__'}
              onChange={e => setStatusFilter(e.target.value === '__all__' ? '' : e.target.value)}
              sx={pillFieldSx(180)}
              SelectProps={{
                IconComponent: (props) => <ArrowForwardIcon {...props} sx={{ transform: 'rotate(90deg)', color: '#6c757d', mr: 1 }} />,
              }}>
              <MenuItem value="__all__">All statuses</MenuItem>
              <Divider />
              {REQUEST_STATUS.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label} ({counts[s.value] || 0})</MenuItem>
              ))}
            </TextField>
            <TextField size="small" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search…" sx={pillFieldSx(220)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <SearchIcon fontSize="small" sx={{ color: '#9ba3b4' }} />
                  </InputAdornment>
                ),
              }} />
          </Stack>
        }>
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err} — make sure you've run <code>scripts/requests-setup.sql</code>.
          </Alert>
        )}
        {!rows && !err && <Typography color="text.secondary">Loading…</Typography>}
        {rows && rows.length === 0 && !err && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <MailOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No game requests yet.</Typography>
          </Box>
        )}
        {rows && rows.length > 0 && filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>No requests match.</Typography>
        )}
        {filtered.length > 0 && (
          <Stack spacing={1.5}>
            {filtered.map(r => {
              const st = REQUEST_STATUS.find(s => s.value === r.status) || REQUEST_STATUS[0]
              return (
                <Box key={r.id} id={`request-${r.id}`} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 2, p: 2,
                  background: highlightId === r.id ? 'rgba(26,115,232,.06)' : '#fff',
                  borderRadius: 1.5,
                  border: '1px solid', borderColor: highlightId === r.id ? 'info.main' : 'divider',
                  transition: 'all .5s ease',
                }}>
                  {r.image_url ? (
                    <Box onClick={() => setZoomUrl(r.image_url)} sx={{
                      width: 70, height: 70, borderRadius: 1, flexShrink: 0, cursor: 'zoom-in',
                      background: `#000 url(${r.image_url}) center/cover no-repeat`,
                      border: '1px solid', borderColor: 'divider',
                    }} />
                  ) : (
                    <Box sx={{
                      width: 70, height: 70, borderRadius: 1, flexShrink: 0,
                      background: 'grey.200', display: 'grid', placeItems: 'center', color: 'text.disabled',
                    }}><ImageIcon /></Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{r.game_title}</Typography>
                      <Chip size="small" label={st.label} color={st.color} />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary"><strong>{r.name}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">
                        <a href={`tel:${r.phone}`} style={{ color: 'inherit' }}>{r.phone}</a>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <a href={`https://wa.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#22c55e' }}>WhatsApp ↗</a>
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}>
                      {REQUEST_STATUS.map(s => (
                        <Chip key={s.value}
                          label={s.label}
                          size="small"
                          clickable
                          disabled={busyId === r.id}
                          color={r.status === s.value ? s.color : 'default'}
                          variant={r.status === s.value ? 'filled' : 'outlined'}
                          onClick={() => setStatus(r.id, s.value)} />
                      ))}
                    </Stack>
                  </Box>
                  <Tooltip title="Delete request">
                    <span>
                      <IconButton size="small" color="error" disabled={busyId === r.id}
                        onClick={() => remove(r.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )
            })}
          </Stack>
        )}
      </PanelCard>
      {zoomUrl && <MediaLightbox url={zoomUrl} onClose={() => setZoomUrl(null)} />}
    </Box>
  )
}

function SettingsPage({ settings, setSettings }) {
  const shop = useShop()
  const loyalty = settings?.loyalty || DEFAULT_SETTINGS.loyalty
  const updateLoyalty = (patch) => setSettings({ ...settings, loyalty: { ...loyalty, ...patch } })

  // Live preview math
  const previewSpend = 1000
  const previewPoints = loyalty.enabled
    ? Math.round(previewSpend * Number(loyalty.multiplier || 0))
    : 0

  return (
    <Box sx={{ pt: 4, pb: 2 }}>
      <Grid container spacing={3}>

        {/* Account */}
        <Grid item xs={12} md={5}>
          <PanelCard title="Account" color="info" icon={SettingsIcon}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Signed in as
                </Typography>
                <Typography variant="body2">{shop.user?.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                  Role
                </Typography>
                <Typography variant="body2">Administrator</Typography>
              </Box>
            </Stack>
          </PanelCard>
        </Grid>

        {/* Loyalty / Crazy Points */}
        <Grid item xs={12} md={7}>
          <PanelCard title="Loyalty Points" color="primary" icon={StarIcon}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Customers see this on every product page as <em>"Earn N {loyalty.label || 'Crazy Points'}"</em>.
            </Typography>

            <FormControlLabel
              control={<Switch checked={loyalty.enabled !== false}
                onChange={e => updateLoyalty({ enabled: e.target.checked })} color="info" />}
              label={loyalty.enabled !== false ? 'Loyalty points enabled' : 'Loyalty points disabled'}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small"
                  type="number"
                  label="Multiplier (points per EGP)"
                  value={loyalty.multiplier}
                  onChange={e => updateLoyalty({ multiplier: e.target.value })}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={loyalty.enabled === false}
                  helperText={`${(Number(loyalty.multiplier || 0) * 100).toFixed(0)}% of spend earned back as points`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small"
                  label="Currency label"
                  value={loyalty.label || ''}
                  onChange={e => updateLoyalty({ label: e.target.value })}
                  disabled={loyalty.enabled === false}
                  placeholder="Crazy Points"
                  helperText="e.g. Crazy Points, Stars, Coins" />
              </Grid>
            </Grid>

            {/* Quick presets */}
            <Box sx={{ mt: 2, mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Quick rate presets
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {[
                  { label: '1%',  value: 0.01 },
                  { label: '2%',  value: 0.02 },
                  { label: '5%',  value: 0.05 },
                  { label: '10%', value: 0.10 },
                  { label: '20%', value: 0.20 },
                  { label: '50%', value: 0.50 },
                ].map(preset => (
                  <Chip key={preset.label}
                    label={preset.label}
                    size="small"
                    clickable
                    color={Math.abs(Number(loyalty.multiplier) - preset.value) < 0.001 ? 'primary' : 'default'}
                    variant={Math.abs(Number(loyalty.multiplier) - preset.value) < 0.001 ? 'filled' : 'outlined'}
                    onClick={() => updateLoyalty({ multiplier: preset.value })}
                    disabled={loyalty.enabled === false} />
                ))}
              </Stack>
            </Box>

            {/* Live preview */}
            <Box sx={{
              mt: 2, p: 2, borderRadius: 1.5,
              background: 'rgba(233, 30, 99, 0.06)',
              border: '1px solid', borderColor: 'rgba(233, 30, 99, 0.25)',
            }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'primary.main', display: 'block', mb: 0.5 }}>
                Preview
              </Typography>
              {loyalty.enabled !== false ? (
                <Typography variant="body2">
                  On a {EGP(previewSpend)} purchase, the customer earns&nbsp;
                  <strong style={{ color: '#e91e63' }}>
                    ⭐ {previewPoints.toLocaleString()} {loyalty.label || 'Crazy Points'}
                  </strong>
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loyalty points are hidden from the product page.
                </Typography>
              )}
            </Box>
          </PanelCard>
        </Grid>

      </Grid>
    </Box>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function Dashboard({ initialPage = 'overview' }) {
  const shop = useShop()
  useSeo({ title: 'Dashboard', path: '/dashboard', noindex: true })
  const [page, setPageRaw] = useState(initialPage || 'overview')
  const [settings, setSettings] = useState(shop.siteSettings || DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(0)
  const [saveErr, setSaveErr] = useState('')
  const [adminChecked, setAdminChecked] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [deepLink, setDeepLink] = useState(null)

  // Navigate to a dashboard sub-page and update the URL
  const setPage = useCallback((key) => {
    setPageRaw(key)
    const url = '/dashboard' + (key && key !== 'overview' ? '/' + key : '')
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url)
    }
  }, [])

  // Sync with browser back/forward
  useEffect(() => {
    const onPop = () => {
      const m = window.location.pathname.match(/^\/dashboard(?:\/(.+))?$/)
      if (m) setPageRaw(m[1] || 'overview')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Sync if initialPage changes from parent (e.g. direct URL navigation)
  useEffect(() => {
    if (initialPage && initialPage !== page) {
      setPageRaw(initialPage)
    }
  }, [initialPage])

  useEffect(() => { if (shop.siteSettings) setSettings(shop.siteSettings) }, [shop.siteSettings])

  useEffect(() => {
    let alive = true
    setAdminChecked(false)
    if (!shop.user) { setIsAdminUser(false); setAdminChecked(true); return }
    isAdmin(shop.user.id).then(ok => { if (alive) { setIsAdminUser(ok); setAdminChecked(true) } })
    return () => { alive = false }
  }, [shop.user])

  useEffect(() => {
    if (!shop.siteSettings) return
    setDirty(JSON.stringify(settings) !== JSON.stringify(shop.siteSettings))
  }, [settings, shop.siteSettings])

  const notifications = useNotifications()

  if (!adminChecked) return (
    <ThemeProvider theme={mdTheme}><CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary">Checking access…</Typography>
      </Box>
    </ThemeProvider>
  )
  if (!shop.user || !isAdminUser) return (
    <ThemeProvider theme={mdTheme}><CssBaseline /><LoginScreen onAuthed={() => setIsAdminUser(true)} /></ThemeProvider>
  )

  async function save() {
    setSaving(true); setSaveErr('')
    const res = await saveSettings(settings)
    setSaving(false)
    if (res.ok) { setSavedAt(Date.now()); if (shop.setSiteSettings) shop.setSiteSettings(settings) }
    else setSaveErr(res.error || 'Save failed')
  }

  const currentNav = NAV.find(n => n.key === page) || NAV[0]
  const showSaveBar = ['hero', 'sections', 'settings'].includes(page)

  return (
    <ThemeProvider theme={mdTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
        <Sidenav page={page} setPage={setPage} user={shop.user} />
        <Box component="main" sx={{ flexGrow: 1, p: 2, ml: 2, minWidth: 0 }}>
          <TopBar title={currentNav.label}
            onSave={showSaveBar ? save : null}
            saving={saving} dirty={dirty} savedAt={savedAt} saveErr={saveErr}
            onLogout={async () => { await signOut(); shop.goHome() }}
            notifications={notifications}
            onNotificationNavigate={(pg, entityId, type) => {
              setPage(pg)
              setDeepLink({ page: pg, entityId, type, ts: Date.now() })
            }} />
          {page === 'overview'  && <OverviewPage />}
          {page === 'hero'      && <HeroPage settings={settings} setSettings={setSettings} />}
          {page === 'sections'  && <SectionsPage settings={settings} setSettings={setSettings} />}
          {page === 'products'  && <ProductsPage deepLink={deepLink} onDeepLinkConsumed={() => setDeepLink(null)} />}
          {page === 'blog'      && <BlogManagementPage />}
          {page === 'requests'  && <RequestsPage deepLink={deepLink} onDeepLinkConsumed={() => setDeepLink(null)} />}
          {page === 'orders'    && <OrdersPage deepLink={deepLink} onDeepLinkConsumed={() => setDeepLink(null)} />}
          {page === 'customers' && <CustomersPage />}
          {page === 'settings'  && <SettingsPage settings={settings} setSettings={setSettings} />}
        </Box>
      </Box>
    </ThemeProvider>
  )
}
