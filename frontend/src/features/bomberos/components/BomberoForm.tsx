import { useState } from 'react'
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import type { Bombero } from '../../../types'
import { RANGOS } from '../constants'

interface Props {
  onGuardar: (bombero: Bombero) => void
}

const vacio: Bombero = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  rango: '',
}

const BomberoForm = ({ onGuardar }: Props) => {
  const [form, setForm] = useState<Bombero>(vacio)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGuardar(form)
    setForm(vacio)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant="subtitle1" className="font-semibold!">
        Nuevo integrante
      </Typography>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} required fullWidth />
        <TextField name="apellido" label="Apellido" value={form.apellido} onChange={handleChange} required fullWidth />
        <TextField name="dni" label="DNI" value={form.dni} onChange={handleChange} required fullWidth />
        <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} fullWidth />
        <TextField name="telefono" label="Teléfono" value={form.telefono} onChange={handleChange} fullWidth />
        <TextField name="rango" label="Rango" select value={form.rango} onChange={handleChange} required fullWidth>
          {RANGOS.map((rango) => (
            <MenuItem key={rango} value={rango}>
              {rango}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={<PersonAddAlt1RoundedIcon />}
        className="self-start!"
      >
        Agregar
      </Button>
    </Box>
  )
}

export default BomberoForm
