import { useEffect, useState } from 'react'
import type { ChecklistRegistro } from '../types'
import { getRegistros } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'

const useChecklistRegistros = () => {
  const [registros, setRegistros] = useState<ChecklistRegistro[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const datos = await getRegistros()
      setRegistros(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar el historial de checklists'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return { registros, loading, error, recargar: cargar }
}

export default useChecklistRegistros
