import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import type { RegisterRequest } from '../types'
import { RANGOS } from '../../bomberos/constants'

interface Props {
  onRegistrar: (datos: RegisterRequest) => void
  loading: boolean
  error: string | null
}

const RegistroForm = ({ onRegistrar, loading, error }: Props) => {
  const [form, setForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    bombero: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      rango: '',
    },
  })

  const handleChangeUsuario = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleChangeBombero = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      bombero: { ...form.bombero, [e.target.name]: e.target.value },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegistrar({ ...form, bombero: { ...form.bombero, email: form.email } })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Box>
        <Typography variant="subtitle2" className="mb-2! font-semibold!" color="text.secondary">
          Datos de acceso
        </Typography>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="email"
            type="email"
            label="Email de acceso"
            value={form.email}
            onChange={handleChangeUsuario}
            required
            fullWidth
          />
          <TextField
            name="password"
            type="password"
            label="Contraseña"
            value={form.password}
            onChange={handleChangeUsuario}
            required
            fullWidth
          />
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" className="mb-2! font-semibold!" color="text.secondary">
          Datos personales
        </Typography>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="nombre"
            label="Nombre"
            value={form.bombero.nombre}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="apellido"
            label="Apellido"
            value={form.bombero.apellido}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="dni"
            label="DNI"
            value={form.bombero.dni}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="telefono"
            label="Teléfono"
            value={form.bombero.telefono}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="rango"
            label="Rango"
            select
            value={form.bombero.rango}
            onChange={handleChangeBombero}
            required
            fullWidth
            className="sm:col-span-2"
          >
            {RANGOS.map((rango) => (
              <MenuItem key={rango} value={rango}>
                {rango}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        fullWidth
        className="py-2.5!"
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </Button>
    </Box>
  )
}

export default RegistroForm
