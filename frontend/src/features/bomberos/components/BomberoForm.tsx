import { useState } from 'react'
import type { Bombero } from '../../../types'

interface Props {
  onGuardar: (bombero: Bombero) => void
}

const BomberoForm = ({ onGuardar }: Props) => {
  const [form, setForm] = useState<Bombero>({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    rango: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="apellido" placeholder="Apellido" onChange={handleChange} />
      <input name="dni" placeholder="DNI" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
      <input name="rango" placeholder="Rango" onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  )
}

export default BomberoForm