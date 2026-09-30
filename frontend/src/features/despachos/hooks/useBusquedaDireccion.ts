import { useEffect, useState } from 'react'
import type { ResultadoDireccion } from '../types'
import { buscarDireccion } from '../services/direccionService'

// Se espera a que el usuario deje de tipear: el buscador de
// OpenStreetMap admite una consulta por segundo.
const ESPERA_MS = 700

// Con menos de esto la búsqueda devuelve cualquier cosa.
const MINIMO_CARACTERES = 4

const useBusquedaDireccion = (texto: string) => {
  const [opciones, setOpciones] = useState<ResultadoDireccion[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const consulta = texto.trim()
    const controlador = new AbortController()

    const temporizador = setTimeout(async () => {
      if (consulta.length < MINIMO_CARACTERES) {
        setOpciones([])
        setError(null)
        return
      }
      setBuscando(true)
      try {
        const resultados = await buscarDireccion(consulta, controlador.signal)
        setOpciones(resultados)
        setError(null)
      } catch {
        // Si la búsqueda se canceló porque el usuario siguió tipeando,
        // no es un error que haya que mostrar.
        if (controlador.signal.aborted) return
        setOpciones([])
        setError('No se pudo buscar la dirección. Podés marcarla a mano en el mapa.')
      } finally {
        if (!controlador.signal.aborted) setBuscando(false)
      }
    }, ESPERA_MS)

    return () => {
      clearTimeout(temporizador)
      controlador.abort()
    }
  }, [texto])

  return { opciones, buscando, error }
}

export default useBusquedaDireccion
