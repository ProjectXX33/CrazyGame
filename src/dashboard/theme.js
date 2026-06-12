/* MUI theme replicating Material Dashboard 2 React's visual language. */
import { createTheme } from '@mui/material/styles'

export const COLORS = {
  primary:   { main: '#ff8c00', light: '#ffa726', dark: '#f52200' },   // orange-red primary
  info:      { main: '#ff5c00', light: '#ff8c00', dark: '#cc4a00' },   // orange accent
  success:   { main: '#4caf50', light: '#66bb6a', dark: '#388e3c' },
  warning:   { main: '#fb8c00', light: '#ffa726', dark: '#f57c00' },
  error:     { main: '#F44335', light: '#ef5350', dark: '#c62828' },
  dark:      { main: '#344767', light: '#7b809a', dark: '#1a2035' },
  grey:      { 100: '#f8f9fa', 200: '#f0f2f5', 300: '#dee2e6', 400: '#ced4da', 500: '#adb5bd', 600: '#6c757d', 700: '#495057', 800: '#343a40', 900: '#212529' },
}

export const gradients = {
  primary: 'linear-gradient(195deg, #ff8c00, #f52200)',
  info:    'linear-gradient(195deg, #ff8c00, #f52200)',
  success: 'linear-gradient(195deg, #66BB6A, #43A047)',
  warning: 'linear-gradient(195deg, #FFA726, #FB8C00)',
  error:   'linear-gradient(195deg, #EF5350, #E53935)',
  dark:    'linear-gradient(195deg, #42424a, #191919)',
}

export const mdTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: COLORS.primary,
    info:    COLORS.info,
    success: COLORS.success,
    warning: COLORS.warning,
    error:   COLORS.error,
    background: { default: '#0c061a', paper: '#120a22' },
    text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 700, fontSize: '1.25rem' },
    h6: { fontWeight: 700, fontSize: '1.05rem' },
    button: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02857em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'rgba(0, 0, 0, 0.1) 0rem 0.25rem 1.25rem 0rem, rgba(0, 0, 0, 0.04) 0rem 0.25rem 0.5rem -0.0625rem',
          overflow: 'visible',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
  },
})
