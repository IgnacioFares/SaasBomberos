import { useEffect, useState } from 'react'
import type { AreaTrabajo, AreaTrabajoRequest } from '../types'
import { getAreas, createArea, updateArea, deleteArea } from '../services/areaTrabajoService'
import { extraerMensajeError } from '../../../utils/http'

const useAreasTrabajo = () => {
  const [areas, setAreas] = useState<AreaTrabajo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargarAreas = async () => {
    setLoading(true)
    try {
      const datos = await getAreas()
      setAreas(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar las áreas de trabajo'))
    } finally {
      setLoading(false)
    }
  }

  const agregar = async (area: AreaTrabajoRequest) => {
    setError(null)
    try {
      await createArea(area)
      await cargarAreas()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al crear el área de trabajo'))
      return false
    }
  }

  const actualizar = async (id: number, area: AreaTrabajoRequest) => {
    setError(null)
    try {
      await updateArea(id, area)
      await cargarAreas()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al actualizar el área de trabajo'))
      return false
    }
  }

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await deleteArea(id)
      await cargarAreas()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al eliminar el área de trabajo'))
    }
  }

  useEffect(() => {
    cargarAreas()
  }, [])

  return { areas, loading, error, agregar, actualizar, eliminar }
}

export default useAreasTrabajo
