import api from '../../../services'

export interface ConfiguracionCuerpo {
  nombreCuerpo: string
  jefeDeCuerpo: string
  departamentoElaboracion: string
  // Punto de partida de las movilidades: desde acá se estiman los
  // recorridos de los despachos (ver features/despachos).
  baseNombre?: string
  baseLat?: number | null
  baseLng?: number | null
}

export const getConfiguracion = async (): Promise<ConfiguracionCuerpo> => {
  const response = await api.get('/api/configuracion')
  return response.data
}

export const actualizarConfiguracion = async (data: ConfiguracionCuerpo): Promise<ConfiguracionCuerpo> => {
  const response = await api.put('/api/configuracion', data)
  return response.data
}
