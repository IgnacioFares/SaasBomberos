import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { Movilidad } from '../../../types'

interface Props {
  open: boolean
  // Si viene, el dialog edita esa movilidad; si no, es un alta.
  inicial: Movilidad | null
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onGuardar: (movilidad: Movilidad) => void
}

const VACIA: Movilidad = {
  nombre: '',
  patente: '',
  marca: '',
  modelo: '',
  kilometraje: 0,
  enServicio: true,
  descripcion: '',
}

const MovilidadDialog = ({ open, inicial, guardando, error, onCerrar, onGuardar }: Props) => {
  const [form, setForm] = useState<Movilidad>(VACIA)
  const [kilometraje, setKilometraje] = useState('')

  useEffect(() => {
    if (open) {
      setForm(inicial ?? VACIA)
      setKilometraje(inicial ? String(inicial.kilometraje) : '')
    }
  }, [open, inicial])

  const set = (cambios: Partial<Movilidad>) => setForm((prev) => ({ ...prev, ...cambios }))

  const kilometrajeNum = Number(kilometraje)
  const valido =
    form.nombre.trim() !== '' &&
    kilometraje !== '' &&
    Number.isInteger(kilometrajeNum) &&
    kilometrajeNum >= 0

  return (
    <Dialog open={open} onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold!">
        {inicial ? `Editar ${inicial.nombre}` : 'Nueva movilidad'}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          placeholder="Ej: Móvil 1"
          value={form.nombre}
          onChange={(e) => set({ nombre: e.target.value })}
          required
          fullWidth
          className="mt-2!"
        />
        <TextField
          label="Kilometraje"
          type="number"
          value={kilometraje}
          onChange={(e) => setKilometraje(e.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          label="Patente (opcional)"
          value={form.patente ?? ''}
          onChange={(e) => set({ patente: e.target.value })}
          fullWidth
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Marca (opcional)"
            value={form.marca ?? ''}
            onChange={(e) => set({ marca: e.target.value })}
            fullWidth
          />
          <TextField
            label="Modelo (opcional)"
            value={form.modelo ?? ''}
            onChange={(e) => set({ modelo: e.target.value })}
            fullWidth
          />
        </div>
        <TextField
          label="Descripción (opcional)"
          value={form.descripcion ?? ''}
          onChange={(e) => set({ descripcion: e.target.value })}
          fullWidth
          multiline
          maxRows={3}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.enServicio}
              onChange={(e) => set({ enServicio: e.target.checked })}
            />
          }
          label={
            <Typography variant="body2">
              {form.enServicio ? 'En servicio' : 'Fuera de servicio'}
            </Typography>
          }
        />
        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={guardando || !valido}
          onClick={() => onGuardar({ ...form, kilometraje: kilometrajeNum })}
        >
          {guardando ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Crear movilidad'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MovilidadDialog
