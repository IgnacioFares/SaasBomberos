import useBomberos from '../hooks/useBomberos'
import BomberoTable from '../components/BomberoTable'
import BomberoForm from '../components/BomberoForm'
import type { Bombero } from '../../../types'

const BomberosPage = () => {
  const { bomberos, loading, error, agregar, eliminar } = useBomberos()

  const handleGuardar = async (bombero: Bombero) => {
    await agregar(bombero)
  }

  const handleEliminar = async (id: number) => {
    await eliminar(id)
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Gestión de Bomberos</h1>
      <BomberoForm onGuardar={handleGuardar} />
      <BomberoTable bomberos={bomberos} onEliminar={handleEliminar} />
    </div>
  )
}

export default BomberosPage