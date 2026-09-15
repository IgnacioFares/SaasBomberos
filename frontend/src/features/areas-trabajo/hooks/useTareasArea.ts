import { useEffect, useState } from 'react'
import type { AreaTrabajo, TareaArea, TareaAreaRequest } from '../types'
import { getArea, getTareas, createTarea, eliminarTarea, completarTarea } from '../services/areaTrabajoService'
import { extraerMensajeError } from '../../../utils/http'

// Datos de un área + su historial de tareas, para la página de detalle.
const useTareasArea = (areaId: number | null) => {
  const [area, setArea] = useState<AreaTrabajo | null>(null)
  const [tareas, setTareas] = useState<TareaArea[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    if (areaId === null) return
    setCargando(true)
    try {
      const [datosArea, datosTareas] = await Promise.all([getArea(areaId), getTareas(areaId)])
      setArea(datosArea)
      setTareas(datosTareas)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cargar el área de trabajo'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId])

  const crearTarea = async (tarea: TareaAreaRequest) => {
    if (areaId === null) return false
    setGuardando(true)
    setError(null)
    try {
      await createTarea(areaId, tarea)
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear la tarea'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await eliminarTarea(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo eliminar la tarea'))
    }
  }

  const completar = async (id: number) => {
    setError(null)
    try {
      await completarTarea(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo marcar la tarea como realizada'))
    }
  }

  return { area, tareas, cargando, guardando, error, crearTarea, eliminar, completar }
}

export default useTareasArea
