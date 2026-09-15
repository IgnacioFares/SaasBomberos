import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import { useNavigate } from 'react-router-dom'
import { useAreasTrabajoContext } from '../context/AreasTrabajoContext'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import AreaTrabajoCard from '../components/AreaTrabajoCard'
import AreaTrabajoDialog from '../components/AreaTrabajoDialog'
import type { AreaTrabajo, AreaTrabajoRequest } from '../types'

const AreasTrabajoPage = () => {
  const { areas, loading, error, agregar, actualizar, eliminar } = useAreasTrabajoContext()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_AREAS_TRABAJO)
  const navigate = useNavigate()

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState<AreaTrabajo | null>(null)
  const [eliminando, setEliminando] = useState<AreaTrabajo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const handleGuardar = async (area: AreaTrabajoRequest) => {
    setGuardando(true)
    const ok = editando?.id ? await actualizar(editando.id, area) : await agregar(area)
    setGuardando(false)
    if (ok) {
      setDialogAbierto(false)
      setEditando(null)
      setMensajeExito(editando ? `"${area.nombre}" actualizada.` : `"${area.nombre}" creada.`)
    }
  }

  const confirmarEliminar = async () => {
    if (eliminando?.id) {
      await eliminar(eliminando.id)
      setMensajeExito(`"${eliminando.nombre}" eliminada.`)
    }
    setEliminando(null)
  }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Áreas de trabajo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipos internos del cuartel, sus encargados y el control de tareas realizadas.
          </Typography>
        </Box>
        {puedeGestionar && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            className="self-start! sm:self-auto!"
            onClick={() => {
              setEditando(null)
              setDialogAbierto(true)
            }}
          >
            Nueva área
          </Button>
        )}
      </Box>

      {mensajeExito && (
        <Alert severity="success" onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}
      {error && !dialogAbierto && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {loading && areas.length === 0 ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : areas.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <GroupsRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {puedeGestionar
              ? 'Todavía no hay áreas de trabajo. Empezá con "Nueva área".'
              : 'Todavía no hay áreas de trabajo cargadas.'}
          </Typography>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {areas.map((area) => (
            <AreaTrabajoCard
              key={area.id}
              area={area}
              puedeGestionar={puedeGestionar}
              onAbrir={(a) => navigate(`/areas-trabajo/${a.id}`)}
              onEditar={(a) => {
                setEditando(a)
                setDialogAbierto(true)
              }}
              onEliminar={setEliminando}
            />
          ))}
        </Box>
      )}

      <AreaTrabajoDialog
        open={dialogAbierto}
        inicial={editando}
        guardando={guardando}
        error={dialogAbierto ? error : null}
        onCerrar={() => {
          setDialogAbierto(false)
          setEditando(null)
        }}
        onGuardar={handleGuardar}
      />

      <Dialog open={eliminando !== null} onClose={() => setEliminando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar área de trabajo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{eliminando?.nombre}" se elimina del listado. El historial de tareas ya realizadas se
            conserva.
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
    </Box>
  )
}

export default AreasTrabajoPage
