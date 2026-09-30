import { useCallback, useEffect, useState } from 'react'
import type { Despacho, NuevoDespacho } from '../types'
import {
  createDespacho,
  deleteDespacho,
  finalizarDespacho,
  getDespachos,
} from '../services/despachoService'
import { extraerMensajeError } from '../../../utils/http'

// Cada cuánto se refresca la lista para que el contador de gente
// transmitiendo no quede viejo.
const REFRESCO_MS = 15000

const useDespachos = () => {
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarDespachos = useCallback(async (conSpinner = false) => {
    if (conSpinner) setLoading(true)
    try {
      const datos = await getDespachos()
      setDespachos(datos)
      setError(null)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar los despachos'))
    } finally {
      if (conSpinner) setLoading(false)
    }
  }, [])

  const despachar = async (despacho: NuevoDespacho) => {
    setError(null)
    try {
      const creado = await createDespacho(despacho)
      await cargarDespachos()
      return creado
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al despachar la movilidad'))
      return null
    }
  }

  const finalizar = async (id: number) => {
    setError(null)
    try {
      await finalizarDespacho(id)
      await cargarDespachos()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al finalizar el despacho'))
      return false
    }
  }

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await deleteDespacho(id)
      await cargarDespachos()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al eliminar el despacho'))
      return false
    }
  }

  useEffect(() => {
    cargarDespachos(true)
    const intervalo = setInterval(() => cargarDespachos(), REFRESCO_MS)
    return () => clearInterval(intervalo)
  }, [cargarDespachos])

  return { despachos, loading, error, setError, despachar, finalizar, eliminar, recargar: cargarDespachos }
}

export default useDespachos
