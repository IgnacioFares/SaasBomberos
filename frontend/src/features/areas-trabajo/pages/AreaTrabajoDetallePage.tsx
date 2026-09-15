import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import BotonVolver from '../../../components/BotonVolver'
import useTareasArea from '../hooks/useTareasArea'
import { useAuthContext } from '../../auth/hooks/useAuthContext'
import TareaDialog from '../components/TareaDialog'
import TareaRow from '../components/TareaRow'
import { mesDe, seCompletoFueraDePlazo } from '../constants'
import type { TareaArea } from '../types'

const AreaTrabajoDetallePage = () => {
  const { id } = useParams<{ id: string }>()
  const areaId = id ? Number(id) : null
  const { area, tareas, cargando, guardando, error, crearTarea, eliminar, completar } = useTareasArea(areaId)
  const { usuario } = useAuthContext()

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [eliminando, setEliminando] = useState<TareaArea | null>(null)
  const [completando, setCompletando] = useState<TareaArea | null>(null)
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroIntegranteId, setFiltroIntegranteId] = useState<number | ''>('')

  const esAdmin = usuario?.rol === 'Administrador'
  const esEncargado = area?.encargado != null && area.encargado.id === usuario?.bombero?.id
  const puedeGestionar = esAdmin || esEncargado

  const handleCrear = async (tarea: Parameters<typeof crearTarea>[0]) => {
    const ok = await crearTarea(tarea)
    if (ok) setDialogAbierto(false)
  }

  const confirmarEliminar = async () => {
    if (eliminando) await eliminar(eliminando.id)
    setEliminando(null)
  }

  const confirmarCompletar = async () => {
    if (completando) await completar(completando.id)
    setCompletando(null)
  }

  if (cargando) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!area) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Área de trabajo no encontrada'}
      </Alert>
    )
  }

  // Filtro por mes: pendientes se comparan contra su fecha límite (cuándo
  // vencen), realizadas contra cuándo se completaron en verdad — son dos
  // preguntas distintas ("qué vence este mes" vs "qué se hizo este mes").
  const coincideMes = (fecha: string) => filtroMes === '' || mesDe(fecha) === filtroMes
  const coincideIntegrante = (tarea: TareaArea) =>
    filtroIntegranteId === '' || tarea.asignados.some((a) => a.id === filtroIntegranteId)
  const hayFiltrosActivos = filtroMes !== '' || filtroIntegranteId !== ''

  const pendientes = tareas.filter(
    (t) => t.estado === 'PENDIENTE' && coincideMes(t.fechaLimite) && coincideIntegrante(t)
  )
  const realizadas = tareas.filter(
    (t) => t.estado === 'REALIZADA' && t.completadaEn != null && coincideMes(t.completadaEn) && coincideIntegrante(t)
  )
  const realizadasFueraDePlazo = realizadas.filter(
    (t) => t.completadaEn != null && seCompletoFueraDePlazo(t.fechaLimite, t.completadaEn)
  ).length

  return (
    <Box className="flex flex-col gap-5">
      <BotonVolver to="/areas-trabajo" texto="Áreas de trabajo" />
      <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 sm:p-6">
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Box className="min-w-0">
            <Typography variant="h5" className="font-bold! leading-tight!">
              {area.nombre}
            </Typography>
            {area.descripcion && (
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {area.descripcion}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        <Box className="flex flex-wrap items-center gap-2">
          <Chip
            icon={<ShieldRoundedIcon sx={{ color: '#9F1239!important' }} />}
            label={area.encargado ? `Encargado: ${area.encargado.nombreCompleto}` : 'Sin encargado'}
            size="small"
            sx={{ bgcolor: '#FFE4E6', color: '#9F1239', fontWeight: 600 }}
          />
          <Chip
            icon={<GroupsRoundedIcon sx={{ color: '#0F766E!important' }} />}
            label={`${area.integrantes.length} integrante${area.integrantes.length === 1 ? '' : 's'}`}
            size="small"
            sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
          />
        </Box>

        {area.integrantes.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {area.integrantes.map((i) => i.nombreCompleto).join(', ')}
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Box className="flex items-center justify-between gap-2">
        <Typography variant="subtitle1" className="font-semibold!">
          Tareas
        </Typography>
        {puedeGestionar && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogAbierto(true)}
          >
            Nueva tarea
          </Button>
        )}
      </Box>

      {tareas.length > 0 && (
        <Box className="flex flex-wrap items-center gap-2">
          <TextField
            select
            label="Integrante"
            size="small"
            value={filtroIntegranteId}
            onChange={(e) => setFiltroIntegranteId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {area.integrantes.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.nombreCompleto}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="month"
            label="Mes"
            size="small"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          {hayFiltrosActivos && (
            <Button
              size="small"
              startIcon={<FilterAltOffRoundedIcon />}
              onClick={() => {
                setFiltroMes('')
                setFiltroIntegranteId('')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      )}

      {hayFiltrosActivos && (pendientes.length > 0 || realizadas.length > 0) && (
        <Alert severity="info" icon={<AssignmentTurnedInRoundedIcon fontSize="small" />}>
          {realizadas.length === 0
            ? 'No realizó ninguna tarea con estos filtros.'
            : `Realizó ${realizadas.length} tarea${realizadas.length === 1 ? '' : 's'}` +
              (realizadasFueraDePlazo > 0
                ? `, ${realizadasFueraDePlazo} fuera de plazo.`
                : ': todas a tiempo.')}
          {pendientes.length > 0 && ` Además tiene ${pendientes.length} pendiente${pendientes.length === 1 ? '' : 's'}.`}
        </Alert>
      )}

      {tareas.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <AssignmentTurnedInRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {puedeGestionar
              ? 'Todavía no hay tareas. Empezá con "Nueva tarea".'
              : 'Todavía no hay tareas cargadas para esta área.'}
          </Typography>
        </Box>
      ) : pendientes.length === 0 && realizadas.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <AssignmentTurnedInRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            Ninguna tarea coincide con estos filtros.
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-col gap-3">
          {pendientes.map((tarea) => (
            <TareaRow
              key={tarea.id}
              tarea={tarea}
              puedeGestionar={puedeGestionar}
              puedeCompletar={
                puedeGestionar || tarea.asignados.some((a) => a.id === usuario?.bombero?.id)
              }
              onEliminar={setEliminando}
              onCompletar={setCompletando}
            />
          ))}
          {realizadas.map((tarea) => (
            <TareaRow
              key={tarea.id}
              tarea={tarea}
              puedeGestionar={false}
              puedeCompletar={false}
              onEliminar={setEliminando}
              onCompletar={setCompletando}
            />
          ))}
        </Box>
      )}

      <TareaDialog
        open={dialogAbierto}
        integrantes={area.integrantes}
        guardando={guardando}
        error={dialogAbierto ? error : null}
        onCerrar={() => setDialogAbierto(false)}
        onGuardar={handleCrear}
      />

      <Dialog open={eliminando !== null} onClose={() => setEliminando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar tarea</DialogTitle>
        <DialogContent>
          <DialogContentText>"{eliminando?.titulo}" se elimina definitivamente.</DialogContentText>
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

      <Dialog open={completando !== null} onClose={() => setCompletando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Marcar tarea como realizada</DialogTitle>
        <DialogContent>
          <DialogContentText>"{completando?.titulo}" queda marcada como realizada.</DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setCompletando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="success" onClick={confirmarCompletar}>
            Marcar realizada
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AreaTrabajoDetallePage
