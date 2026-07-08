import { useCallback, useEffect, useState } from 'react'
import type { UbicacionEquipo } from '../types'
import { getUbicaciones, createUbicacion, updateUbicacion, deleteUbicacion } from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'

const useUbicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState<UbicacionEquipo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setUbicaciones(await getUbicaciones())
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar las ubicaciones'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const ejecutar = async (accion: () => Promise<unknown>, fallback: string) => {
    setError(null)
    try {
      await accion()
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, fallback))
      return false
    }
  }

  const agregar = (nombre: string) =>
    ejecutar(() => createUbicacion({ nombre }), 'Error al crear la ubicación')

  const editar = (id: number, nombre: string) =>
    ejecutar(() => updateUbicacion(id, { nombre }), 'Error al actualizar la ubicación')

  const eliminar = (id: number) =>
    ejecutar(() => deleteUbicacion(id), 'Error al eliminar la ubicación')

  return { ubicaciones, loading, error, agregar, editar, eliminar }
}

export default useUbicaciones
