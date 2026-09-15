import { useContext } from 'react'
import { ThemeModeContext } from './themeModeContextInstance'

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext)
  if (!context) {
    throw new Error('useThemeMode debe usarse dentro de un ThemeModeProvider')
  }
  return context
}
