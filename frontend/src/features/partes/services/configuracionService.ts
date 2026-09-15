import api from '../../../services'

export interface ConfiguracionCuerpo {
  nombreCuerpo: string
  jefeDeCuerpo: string
  departamentoElaboracion: string
}

export const getConfiguracion = async (): Promise<ConfiguracionCuerpo> => {
  const response = await api.get('/api/configuracion')
  return response.data
}

export const actualizarConfiguracion = async (data: ConfiguracionCuerpo): Promise<ConfiguracionCuerpo> => {
  const response = await api.put('/api/configuracion', data)
  return response.data
}
