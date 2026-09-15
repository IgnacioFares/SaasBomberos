import { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import type { BomberoResumen, TareaAreaRequest } from '../types'

interface Props {
  open: boolean
  // Solo se puede asignar la tarea a integrantes del área.
  integrantes: BomberoResumen[]
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onGuardar: (tarea: TareaAreaRequest) => void
}

const TareaDialog = ({ open, integrantes, guardando, error, onCerrar, onGuardar }: Props) => {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [asignados, setAsignados] = useState<BomberoResumen[]>([])
  const [fechaLimite, setFechaLimite] = useState('')

  useEffect(() => {
    if (!open) return
    setTitulo('')
    setDescripcion('')
    setAsignados([])
    setFechaLimite('')
  }, [open])

  const valido = titulo.trim() !== '' && fechaLimite !== '' && asignados.length > 0

  return (
    <Dialog open={open} onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold!">Nueva tarea</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          label="Tarea"
          placeholder="Ej: Revisar mangueras"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          fullWidth
          className="mt-2!"
        />
        <TextField
          label="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          fullWidth
          multiline
          maxRows={3}
        />
        <Autocomplete
          multiple
          options={integrantes}
          value={asignados}
          onChange={(_, valor) => setAsignados(valor)}
          getOptionLabel={(b) => b.nombreCompleto}
          getOptionKey={(b) => b.id}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Asignada a" placeholder="Integrantes del área" required />
          )}
        />
        <TextField
          label="Fecha límite"
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          required
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
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
          onClick={() =>
            onGuardar({
              titulo,
              descripcion,
              asignadosIds: asignados.map((b) => b.id),
              fechaLimite,
            })
          }
        >
          {guardando ? 'Guardando...' : 'Crear tarea'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TareaDialog
