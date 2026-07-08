import api from '../../../services'
import type { Movilidad } from '../../../types'

export const getMovilidades = async (): Promise<Movilidad[]> => {
  const response = await api.get('/api/movilidades')
  return response.data
}

export const createMovilidad = async (movilidad: Movilidad): Promise<Movilidad> => {
  const response = await api.post('/api/movilidades', movilidad)
  return response.data
}

export const updateMovilidad = async (id: number, movilidad: Movilidad): Promise<Movilidad> => {
  const response = await api.put(`/api/movilidades/${id}`, movilidad)
  return response.data
}

export const deleteMovilidad = async (id: number): Promise<void> => {
  await api.delete(`/api/movilidades/${id}`)
}
