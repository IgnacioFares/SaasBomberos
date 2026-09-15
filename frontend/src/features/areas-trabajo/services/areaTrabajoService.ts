import api from '../../../services'
import type { AreaTrabajo, AreaTrabajoRequest, TareaArea, TareaAreaRequest } from '../types'

export const getAreas = async (): Promise<AreaTrabajo[]> => {
  const response = await api.get('/api/areas-trabajo')
  return response.data
}

export const getArea = async (id: number): Promise<AreaTrabajo> => {
  const response = await api.get(`/api/areas-trabajo/${id}`)
  return response.data
}

export const createArea = async (area: AreaTrabajoRequest): Promise<AreaTrabajo> => {
  const response = await api.post('/api/areas-trabajo', area)
  return response.data
}

export const updateArea = async (id: number, area: AreaTrabajoRequest): Promise<AreaTrabajo> => {
  const response = await api.put(`/api/areas-trabajo/${id}`, area)
  return response.data
}

export const deleteArea = async (id: number): Promise<void> => {
  await api.delete(`/api/areas-trabajo/${id}`)
}

export const getTareas = async (areaId: number): Promise<TareaArea[]> => {
  const response = await api.get(`/api/areas-trabajo/${areaId}/tareas`)
  return response.data
}

export const createTarea = async (areaId: number, tarea: TareaAreaRequest): Promise<TareaArea> => {
  const response = await api.post(`/api/areas-trabajo/${areaId}/tareas`, tarea)
  return response.data
}

export const eliminarTarea = async (id: number): Promise<void> => {
  await api.delete(`/api/tareas-area/${id}`)
}

export const completarTarea = async (id: number): Promise<TareaArea> => {
  const response = await api.patch(`/api/tareas-area/${id}/completar`)
  return response.data
}
