import { useEffect, useState, type ReactNode } from 'react'
import type { LoginRequest, RegisterRequest, Usuario } from '../types'
import {
  login as loginRequest,
  registrar as registrarRequest,
  obtenerUsuarioActual,
} from '../services/authService'
import { AuthContext } from './authContextInstance'
import { extraerMensajeError, esEmailNoVerificado } from '../../../utils/http'

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
      return { ok: true, faltaVerificar: false }
    } catch (err) {
      localStorage.removeItem('token')
      // Si la contraseña era correcta pero falta confirmar el email, no
      // es un error a mostrar en rojo: el login ofrece verificarlo.
      if (esEmailNoVerificado(err)) {
        setError(null)
        return { ok: false, faltaVerificar: true }
      }
      setError(extraerMensajeError(err, 'Email o contraseña incorrectos'))
      return { ok: false, faltaVerificar: false }
    }
  }

  const registrarse = async (datos: RegisterRequest) => {
    setError(null)
    try {
      const respuesta = await registrarRequest(datos)
      localStorage.setItem('token', respuesta.token)
      setUsuario(await obtenerUsuarioActual())
      return true
    } catch (err) {
      localStorage.removeItem('token')
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
