import api from '../../../services'
import type {
  Despacho,
  NuevoDespacho,
  OrigenSugerido,
  PosicionPing,
  Seguimiento,
} from '../types'

export const getDespachos = async (soloEnCurso = false): Promise<Despacho[]> => {
  const response = await api.get('/api/despachos', { params: { enCurso: soloEnCurso } })
  return response.data
}

export const getDespacho = async (id: number): Promise<Despacho> => {
  const response = await api.get(`/api/despachos/${id}`)
  return response.data
}

export const getSeguimiento = async (id: number): Promise<Seguimiento> => {
  const response = await api.get(`/api/despachos/${id}/seguimiento`)
  return response.data
}

export const createDespacho = async (despacho: NuevoDespacho): Promise<Despacho> => {
  const response = await api.post('/api/despachos', despacho)
  return response.data
}

export const finalizarDespacho = async (id: number): Promise<Despacho> => {
  const response = await api.patch(`/api/despachos/${id}/finalizar`)
  return response.data
}

export const deleteDespacho = async (id: number): Promise<void> => {
  await api.delete(`/api/despachos/${id}`)
}

// La manda el celular del personal cada pocos segundos mientras está
// compartiendo su ubicación.
export const enviarUbicacion = async (id: number, posicion: PosicionPing): Promise<void> => {
  await api.post(`/api/despachos/${id}/ubicacion`, posicion)
}

export const getOrigenSugerido = async (movilidadId: number): Promise<OrigenSugerido> => {
  const response = await api.get(`/api/despachos/origen-sugerido/${movilidadId}`)
  return response.data
}
