import { useEffect, useState, type ReactNode } from 'react'
import type { LoginRequest, RegisterRequest, Usuario } from '../types'
import {
  login as loginRequest,
  registrar as registrarRequest,
  obtenerUsuarioActual,
} from '../services/authService'
import { AuthContext } from './authContextInstance'
import { extraerMensajeError } from '../../../utils/http'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCargando(false)
      return
    }
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => {
        localStorage.removeItem('token')
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  const iniciarSesion = async (credenciales: LoginRequest) => {
    setError(null)
    try {
      const respuesta = await loginRequest(credenciales)
      localStorage.setItem('token', respuesta.token)
      const usuarioActual = await obtenerUsuarioActual()
      setUsuario(usuarioActual)
      return true
    } catch (err) {
      localStorage.removeItem('token')
      setError(extraerMensajeError(err, 'Email o contraseña incorrectos'))
      return false
    }
  }

  const registrarse = async (datos: RegisterRequest) => {
    setError(null)
    try {
      await registrarRequest(datos)
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo completar el registro. Verificá los datos ingresados.'))
      return false
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        error,
        estaAutenticado: usuario !== null,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
