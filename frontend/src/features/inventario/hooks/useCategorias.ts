import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CategoriaEquipo } from '../types'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'

const useCategorias = () => {
  const [categorias, setCategorias] = useState<CategoriaEquipo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      setCategorias(await getCategorias())
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar las categorías'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const raices = useMemo(() => categorias.filter((c) => c.padreId === null), [categorias])

  const subcategoriasDe = useCallback(
    (padreId: number | '') =>
      padreId === '' ? [] : categorias.filter((c) => c.padreId === padreId),
    [categorias]
  )

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

  const agregar = (nombre: string, padreId?: number | null) =>
    ejecutar(() => createCategoria({ nombre, padreId }), 'Error al crear la categoría')

  const editar = (id: number, nombre: string, padreId?: number | null) =>
    ejecutar(() => updateCategoria(id, { nombre, padreId }), 'Error al actualizar la categoría')

  const eliminar = (id: number) =>
    ejecutar(() => deleteCategoria(id), 'Error al eliminar la categoría')

  return { categorias, raices, subcategoriasDe, loading, error, agregar, editar, eliminar }
}

export default useCategorias
