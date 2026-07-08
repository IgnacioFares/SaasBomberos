import { Avatar, Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import type { Bombero } from '../../../types'

interface Props {
  bomberos: Bombero[]
  onEliminar: (id: number) => void
}

const iniciales = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

const BomberoTable = ({ bomberos, onEliminar }: Props) => {
  if (bomberos.length === 0) {
    return (
      <Box className="flex flex-col items-center gap-2 py-12 text-center">
        <PeopleAltRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
        <Typography variant="body2" color="text.secondary">
          Todavía no hay personal cargado.
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {bomberos.map((bombero) => (
        <Paper
          key={bombero.id}
          elevation={0}
          className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-5"
        >
          <Box className="flex items-start justify-between gap-2">
            <Box className="flex items-center gap-3">
              <Avatar sx={{ bgcolor: '#1E3A8A', width: 48, height: 48, fontWeight: 700 }}>
                {iniciales(bombero.nombre, bombero.apellido)}
              </Avatar>
              <Box className="min-w-0">
                <Typography variant="subtitle1" className="truncate font-semibold! leading-tight!">
                  {bombero.nombre} {bombero.apellido}
                </Typography>
                <Box className="flex items-center gap-1 text-slate-500">
                  <BadgeRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                  <Typography variant="caption" color="text.secondary">
                    DNI {bombero.dni}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={() => bombero.id && onEliminar(bombero.id)}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box className="flex flex-wrap items-center gap-2">
            {bombero.rango && (
              <Chip
                icon={<ShieldRoundedIcon sx={{ color: '#1E3A8A!important' }} />}
                label={bombero.rango}
                size="small"
                sx={{ bgcolor: '#EFF4FF', color: '#1E3A8A', fontWeight: 600 }}
              />
            )}
            <Chip
              label={bombero.activo === false ? 'Inactivo' : 'Activo'}
              size="small"
              sx={{
                bgcolor: bombero.activo === false ? '#FEE2E2' : '#DCFCE7',
                color: bombero.activo === false ? '#B91C1C' : '#15803D',
                fontWeight: 600,
              }}
            />
          </Box>

          <Box className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
            {bombero.email && (
              <Box className="flex items-center gap-2">
                <MailOutlineRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="body2" className="truncate">
                  {bombero.email}
                </Typography>
              </Box>
            )}
            {bombero.telefono && (
              <Box className="flex items-center gap-2">
                <PhoneRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="body2">{bombero.telefono}</Typography>
              </Box>
            )}
            {bombero.fechaIngreso && (
              <Box className="flex items-center gap-2">
                <CalendarMonthRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="body2">
                  Ingresó el {new Date(bombero.fechaIngreso).toLocaleDateString('es-AR')}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default BomberoTable
