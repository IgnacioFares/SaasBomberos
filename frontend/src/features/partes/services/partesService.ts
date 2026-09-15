import api from '../../../services'
import type { Parte, ParteFormData, ParteResumen } from '../types'

export const getPartes = async (): Promise<ParteResumen[]> => {
  const response = await api.get('/api/partes')
  return response.data
}

export const getParte = async (id: number): Promise<Parte> => {
  const response = await api.get(`/api/partes/${id}`)
  return response.data
}

export const crearParte = async (data: ParteFormData): Promise<Parte> => {
  const response = await api.post('/api/partes', data)
  return response.data
}

export const actualizarParte = async (id: number, data: ParteFormData): Promise<Parte> => {
  const response = await api.put(`/api/partes/${id}`, data)
  return response.data
}

export const finalizarParte = async (id: number): Promise<Parte> => {
  const response = await api.patch(`/api/partes/${id}/finalizar`)
  return response.data
}

export const reabrirParte = async (id: number): Promise<Parte> => {
  const response = await api.patch(`/api/partes/${id}/reabrir`)
  return response.data
}

// Descarga el PDF y dispara la descarga en el navegador. El nombre real
// del archivo lo define el backend vía Content-Disposition; acá se
// reconstruye uno equivalente como fallback por si no llega el header.
export const descargarPdf = async (id: number, nombreSugerido: string): Promise<void> => {
  const response = await api.get(`/api/partes/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nombreSugerido
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
