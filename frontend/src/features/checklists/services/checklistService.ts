import api from '../../../services'
import type {
  ChecklistTemplate,
  ChecklistTemplateRequest,
  ChecklistRegistro,
  ChecklistRegistroRequest,
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

export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/api/checklists/templates/${id}`)
}

export const getRegistros = async (): Promise<ChecklistRegistro[]> => {
  const response = await api.get('/api/checklists/registros')
  return response.data
}

export const createRegistro = async (data: ChecklistRegistroRequest): Promise<ChecklistRegistro> => {
  const response = await api.post('/api/checklists/registros', data)
  return response.data
}
