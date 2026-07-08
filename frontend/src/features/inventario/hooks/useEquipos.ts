import { useCallback, useEffect, useState } from 'react'
import type { Equipo } from '../types'
import { getEquipos, deleteEquipo } from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'

const useEquipos = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setEquipos(await getEquipos())
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar el inventario'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await deleteEquipo(id)
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al eliminar el equipo'))
      return false
    }
  }

  return { equipos, loading, error, eliminar, recargar: cargar }
}

export default useEquipos
