import { createContext } from 'react'
import type { ColorMode } from './index'

export interface ThemeModeContextValue {
  mode: ColorMode
  toggleMode: () => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)
