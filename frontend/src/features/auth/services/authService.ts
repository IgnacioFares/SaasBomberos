import api from '../../../services'
import type { LoginRequest, RegisterRequest, LoginResponse, Usuario } from '../types/index'
import type { Bombero } from '../../../types'

export const login = async (credenciales: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/api/usuarios/login', credenciales)
  return response.data
}

export const registrar = async (datos: RegisterRequest): Promise<Bombero> => {
  const response = await api.post('/api/usuarios/registro', datos)
  return response.data
}

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const response = await api.get('/api/usuarios/me')
  return response.data
}
