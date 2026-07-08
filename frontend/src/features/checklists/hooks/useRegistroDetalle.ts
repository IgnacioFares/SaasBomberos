import { useEffect, useState } from 'react'
import type { ChecklistRegistro } from '../types'
import { getRegistro, firmarRegistro } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'

const useRegistroDetalle = (id: number | null) => {
  const [registro, setRegistro] = useState<ChecklistRegistro | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  const [firmando, setFirmando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === null) return
    setCargando(true)
    getRegistro(id)
      .then(setRegistro)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar el checklist')))
      .finally(() => setCargando(false))
  }, [id])

  const firmar = async () => {
    if (id === null) return false
    setFirmando(true)
    setError(null)
    try {
      const actualizado = await firmarRegistro(id)
      setRegistro(actualizado)
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo firmar el checklist'))
      return false
    } finally {
      setFirmando(false)
    }
  }

  return { registro, cargando, firmando, error, firmar }
}

export default useRegistroDetalle
