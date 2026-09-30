import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import FireTruckRoundedIcon from '@mui/icons-material/FireTruckRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import type { Despacho } from '../types'
import { duracion, formatearFechaHora, textoRecorrido } from '../utils'

interface Props {
  despacho: Despacho
  // Sin "despachar_movilidades" la tarjeta es solo de consulta.
  puedeDespachar: boolean
  onAbrirMapa: (despacho: Despacho) => void
  onFinalizar: (despacho: Despacho) => void
  onEliminar: (despacho: Despacho) => void
}

const DespachoCard = ({ despacho, puedeDespachar, onAbrirMapa, onFinalizar, onEliminar }: Props) => {
  const enCurso = despacho.estado === 'EN_CURSO'

  return (
    <Paper
      elevation={0}
      className="rounded-2xl! flex flex-col gap-3 overflow-hidden border border-slate-200 transition-shadow hover:shadow-md"
    >
      <Box
        className="flex items-start justify-between gap-2 px-4 pb-3 pt-4 sm:px-5"
        sx={{
          background: enCurso
            ? 'linear-gradient(120deg, #FEF2F2 0%, #FFF7ED 100%)'
            : 'linear-gradient(120deg, #F8FAFC 0%, #F1F5F9 100%)',
        }}
      >
        <Box className="flex min-w-0 items-center gap-3">
          <Box
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            sx={{ bgcolor: enCurso ? '#FEE2E2' : '#E2E8F0' }}
          >
            <FireTruckRoundedIcon sx={{ color: enCurso ? '#B91C1C' : '#475569' }} />
          </Box>
          <Box className="min-w-0">
            {/* Color fijo: la franja es clara en ambos modos del tema. */}
            <Typography variant="h6" className="truncate font-bold! leading-tight!" sx={{ color: '#1C1917' }}>
              {despacho.movilidadNombre}
            </Typography>
            <Typography variant="caption" sx={{ color: '#57534E' }}>
              {despacho.motivo}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={enCurso ? 'En curso' : 'Finalizado'}
          size="small"
          sx={{
            bgcolor: enCurso ? '#FEE2E2' : '#E2E8F0',
            color: enCurso ? '#B91C1C' : '#475569',
            fontWeight: 700,
            flexShrink: 0,
          }}
        />
      </Box>

      <Box className="flex flex-col gap-2 px-4 pb-4 sm:px-5">
        {despacho.destino && (
          <Box className="flex items-center gap-2">
            <PlaceRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
            <Typography variant="body2" className="truncate">
              {despacho.destino}
            </Typography>
          </Box>
        )}

        <Box className="flex items-center gap-2">
          <ScheduleRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {formatearFechaHora(despacho.iniciadoEn)} · {duracion(despacho.iniciadoEn, despacho.finalizadoEn)}
          </Typography>
        </Box>

        <Box className="flex items-center gap-2">
          <RouteRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary" className="truncate">
            {textoRecorrido(despacho)}
          </Typography>
        </Box>

        {despacho.despachoAnteriorId != null && (
          <Typography variant="caption" color="text.secondary">
            Salió desde {despacho.origenNombre}, sin pasar por el cuartel.
          </Typography>
        )}

        <Box className="flex flex-wrap items-center gap-2">
          {enCurso && (
            <Chip
              size="small"
              label={
                despacho.enVivo > 0 ? `${despacho.enVivo} transmitiendo` : 'Nadie transmitiendo'
              }
              sx={{
                bgcolor: despacho.enVivo > 0 ? '#DCFCE7' : '#F1F5F9',
                color: despacho.enVivo > 0 ? '#15803D' : '#64748B',
                fontWeight: 700,
              }}
            />
          )}
          {despacho.despachadoPor && (
            <Typography variant="caption" color="text.secondary">
              Despachó {despacho.despachadoPor}
            </Typography>
          )}
        </Box>

        <Box className="mt-1 flex items-center gap-2">
          <Button
            variant={enCurso ? 'contained' : 'outlined'}
            size="small"
            startIcon={<MapRoundedIcon />}
            onClick={() => onAbrirMapa(despacho)}
          >
            {enCurso ? 'Ver en el mapa' : 'Ver recorrido'}
          </Button>

          {puedeDespachar && enCurso && (
            <Tooltip title="Finalizar despacho">
              <IconButton size="small" onClick={() => onFinalizar(despacho)}>
                <StopCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {puedeDespachar && !enCurso && (
            <Tooltip title="Eliminar del historial">
              <IconButton size="small" onClick={() => onEliminar(despacho)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default DespachoCard
