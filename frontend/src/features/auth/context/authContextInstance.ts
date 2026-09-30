import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Usuario } from '../types'

export interface ResultadoLogin {
  ok: boolean
  faltaVerificar: boolean
}

export interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  error: string | null
  estaAutenticado: boolean
  // "faltaVerificar" distingue la contraseña incorrecta de la cuenta
  // con el email sin confirmar, que se resuelve con el código.
  iniciarSesion: (credenciales: LoginRequest) => Promise<ResultadoLogin>
  // Devuelve el email al que se mandó el código, o null si falló.
  registrarse: (datos: RegisterRequest) => Promise<boolean>
  cerrarSesion: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
