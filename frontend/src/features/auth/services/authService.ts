import api from '../../../services'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Usuario,
} from '../types/index'

export const login = async (credenciales: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/api/usuarios/login', credenciales)
  return response.data
}

// La cuenta queda activa al instante y el backend devuelve el token.
export const registrar = async (datos: RegisterRequest): Promise<LoginResponse> => {
  const response = await api.post('/api/usuarios/registro', datos)
  return response.data
}

export const verificarEmail = async (email: string, codigo: string): Promise<void> => {
  await api.post('/api/usuarios/verificar-email', { email, codigo })
}

export const reenviarCodigo = async (email: string): Promise<void> => {
  await api.post('/api/usuarios/reenviar-codigo', { email })
}

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const response = await api.get('/api/usuarios/me')
  return response.data
}
