import { CssBaseline, ThemeProvider } from '@mui/material'
import type { ReactNode } from 'react'
import buildTheme from './index'

const lightTheme = buildTheme('light')

// El login/registro no sigue el "Modo oscuro" que el usuario haya elegido
// en una sesión anterior: es la puerta de entrada, antes de que exista un
// usuario autenticado, y el panel con la foto del cuartel está pensado
// para verse siempre igual.
//
// El CssBaseline se vuelve a aplicar acá con el tema claro a propósito:
// el del provider raíz ya pintó el fondo del <body> y el color-scheme
// del navegador según el modo guardado, así que sin esto se veía el
// borde oscuro alrededor de la tarjeta, las barras de scroll oscuras y
// los campos autocompletados en negro.
const ForceLightTheme = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={lightTheme}>
    <CssBaseline enableColorScheme />
    {children}
  </ThemeProvider>
)

export default ForceLightTheme
