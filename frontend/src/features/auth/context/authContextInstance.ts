import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Usuario } from '../types'

export interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  error: string | null
  estaAutenticado: boolean
  iniciarSesion: (credenciales: LoginRequest) => Promise<boolean>
  registrarse: (datos: RegisterRequest) => Promise<boolean>
  cerrarSesion: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
