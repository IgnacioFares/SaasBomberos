import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import type { Movilidad } from '../../../types'

interface Props {
  onGuardar: (movilidad: Movilidad) => Promise<boolean>
  loading: boolean
  error: string | null
}

const vacio: Movilidad = {
  nombre: '',
  patente: '',
  modelo: '',
  marca: '',
  kilometraje: 0,
  enServicio: true,
  descripcion: '',
}

const MovilidadForm = ({ onGuardar, loading, error }: Props) => {
  const [form, setForm] = useState<Movilidad>(vacio)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'kilometraje' ? Number(value) : value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await onGuardar(form)
    if (ok) {
      setForm(vacio)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Typography variant="subtitle1" className="font-semibold!">
        Nueva movilidad
      </Typography>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          name="nombre"
          label="Nombre"
          placeholder="Autobomba 1"
          value={form.nombre}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="patente"
          label="Patente"
          value={form.patente}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="kilometraje"
          label="Kilometraje"
          type="number"
          slotProps={{ htmlInput: { min: 0 } }}
          value={form.kilometraje}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="marca"
          label="Marca"
          value={form.marca}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="modelo"
          label="Modelo"
          value={form.modelo}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="descripcion"
          label="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          fullWidth
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={form.enServicio}
            onChange={(e) => setForm({ ...form, enServicio: e.target.checked })}
            color="success"
          />
        }
        label={form.enServicio ? 'En servicio' : 'Fuera de servicio'}
      />

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={<AddRoundedIcon />}
        disabled={loading}
        className="self-start!"
      >
        {loading ? 'Guardando...' : 'Agregar movilidad'}
      </Button>
    </Box>
  )
}

export default MovilidadForm
