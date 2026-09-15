import { ThemeProvider } from '@mui/material'
import type { ReactNode } from 'react'
import buildTheme from './index'

const lightTheme = buildTheme('light')

// El login/registro no sigue el "Modo oscuro" que el usuario haya elegido
// en una sesión anterior: es la puerta de entrada, antes de que exista un
// usuario autenticado, y el panel con la foto del cuartel está pensado
// para verse siempre igual.
const ForceLightTheme = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
)

export default ForceLightTheme
