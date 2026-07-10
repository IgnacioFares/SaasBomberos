import api from '../../../services'
import type { PermisoInfo, RolInfo, UsuarioAdmin } from '../types'

export const getUsuarios = async (): Promise<UsuarioAdmin[]> => {
  const response = await api.get('/api/usuarios')
  return response.data
}

export const getPermisosDisponibles = async (): Promise<PermisoInfo[]> => {
  const response = await api.get('/api/usuarios/permisos-disponibles')
  return response.data
}

export const getRoles = async (): Promise<RolInfo[]> => {
  const response = await api.get('/api/usuarios/roles')
  return response.data
}

export const updatePermisos = async (usuarioId: number, permisos: string[]): Promise<UsuarioAdmin> => {
  const response = await api.put(`/api/usuarios/${usuarioId}/permisos`, { permisos })
  return response.data
}

export const updateRol = async (usuarioId: number, rolId: number): Promise<void> => {
  await api.put(`/api/usuarios/${usuarioId}/rol`, { rolId })
}
