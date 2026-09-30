import { useCallback, useEffect, useRef, useState } from 'react'
import type { Seguimiento } from '../types'
import { getSeguimiento } from '../services/despachoService'
import { extraerMensajeError } from '../../../utils/http'

// El mapa se refresca solo: no hay websockets, se consulta el estado
// cada pocos segundos, que para seguir un móvil alcanza de sobra.
const REFRESCO_MS = 5000

const useSeguimiento = (despachoId: number | null) => {
  const [seguimiento, setSeguimiento] = useState<Seguimiento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Evita pisar el estado con una respuesta que llegó tarde.
  const montado = useRef(true)

  const cargar = useCallback(async () => {
    if (despachoId === null) return
    try {
      const datos = await getSeguimiento(despachoId)
      if (!montado.current) return
      setSeguimiento(datos)
      setError(null)
    } catch (err) {
      if (!montado.current) return
      setError(extraerMensajeError(err, 'Error al cargar el seguimiento'))
    } finally {
      if (montado.current) setLoading(false)
    }
  }, [despachoId])

  useEffect(() => {
    montado.current = true
    setLoading(true)
    cargar()
    const intervalo = setInterval(cargar, REFRESCO_MS)
    return () => {
      montado.current = false
      clearInterval(intervalo)
    }
  }, [cargar])

  return { seguimiento, loading, error, recargar: cargar }
}

export default useSeguimiento
