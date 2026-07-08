import { useEffect, useState } from 'react'
import type { Movilidad } from '../../../types'
import {
  getMovilidades,
  createMovilidad,
  updateMovilidad,
  deleteMovilidad,
} from '../services/movilidadService'
import { extraerMensajeError } from '../../../utils/http'

const useMovilidades = () => {
  const [movilidades, setMovilidades] = useState<Movilidad[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargarMovilidades = async () => {
    setLoading(true)
    try {
      const datos = await getMovilidades()
      setMovilidades(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar las movilidades'))
    } finally {
      setLoading(false)
    }
  }

  const agregar = async (movilidad: Movilidad) => {
    setError(null)
    try {
      await createMovilidad(movilidad)
      await cargarMovilidades()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al crear la movilidad'))
      return false
    }
  }

  const actualizar = async (id: number, movilidad: Movilidad) => {
    setError(null)
    try {
      await updateMovilidad(id, movilidad)
      await cargarMovilidades()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al actualizar la movilidad'))
      return false
    }
  }

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await deleteMovilidad(id)
      await cargarMovilidades()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al eliminar la movilidad'))
    }
  }

  useEffect(() => {
    cargarMovilidades()
  }, [])

  return { movilidades, loading, error, agregar, actualizar, eliminar }
}

export default useMovilidades
