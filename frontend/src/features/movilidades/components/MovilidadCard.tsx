import { Box, Button, Chip, IconButton, Paper, Switch, Tooltip, Typography } from '@mui/material'
import FireTruckRoundedIcon from '@mui/icons-material/FireTruckRounded'
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { Movilidad } from '../../../types'

interface Props {
  movilidad: Movilidad
  // Sin "gestionar_movilidades" la tarjeta es solo de consulta.
  puedeGestionar: boolean
  onEditar: (movilidad: Movilidad) => void
  onEliminar: (movilidad: Movilidad) => void
  onToggleServicio: (movilidad: Movilidad) => void
}

const MovilidadCard = ({ movilidad, puedeGestionar, onEditar, onEliminar, onToggleServicio }: Props) => {
  const enServicio = movilidad.enServicio

  return (
    <Paper
      elevation={0}
      className="rounded-2xl! flex flex-col gap-3 overflow-hidden border border-slate-200 transition-shadow hover:shadow-md"
    >
      {/* Franja superior con el estado */}
      <Box
        className="flex items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-5"
        sx={{
          background: enServicio
            ? 'linear-gradient(120deg, #F0FDF4 0%, #ECFDF9 100%)'
            : 'linear-gradient(120deg, #FEF2F2 0%, #FFF7ED 100%)',
        }}
      >
        <Box className="flex min-w-0 items-center gap-3">
          <Box
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            sx={{ bgcolor: enServicio ? '#DCFCE7' : '#FEE2E2' }}
          >
            <FireTruckRoundedIcon sx={{ color: enServicio ? '#15803D' : '#B91C1C' }} />
          </Box>
          <Box className="min-w-0">
            <Typography variant="h6" className="truncate font-bold! leading-tight!">
              {movilidad.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {[movilidad.marca, movilidad.modelo].filter(Boolean).join(' ') || 'Sin marca/modelo'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={enServicio ? 'En servicio' : 'Fuera de servicio'}
          size="small"
          sx={{
            bgcolor: enServicio ? '#DCFCE7' : '#FEE2E2',
            color: enServicio ? '#15803D' : '#B91C1C',
            fontWeight: 700,
            flexShrink: 0,
          }}
        />
      </Box>

      <Box className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
        <Box className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <Box className="flex items-center gap-1.5">
            <SpeedRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
            <Typography variant="body2" className="font-semibold! tabular-nums">
              {movilidad.kilometraje.toLocaleString('es-AR')} km
            </Typography>
          </Box>
          {movilidad.patente && (
            <Chip
              label={movilidad.patente}
              size="small"
              sx={{
                height: 22,
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: 1,
              }}
            />
          )}
        </Box>

        {movilidad.descripcion && (
          <Typography variant="body2" color="text.secondary" className="line-clamp-2">
            {movilidad.descripcion}
          </Typography>
        )}

        {puedeGestionar && (
          <Box className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <Tooltip title={enServicio ? 'Pasar a fuera de servicio' : 'Poner en servicio'}>
              <Box className="flex items-center gap-1">
                <Switch
                  size="small"
                  checked={enServicio}
                  onChange={() => onToggleServicio(movilidad)}
                  slotProps={{ input: { 'aria-label': `Servicio de ${movilidad.nombre}` } }}
                />
                <Typography variant="caption" color="text.secondary">
                  Servicio
                </Typography>
              </Box>
            </Tooltip>
            <Box className="flex items-center gap-1">
              <Button
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={() => onEditar(movilidad)}
              >
                Editar
              </Button>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onEliminar(movilidad)}
                  aria-label={`Eliminar ${movilidad.nombre}`}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default MovilidadCard
