import api from '../../../services'
import type {
  ChecklistTemplate,
  ChecklistTemplateRequest,
  ChecklistRegistro,
  ChecklistRegistroRequest,
  RegistroFiltros,
} from '../types'

export const getTemplates = async (): Promise<ChecklistTemplate[]> => {
  const response = await api.get('/api/checklists/templates')
  return response.data
}

export const getTemplate = async (id: number): Promise<ChecklistTemplate> => {
  const response = await api.get(`/api/checklists/templates/${id}`)
  return response.data
}

export const createTemplate = async (data: ChecklistTemplateRequest): Promise<ChecklistTemplate> => {
  const response = await api.post('/api/checklists/templates', data)
  return response.data
}

export const updateTemplate = async (
  id: number,
  data: ChecklistTemplateRequest
): Promise<ChecklistTemplate> => {
  const response = await api.put(`/api/checklists/templates/${id}`, data)
  return response.data
}

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/api/checklists/templates/${id}`)
}

export const getRegistros = async (filtros?: RegistroFiltros): Promise<ChecklistRegistro[]> => {
  const response = await api.get('/api/checklists/registros', {
    params: {
      estado: filtros?.estado,
      movilidadId: filtros?.movilidadId,
    },
  })
  return response.data
}

export const getRegistro = async (id: number): Promise<ChecklistRegistro> => {
  const response = await api.get(`/api/checklists/registros/${id}`)
  return response.data
}

export const createRegistro = async (data: ChecklistRegistroRequest): Promise<ChecklistRegistro> => {
  const response = await api.post('/api/checklists/registros', data)
  return response.data
}

export const firmarRegistro = async (id: number): Promise<ChecklistRegistro> => {
  const response = await api.post(`/api/checklists/registros/${id}/firmar`)
  return response.data
}
