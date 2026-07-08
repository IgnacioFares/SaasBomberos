import { useCallback, useEffect, useState } from 'react'
import type {
  CambioEstadoRequest,
  CambioUbicacionRequest,
  Equipo,
  EquipoMovimiento,
  ObservacionRequest,
  UnidadUpdateRequest,
} from '../types'
import {
  getEquipo,
  getMovimientos,
  cambiarEstado,
  cambiarUbicacion,
  agregarObservacion,
  updateUnidad,
  deleteEquipo,
} from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'

const useEquipoDetalle = (id: number | null) => {
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [movimientos, setMovimientos] = useState<EquipoMovimiento[]>([])
  const [cargando, setCargando] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    if (id === null) return
    try {
      const [equipoData, movimientosData] = await Promise.all([getEquipo(id), getMovimientos(id)])
      setEquipo(equipoData)
      setMovimientos(movimientosData)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cargar el equipo'))
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Ejecuta una acción, actualiza el equipo con la respuesta y refresca
  // el historial (todas las acciones generan un movimiento nuevo).
  const ejecutar = async (accion: () => Promise<Equipo>, fallback: string) => {
    if (id === null) return false
    setGuardando(true)
    setError(null)
    try {
      setEquipo(await accion())
      setMovimientos(await getMovimientos(id))
      return true
    } catch (err) {
      setError(extraerMensajeError(err, fallback))
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    equipo,
    movimientos,
    cargando,
    guardando,
    error,
    limpiarError: () => setError(null),
    cambiarEstado: (data: CambioEstadoRequest) =>
      ejecutar(() => cambiarEstado(id!, data), 'No se pudo cambiar el estado'),
    cambiarUbicacion: (data: CambioUbicacionRequest) =>
      ejecutar(() => cambiarUbicacion(id!, data), 'No se pudo cambiar la ubicación'),
    agregarObservacion: (data: ObservacionRequest) =>
      ejecutar(() => agregarObservacion(id!, data), 'No se pudo guardar la observación'),
    actualizarUnidad: (unidadId: number, data: UnidadUpdateRequest) =>
      ejecutar(() => updateUnidad(id!, unidadId, data), 'No se pudo actualizar la unidad'),
    eliminar: async () => {
      if (id === null) return false
      setGuardando(true)
      setError(null)
      try {
        await deleteEquipo(id)
        return true
      } catch (err) {
        setError(extraerMensajeError(err, 'No se pudo eliminar el equipo'))
        return false
      } finally {
        setGuardando(false)
      }
    },
  }
}

export default useEquipoDetalle
