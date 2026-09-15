import { createContext, useContext, type ReactNode } from 'react'
import useAreasTrabajoState from '../hooks/useAreasTrabajo'

type AreasTrabajoContextValue = ReturnType<typeof useAreasTrabajoState>

const AreasTrabajoContext = createContext<AreasTrabajoContextValue | null>(null)

export const AreasTrabajoProvider = ({ children }: { children: ReactNode }) => {
  const value = useAreasTrabajoState()
  return <AreasTrabajoContext.Provider value={value}>{children}</AreasTrabajoContext.Provider>
}

export const useAreasTrabajoContext = () => {
  const contexto = useContext(AreasTrabajoContext)
  if (!contexto) {
    throw new Error('useAreasTrabajoContext debe usarse dentro de AreasTrabajoProvider')
  }
  return contexto
}
