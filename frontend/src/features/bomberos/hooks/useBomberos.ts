import { useState, useEffect } from 'react'
import type { Bombero } from '../../../types'
import { getBomberos, createBombero, updateBombero, deleteBombero } from '../services/bomberoService'


const useBomberos = () => {
  const [bomberos, setBomberos] = useState<Bombero[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargarBomberos = async () => {
    setLoading(true)
    try {
      const datos = await getBomberos()
      setBomberos(datos)
    } catch (err) {
      setError('Error al cargar los bomberos')
    } finally {
      setLoading(false)
    }
  }

  const agregar = async (bombero: Bombero) => {
    try {
      await createBombero(bombero)
      await cargarBomberos()
    } catch (err) {
      setError('Error al crear el bombero')
    }
  }

  const actualizar = async (id: number, bombero: Bombero) => {
    try {
      await updateBombero(id, bombero)
      await cargarBomberos()
    } catch (err) {
      setError('Error al actualizar el bombero')
    }
  }

  const eliminar = async (id: number) => {
    try {
      await deleteBombero(id)
      await cargarBomberos()
    } catch (err) {
      setError('Error al eliminar el bombero')
    }
  }

  useEffect(() => {
    cargarBomberos()
  }, [])

  return { bomberos, loading, error, agregar, actualizar, eliminar }
}

export default useBomberos