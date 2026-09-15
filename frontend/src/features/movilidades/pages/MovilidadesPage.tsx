import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FireTruckRoundedIcon from '@mui/icons-material/FireTruckRounded'
import useMovilidades from '../hooks/useMovilidades'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import MovilidadCard from '../components/MovilidadCard'
import MovilidadDialog from '../components/MovilidadDialog'
import type { Movilidad } from '../../../types'

const MovilidadesPage = () => {
  const { movilidades, loading, error, agregar, actualizar, eliminar } = useMovilidades()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_MOVILIDADES)

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState<Movilidad | null>(null)
  const [eliminando, setEliminando] = useState<Movilidad | null>(null)
  const [cambiandoServicio, setCambiandoServicio] = useState<Movilidad | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const enServicio = movilidades.filter((m) => m.enServicio).length
  const fueraDeServicio = movilidades.length - enServicio

  const handleGuardar = async (movilidad: Movilidad) => {
    setGuardando(true)
    const ok = editando?.id
      ? await actualizar(editando.id, movilidad)
      : await agregar(movilidad)
    setGuardando(false)
    if (ok) {
      setDialogAbierto(false)
      setEditando(null)
      setMensajeExito(
        editando ? `"${movilidad.nombre}" actualizada.` : `"${movilidad.nombre}" agregada a la flota.`
      )
    }
  }

  const confirmarToggleServicio = async () => {
    const movilidad = cambiandoServicio
    if (movilidad?.id) {
      const ok = await actualizar(movilidad.id, { ...movilidad, enServicio: !movilidad.enServicio })
      if (ok) {
        setMensajeExito(
          `"${movilidad.nombre}" ${movilidad.enServicio ? 'pasó a fuera de servicio' : 'volvió a servicio'}.`
        )
      }
    }
    setCambiandoServicio(null)
  }

  const confirmarEliminar = async () => {
    if (eliminando?.id) {
      await eliminar(eliminando.id)
      setMensajeExito(`"${eliminando.nombre}" eliminada de la flota.`)
    }
    setEliminando(null)
  }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Movilidades
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La flota del cuartel: estado operativo y kilometraje.
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
            Nueva movilidad
          </Button>
        )}
      </Box>

      {movilidades.length > 0 && (
        <Box className="flex flex-wrap items-center gap-2">
          <Chip
            label={`${enServicio} en servicio`}
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }}
          />
          {fueraDeServicio > 0 && (
            <Chip
              label={`${fueraDeServicio} fuera de servicio`}
              size="small"
              sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }}
            />
          )}
        </Box>
      )}

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

      {loading && movilidades.length === 0 ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : movilidades.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <FireTruckRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {puedeGestionar
              ? 'Todavía no hay movilidades cargadas. Empezá con "Nueva movilidad".'
              : 'Todavía no hay movilidades cargadas.'}
          </Typography>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {movilidades.map((movilidad) => (
            <MovilidadCard
              key={movilidad.id}
              movilidad={movilidad}
              puedeGestionar={puedeGestionar}
              onEditar={(m) => {
                setEditando(m)
                setDialogAbierto(true)
              }}
              onEliminar={setEliminando}
              onToggleServicio={setCambiandoServicio}
            />
          ))}
        </Box>
      )}

      <MovilidadDialog
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
        <DialogTitle className="font-bold!">Eliminar movilidad</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{eliminando?.nombre}" se elimina de la flota. Los checklists ya realizados sobre ella
            se conservan en el historial.
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

      <Dialog open={cambiandoServicio !== null} onClose={() => setCambiandoServicio(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">
          {cambiandoServicio?.enServicio ? 'Pasar a fuera de servicio' : 'Poner en servicio'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {cambiandoServicio?.enServicio
              ? `"${cambiandoServicio?.nombre}" deja de estar disponible para asignarle checklists de servicio.`
              : `"${cambiandoServicio?.nombre}" vuelve a estar disponible para el servicio.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setCambiandoServicio(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarToggleServicio}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MovilidadesPage
