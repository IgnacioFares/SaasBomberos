import { useEffect, useState } from 'react'
import type { ParteResumen } from '../types'
import { getPartes } from '../services/partesService'
import { extraerMensajeError } from '../../../utils/http'

const usePartes = () => {
  const [partes, setPartes] = useState<ParteResumen[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargarPartes = async () => {
    setLoading(true)
    try {
      const datos = await getPartes()
      setPartes(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar los partes de intervención'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPartes()
  }, [])

  return { partes, loading, error, recargar: cargarPartes }
}

export default usePartes
