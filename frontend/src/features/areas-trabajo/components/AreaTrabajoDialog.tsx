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
import type { Bombero } from '../../../types'
import type { AreaTrabajo, AreaTrabajoRequest } from '../types'
import useBomberos from '../../bomberos/hooks/useBomberos'

interface Props {
  open: boolean
  // Si viene, el dialog edita esa área; si no, es un alta.
  inicial: AreaTrabajo | null
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onGuardar: (area: AreaTrabajoRequest) => void
}

const AreaTrabajoDialog = ({ open, inicial, guardando, error, onCerrar, onGuardar }: Props) => {
  const { bomberos } = useBomberos()
  const activos = bomberos.filter((b) => b.activo !== false)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [encargado, setEncargado] = useState<Bombero | null>(null)
  const [integrantes, setIntegrantes] = useState<Bombero[]>([])

  useEffect(() => {
    if (!open) return
    setNombre(inicial?.nombre ?? '')
    setDescripcion(inicial?.descripcion ?? '')
    setEncargado(
      inicial?.encargado ? activos.find((b) => b.id === inicial.encargado?.id) ?? null : null
    )
    setIntegrantes(
      inicial ? activos.filter((b) => inicial.integrantes.some((i) => i.id === b.id)) : []
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, inicial, bomberos.length])

  const valido = nombre.trim() !== ''

  const handleGuardar = () => {
    onGuardar({
      nombre,
      descripcion,
      encargadoId: encargado?.id ?? null,
      integrantesIds: integrantes.map((b) => b.id).filter((id): id is number => id != null),
    })
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold!">
        {inicial ? `Editar ${inicial.nombre}` : 'Nueva área de trabajo'}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          placeholder="Ej: Mantenimiento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
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
          options={activos}
          value={encargado}
          onChange={(_, valor) => setEncargado(valor)}
          getOptionLabel={(b) => `${b.nombre} ${b.apellido}`}
          getOptionKey={(b) => b.id ?? `${b.nombre}-${b.apellido}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Encargado del área" placeholder="Seleccionar bombero" />
          )}
        />
        <Autocomplete
          multiple
          options={activos}
          value={integrantes}
          onChange={(_, valor) => setIntegrantes(valor)}
          getOptionLabel={(b) => `${b.nombre} ${b.apellido}`}
          getOptionKey={(b) => b.id ?? `${b.nombre}-${b.apellido}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Integrantes" placeholder="Agregar bomberos" />
          )}
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
        <Button variant="contained" disabled={guardando || !valido} onClick={handleGuardar}>
          {guardando ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Crear área'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AreaTrabajoDialog
