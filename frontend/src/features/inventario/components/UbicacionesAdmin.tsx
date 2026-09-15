import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import useUbicaciones from '../hooks/useUbicaciones'
import type { UbicacionEquipo } from '../types'

// Administración de ubicaciones físicas del equipamiento.
const UbicacionesAdmin = () => {
  const { ubicaciones, loading, error, agregar, editar, eliminar } = useUbicaciones()

  const [nombreNueva, setNombreNueva] = useState('')
  const [editando, setEditando] = useState<UbicacionEquipo | null>(null)
  const [nombreEdicion, setNombreEdicion] = useState('')
  const [eliminando, setEliminando] = useState<UbicacionEquipo | null>(null)

  const handleAgregar = async () => {
    if (!nombreNueva.trim()) return
    const ok = await agregar(nombreNueva.trim())
    if (ok) setNombreNueva('')
  }

  const handleGuardarEdicion = async () => {
    if (!editando || !nombreEdicion.trim()) return
    const ok = await editar(editando.id, nombreEdicion.trim())
    if (ok) setEditando(null)
  }

  const confirmarEliminar = async () => {
    if (eliminando) await eliminar(eliminando.id)
    setEliminando(null)
  }

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-4 border border-slate-200 p-4 sm:p-5">
      <Box>
        <Typography variant="subtitle1" className="font-semibold!">
          Ubicaciones
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Dónde puede estar el equipamiento: depósitos, móviles, salas.
        </Typography>
      </Box>

      <Box className="flex flex-col gap-2 sm:flex-row">
        <TextField
          label="Nueva ubicación"
          placeholder="Ej: Móvil 3"
          size="small"
          fullWidth
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAgregar}
          disabled={loading || !nombreNueva.trim()}
          className="shrink-0"
        >
          Agregar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Box className="flex flex-col">
        {ubicaciones.map((ubicacion) => (
          <Box
            key={ubicacion.id}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
          >
            <Box className="flex min-w-0 items-center gap-2">
              <PlaceRoundedIcon sx={{ fontSize: 18, color: '#0D9488' }} />
              <Typography variant="body2" className="truncate">
                {ubicacion.nombre}
              </Typography>
            </Box>
            <Box className="flex shrink-0 items-center">
              <Tooltip title="Renombrar">
                <IconButton
                  size="small"
                  aria-label={`Renombrar ${ubicacion.nombre}`}
                  onClick={() => {
                    setEditando(ubicacion)
                    setNombreEdicion(ubicacion.nombre)
                  }}
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Eliminar ${ubicacion.nombre}`}
                  onClick={() => setEliminando(ubicacion)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
        {!loading && ubicaciones.length === 0 && (
          <Typography variant="body2" color="text.secondary" className="py-4 text-center">
            No hay ubicaciones creadas.
          </Typography>
        )}
      </Box>

      <Dialog open={editando !== null} onClose={() => setEditando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Renombrar ubicación</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <TextField
              label="Nombre"
              fullWidth
              value={nombreEdicion}
              onChange={(e) => setNombreEdicion(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEditando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleGuardarEdicion} disabled={!nombreEdicion.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={eliminando !== null} onClose={() => setEliminando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar ubicación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{eliminando?.nombre}" se elimina. El equipamiento que la tenía asignada queda sin
            ubicación.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEliminando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default UbicacionesAdmin
