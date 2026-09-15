import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { TareaArea } from '../types'
import { estaVencida, formatearFecha, formatearFechaHora, seCompletoFueraDePlazo } from '../constants'

interface Props {
  tarea: TareaArea
  // Puede eliminar la tarea (encargado del área o admin).
  puedeGestionar: boolean
  // Puede marcarla realizada (gestiona el área, o es uno de los asignados).
  puedeCompletar: boolean
  onEliminar: (tarea: TareaArea) => void
  onCompletar: (tarea: TareaArea) => void
}

const TareaRow = ({ tarea, puedeGestionar, puedeCompletar, onEliminar, onCompletar }: Props) => {
  const pendiente = tarea.estado === 'PENDIENTE'
  const vencida = pendiente && estaVencida(tarea.fechaLimite)

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-2.5 border border-slate-200 p-4 sm:p-5">
      <Box className="flex flex-wrap items-start justify-between gap-2">
        <Box className="min-w-0">
          <Typography variant="subtitle1" className="font-semibold! leading-tight!">
            {tarea.titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Creada el {formatearFechaHora(tarea.fechaCreacion)} por {tarea.creadaPorNombre}
          </Typography>
        </Box>
        <Chip
          label={pendiente ? (vencida ? 'Vencida' : 'Pendiente') : 'Realizada'}
          size="small"
          sx={
            pendiente
              ? vencida
                ? { bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }
                : { bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }
              : { bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }
          }
        />
      </Box>

      {tarea.descripcion && (
        <Typography variant="body2" color="text.secondary">
          {tarea.descripcion}
        </Typography>
      )}

      <Box className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Box className="flex items-center gap-1.5">
          <GroupsRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {tarea.asignados.map((a) => a.nombreCompleto).join(', ')}
          </Typography>
        </Box>
        <Box className="flex items-center gap-1.5">
          <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            Límite: {formatearFecha(tarea.fechaLimite)}
          </Typography>
        </Box>
      </Box>

      {!pendiente && tarea.completadaPorNombre && tarea.completadaEn && (
        <Box className="flex flex-wrap items-center gap-1.5">
          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
          <Typography variant="body2" color="text.secondary">
            Realizada por {tarea.completadaPorNombre} · {formatearFechaHora(tarea.completadaEn)}
          </Typography>
          <Chip
            label={seCompletoFueraDePlazo(tarea.fechaLimite, tarea.completadaEn) ? 'Fuera de plazo' : 'A tiempo'}
            size="small"
            sx={
              seCompletoFueraDePlazo(tarea.fechaLimite, tarea.completadaEn)
                ? { height: 20, bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }
                : { height: 20, bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }
            }
          />
        </Box>
      )}

      {pendiente && (puedeGestionar || puedeCompletar) && (
        <Box className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
          {puedeGestionar && (
            <Tooltip title="Eliminar tarea">
              <IconButton
                size="small"
                color="error"
                onClick={() => onEliminar(tarea)}
                aria-label={`Eliminar ${tarea.titulo}`}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {puedeCompletar && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() => onCompletar(tarea)}
            >
              Marcar realizada
            </Button>
          )}
        </Box>
      )}
    </Paper>
  )
}

export default TareaRow
