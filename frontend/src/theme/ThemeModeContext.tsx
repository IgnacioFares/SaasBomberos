import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import buildTheme, { type ColorMode } from './index'
import { ThemeModeContext } from './themeModeContextInstance'

const STORAGE_KEY = 'bomberos-color-mode'

// Al primer ingreso se respeta la preferencia del sistema; a partir de ahí
// gana lo que el usuario elija a mano (persistido en localStorage).
const modoInicial = (): ColorMode => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado === 'light' || guardado === 'dark') return guardado
  } catch {
    // localStorage no disponible (ventana privada, etc.): se sigue con la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(modoInicial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // Si no se puede persistir, el modo elegido no sobrevive a un refresh; no es crítico.
    }
  }, [mode])

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  const theme = useMemo(() => buildTheme(mode), [mode])
  const value = useMemo(() => ({ mode, toggleMode }), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
