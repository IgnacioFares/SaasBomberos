import type { Bombero } from '../../../types'

interface Props {
  bomberos: Bombero[]
  onEliminar: (id: number) => void
}

const BomberoTable = ({ bomberos, onEliminar }: Props) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>DNI</th>
          <th>Email</th>
          <th>Rango</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {bomberos.map((bombero) => (
          <tr key={bombero.id}>
            <td>{bombero.nombre}</td>
            <td>{bombero.apellido}</td>
            <td>{bombero.dni}</td>
            <td>{bombero.email}</td>
            <td>{bombero.rango}</td>
            <td>
              <button onClick={() => onEliminar(bombero.id!)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default BomberoTable