import { useCallback, useEffect, useState } from 'react'
import type { ChecklistRegistro, RegistroFiltros } from '../types'
import { getRegistros } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'

const useChecklistRegistros = (filtros?: RegistroFiltros) => {
  const [registros, setRegistros] = useState<ChecklistRegistro[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const estado = filtros?.estado
  const movilidadId = filtros?.movilidadId

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const datos = await getRegistros({ estado, movilidadId })
      setRegistros(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar el historial de checklists'))
    } finally {
      setLoading(false)
    }
  }, [estado, movilidadId])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { registros, loading, error, recargar: cargar }
}

export default useChecklistRegistros
