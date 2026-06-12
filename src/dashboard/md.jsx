/* Material Dashboard 2 React – style building blocks (MUI-based).
   Lightweight equivalents of MDBox / MDTypography / StatCard / DashboardLayout
   without pulling in the full Creative Tim template. */
import { Card, CardContent, Box, Typography, Divider } from '@mui/material'
import { gradients } from './theme.js'

// ── Stat card (matches MD2 React's ComplexStatisticsCard) ─────────────────
export function StatCard({ color = 'info', icon: IconCmp, title, count, percentage }) {
  return (
    <Card sx={{ overflow: 'visible', mt: 4, display: 'flex', flexDirection: 'column', height: 'calc(100% - 32px)', width: '100%', minWidth: 0 }}>
      <Box sx={{ position: 'relative', mt: -3, mx: 2 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '12px',
          background: gradients[color] || gradients.info,
          color: '#fff', display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(0,0,0,.4)',
        }}>
          {IconCmp && <IconCmp sx={{ fontSize: 28, color: '#fff' }} />}
        </Box>
      </Box>
      <CardContent sx={{ textAlign: 'right', pt: 2, flexGrow: 1 }}>
        <Typography variant="button" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'capitalize' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: 'text.primary', mt: 0.5 }}>
          {count}
        </Typography>
      </CardContent>
      <Divider sx={{ mx: 2, my: 0 }} />
      <Box sx={{ px: 3, py: 1.25, visibility: percentage ? 'visible' : 'hidden', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Typography component="span" variant="button" sx={{
          fontWeight: 700, color: percentage?.color || 'success.main', mr: 0.5, flexShrink: 0
        }}>{percentage?.amount || '\u00A0'}</Typography>
        <Typography component="span" variant="button" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {percentage?.label || '\u00A0'}
        </Typography>
      </Box>
    </Card>
  )
}

// ── Section card with title bar (Projects / OrdersOverview pattern) ───────
export function PanelCard({ title, action, children, color = 'info', icon: IconCmp }) {
  return (
    <Card sx={{ overflow: 'visible', mt: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        mt: -3, mx: 2, py: 3, px: 2, borderRadius: '12px',
        background: gradients[color] || gradients.info, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,.14)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {IconCmp && <IconCmp sx={{ fontSize: 22, color: '#fff' }} />}
          <Typography variant="h6" sx={{ color: '#fff' }}>{title}</Typography>
        </Box>
        {action}
      </Box>
      <CardContent sx={{ pt: 3 }}>{children}</CardContent>
    </Card>
  )
}

// ── Plain card with header (no gradient) ──────────────────────────────────
export function PlainCard({ title, action, children }) {
  return (
    <Card>
      <CardContent>
        {(title || action) && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            mb: 2, gap: 2, flexWrap: 'wrap',
          }}>
            {title && <Typography variant="h6">{title}</Typography>}
            {action}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
