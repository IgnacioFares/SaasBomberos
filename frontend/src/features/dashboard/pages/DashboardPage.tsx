import { Link as RouterLink } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Paper, Typography } from '@mui/material'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useAuthContext } from '../../auth/hooks/useAuthContext'
import useClock from '../hooks/useClock'
import useDashboardStats from '../hooks/useDashboardStats'
import StatCard from '../components/StatCard'

const saludoSegunHora = (hora: number) => {
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const iniciales = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

const DashboardPage = () => {
  const { usuario } = useAuthContext()
  const ahora = useClock()
  const { bomberosActivos, movilidades, checklists, cargando } = useDashboardStats()

  const fecha = ahora.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const hora = ahora.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Box className="flex flex-col gap-6">
      <Paper
        elevation={0}
        className="rounded-2xl! overflow-hidden p-8 text-white"
        sx={{
          background: 'linear-gradient(120deg, #0B1C4A 0%, #1E3A8A 55%, #0D9488 130%)',
        }}
      >
        <Box className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Box className="flex items-center gap-4">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(255,255,255,0.15)',
                fontSize: 24,
                fontWeight: 700,
                border: '2px solid rgba(94,234,212,0.6)',
              }}
            >
              {iniciales(usuario?.bombero?.nombre, usuario?.bombero?.apellido) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h5" className="font-bold! text-white!">
                {saludoSegunHora(ahora.getHours())}, {usuario?.bombero?.nombre}{' '}
                {usuario?.bombero?.apellido}
              </Typography>
              <Box className="mt-1! flex items-center gap-2">
                {usuario?.bombero?.rango && (
                  <Chip
                    icon={<ShieldRoundedIcon sx={{ color: '#5EEAD4!important' }} />}
                    label={usuario.bombero.rango}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#E2E8F0', fontWeight: 600 }}
                  />
                )}
                <Typography variant="body2" className="text-slate-200!">
                  Bienvenido al panel de gestión del cuartel
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="flex flex-col items-start gap-1.5 rounded-xl bg-white/10 px-5 py-3 sm:items-end">
            <Box className="flex items-center gap-2 capitalize">
              <CalendarMonthRoundedIcon fontSize="small" sx={{ color: '#5EEAD4' }} />
              <Typography variant="body2" className="text-slate-100!">
                {fecha}
              </Typography>
            </Box>
            <Box className="flex items-center gap-2">
              <AccessTimeRoundedIcon fontSize="small" sx={{ color: '#5EEAD4' }} />
              <Typography variant="h6" className="font-bold! text-white! tabular-nums">
                {hora}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icono={PeopleAltRoundedIcon}
          etiqueta="Personal activo"
          valor={bomberosActivos}
          color="blue"
          cargando={cargando}
        />
        <StatCard
          icono={DirectionsCarFilledRoundedIcon}
          etiqueta="Movilidades registradas"
          valor={movilidades}
          color="teal"
          cargando={cargando}
        />
        <StatCard
          icono={ChecklistRoundedIcon}
          etiqueta="Checklists disponibles"
          valor={checklists}
          color="amber"
          cargando={cargando}
        />
        <StatCard
          icono={ShieldRoundedIcon}
          etiqueta="Tu rol"
          valor={usuario?.rol ?? '—'}
          color="violet"
        />
      </Box>

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Paper elevation={0} className="rounded-2xl! flex flex-col gap-4 border border-slate-200 p-6">
          <Box>
            <Typography variant="subtitle1" className="font-semibold!">
              Gestión de personal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alta, edición y baja de bomberos del cuartel.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/bomberos"
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            className="self-start!"
          >
            Ir a Personal
          </Button>
        </Paper>

        <Paper elevation={0} className="rounded-2xl! flex flex-col gap-4 border border-slate-200 p-6">
          <Box>
            <Typography variant="subtitle1" className="font-semibold!">
              Control de flota
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alta de movilidades, kilometraje y estado operativo.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/movilidades"
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            className="self-start!"
          >
            Ir a Movilidades
          </Button>
        </Paper>

        <Paper elevation={0} className="rounded-2xl! flex flex-col gap-4 border border-slate-200 p-6">
          <Box>
            <Typography variant="subtitle1" className="font-semibold!">
              Checklists
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Controlá el equipamiento de cada movilidad.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/checklists"
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            className="self-start!"
          >
            Ir a Checklists
          </Button>
        </Paper>
      </Box>
    </Box>
  )
}

export default DashboardPage
