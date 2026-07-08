import api from '../../../services'
import type {
  CambioEstadoRequest,
  CambioUbicacionRequest,
  CategoriaEquipo,
  Equipo,
  EquipoMovimiento,
  EquipoRequest,
  ObservacionRequest,
  UbicacionEquipo,
  UnidadUpdateRequest,
} from '../types'

// --- Categorías ---

export const getCategorias = async (): Promise<CategoriaEquipo[]> => {
  const response = await api.get('/api/inventario/categorias')
  return response.data
}

export const createCategoria = async (data: { nombre: string; padreId?: number | null }): Promise<CategoriaEquipo> => {
  const response = await api.post('/api/inventario/categorias', data)
  return response.data
}

export const updateCategoria = async (
  id: number,
  data: { nombre: string; padreId?: number | null }
): Promise<CategoriaEquipo> => {
  const response = await api.put(`/api/inventario/categorias/${id}`, data)
  return response.data
}

export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`/api/inventario/categorias/${id}`)
}

// --- Ubicaciones ---

export const getUbicaciones = async (): Promise<UbicacionEquipo[]> => {
  const response = await api.get('/api/inventario/ubicaciones')
  return response.data
}

export const createUbicacion = async (data: { nombre: string }): Promise<UbicacionEquipo> => {
  const response = await api.post('/api/inventario/ubicaciones', data)
  return response.data
}

export const updateUbicacion = async (id: number, data: { nombre: string }): Promise<UbicacionEquipo> => {
  const response = await api.put(`/api/inventario/ubicaciones/${id}`, data)
  return response.data
}

export const deleteUbicacion = async (id: number): Promise<void> => {
  await api.delete(`/api/inventario/ubicaciones/${id}`)
}

// --- Equipos ---

export const getEquipos = async (): Promise<Equipo[]> => {
  const response = await api.get('/api/inventario/equipos')
  return response.data
}

export const getEquipo = async (id: number): Promise<Equipo> => {
  const response = await api.get(`/api/inventario/equipos/${id}`)
  return response.data
}

export const createEquipo = async (data: EquipoRequest): Promise<Equipo> => {
  const response = await api.post('/api/inventario/equipos', data)
  return response.data
}

export const updateEquipo = async (id: number, data: EquipoRequest): Promise<Equipo> => {
  const response = await api.put(`/api/inventario/equipos/${id}`, data)
  return response.data
}

export const deleteEquipo = async (id: number): Promise<void> => {
  await api.delete(`/api/inventario/equipos/${id}`)
}

export const cambiarEstado = async (id: number, data: CambioEstadoRequest): Promise<Equipo> => {
  const response = await api.post(`/api/inventario/equipos/${id}/estado`, data)
  return response.data
}

export const cambiarUbicacion = async (id: number, data: CambioUbicacionRequest): Promise<Equipo> => {
  const response = await api.post(`/api/inventario/equipos/${id}/ubicacion`, data)
  return response.data
}

export const agregarObservacion = async (id: number, data: ObservacionRequest): Promise<Equipo> => {
  const response = await api.post(`/api/inventario/equipos/${id}/observaciones`, data)
  return response.data
}

export const updateUnidad = async (
  id: number,
  unidadId: number,
  data: UnidadUpdateRequest
): Promise<Equipo> => {
  const response = await api.put(`/api/inventario/equipos/${id}/unidades/${unidadId}`, data)
  return response.data
}

export const getMovimientos = async (id: number): Promise<EquipoMovimiento[]> => {
  const response = await api.get(`/api/inventario/equipos/${id}/movimientos`)
  return response.data
}
