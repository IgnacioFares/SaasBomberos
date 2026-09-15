import { createTheme, type Theme } from '@mui/material/styles'

export type ColorMode = 'light' | 'dark'

// Paleta "bombero": rojo como color de marca (sidebar, botones, estados
// activos) y dorado como acento secundario (insignias, chips destacados),
// en vez del azul/teal genérico de un SaaS de gestión cualquiera.
//
// El modo oscuro no usa el gris azulado típico de Material UI: usa
// neutros cálidos (casi negro amarronado, no negro-azulado) al estilo de
// la interfaz de Claude, que se lleva mejor con el rojo de marca que un
// dark mode "frío".
const buildTheme = (mode: ColorMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#B91C1C' : '#EF4444',
        light: mode === 'light' ? '#DC2626' : '#F87171',
        dark: mode === 'light' ? '#7F1D1D' : '#B91C1C',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: mode === 'light' ? '#B45309' : '#F59E0B',
        light: mode === 'light' ? '#D97706' : '#FBBF24',
        dark: mode === 'light' ? '#92400E' : '#D97706',
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light' ? '#F1F5F9' : '#1F1E1D',
        paper: mode === 'light' ? '#FFFFFF' : '#2A2926',
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F2F0EB',
        secondary: mode === 'light' ? '#475569' : '#B8B3AA',
      },
      success: {
        main: mode === 'light' ? '#16A34A' : '#4ADE80',
      },
      warning: {
        main: mode === 'light' ? '#D97706' : '#FBBF24',
      },
      error: {
        main: mode === 'light' ? '#DC2626' : '#F87171',
      },
      divider: mode === 'light' ? '#E2E8F0' : '#3D3B37',
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
    },
  })

export default buildTheme
