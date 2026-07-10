import { Link as RouterLink } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Paper, Typography } from '@mui/material'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DrawRoundedIcon from '@mui/icons-material/DrawRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import { useAuthContext } from '../../auth/hooks/useAuthContext'
import useClock from '../hooks/useClock'
import useDashboardStats from '../hooks/useDashboardStats'
import StatCard from '../../../components/StatCard'
import { ESTILO_REGISTRO_ESTADO, formatearFechaHora } from '../../checklists/constants'
import { ESTILO_VENCIMIENTO, formatearFecha } from '../../inventario/constants'

const saludoSegunHora = (hora: number) => {
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const iniciales = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

const accesosRapidos = [
  { to: '/bomberos', label: 'Personal', icon: PeopleAltRoundedIcon },
  { to: '/movilidades', label: 'Movilidades', icon: DirectionsCarFilledRoundedIcon },
  { to: '/checklists', label: 'Checklists', icon: ChecklistRoundedIcon },
  { to: '/inventario', label: 'Inventario', icon: Inventory2RoundedIcon },
]

const DashboardPage = () => {
  const { usuario } = useAuthContext()
  const ahora = useClock()
  const {
    cargando,
    bomberosActivos,
    movilidadesEnServicio,
    movilidadesFuera,
    elementosInventario,
    pendientesFirma,
    registrosRecientes,
    alertasInventario,
  } = useDashboardStats()

  const fecha = ahora.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const hayAlertas = movilidadesFuera > 0 || alertasInventario.length > 0

  return (
    <Box className="flex flex-col gap-4 sm:gap-5">
      {/* Saludo */}
      <Paper
        elevation={0}
        className="rounded-2xl! overflow-hidden p-5 text-white sm:p-7"
        sx={{ background: 'linear-gradient(120deg, #0B1C4A 0%, #1E3A8A 55%, #0D9488 130%)' }}
      >
        <Box className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Box className="flex items-center gap-3 sm:gap-4">
            <Avatar
              sx={{
                width: { xs: 48, sm: 60 },
                height: { xs: 48, sm: 60 },
                bgcolor: 'rgba(255,255,255,0.15)',
                fontSize: { xs: 18, sm: 22 },
                fontWeight: 700,
                border: '2px solid rgba(94,234,212,0.6)',
              }}
            >
              {iniciales(usuario?.bombero?.nombre, usuario?.bombero?.apellido) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-bold! leading-tight! text-white!">
                {saludoSegunHora(ahora.getHours())}, {usuario?.bombero?.nombre}
              </Typography>
              <Box className="mt-1 flex flex-wrap items-center gap-1.5">
                {usuario?.bombero?.rango && (
                  <Chip
                    icon={<ShieldRoundedIcon sx={{ color: '#5EEAD4!important', fontSize: 15 }} />}
                    label={usuario.bombero.rango}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#E2E8F0', fontWeight: 600, height: 24 }}
                  />
                )}
                {usuario?.rol === 'Administrador' && (
                  <Chip
                    label="Administrador"
                    size="small"
                    sx={{ bgcolor: 'rgba(94,234,212,0.2)', color: '#5EEAD4', fontWeight: 700, height: 24 }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 sm:flex-col sm:items-end sm:gap-1">
            <Box className="flex items-center gap-1.5 capitalize">
              <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: '#5EEAD4' }} />
              <Typography variant="body2" className="text-slate-100!">
                {fecha}
              </Typography>
            </Box>
            <Box className="flex items-center gap-1.5">
              <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#5EEAD4' }} />
              <Typography variant="body1" className="font-bold! text-white! tabular-nums">
                {hora}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Notificación: checklists pendientes de firma */}
      {pendientesFirma.length > 0 && (
        <Paper
          elevation={0}
          className="rounded-2xl! flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          sx={{ bgcolor: '#FFFBEB', borderColor: '#FDE68A' }}
        >
          <Box className="flex items-center gap-3">
            <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" sx={{ bgcolor: '#FEF3C7' }}>
              <DrawRoundedIcon sx={{ color: '#B45309' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" className="font-bold! leading-tight!" sx={{ color: '#92400E' }}>
                {pendientesFirma.length === 1
                  ? 'Hay 1 checklist pendiente de firma'
                  : `Hay ${pendientesFirma.length} checklists pendientes de firma`}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B45309' }}>
                {[...new Set(pendientesFirma.map((r) => r.movilidadNombre))].join(', ')}
              </Typography>
            </Box>
          </Box>
          <Button
            component={RouterLink}
            to="/checklists"
            state={{ tab: 'pendientes' }}
            variant="contained"
            className="shrink-0 self-start! sm:self-auto!"
            sx={{ bgcolor: '#B45309', '&:hover': { bgcolor: '#92400E' } }}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            Revisar pendientes
          </Button>
        </Paper>
      )}

      {/* Indicadores generales */}
      <Box className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icono={PeopleAltRoundedIcon}
          etiqueta="Personal activo"
          valor={bomberosActivos}
          color="blue"
          cargando={cargando}
        />
        <StatCard
          icono={DirectionsCarFilledRoundedIcon}
          etiqueta="Movilidades en servicio"
          valor={movilidadesEnServicio}
          color="green"
          cargando={cargando}
        />
        <StatCard
          icono={Inventory2RoundedIcon}
          etiqueta="Elementos en inventario"
          valor={elementosInventario}
          color="teal"
          cargando={cargando}
        />
        <StatCard
          icono={DrawRoundedIcon}
          etiqueta="Pendientes de firma"
          valor={pendientesFirma.length}
          color="amber"
          cargando={cargando}
        />
      </Box>

      <Box className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* Últimos checklists */}
        <Paper elevation={0} className="rounded-2xl! flex flex-col border border-slate-200 p-4 sm:p-5">
          <Box className="mb-2 flex items-center justify-between gap-2">
            <Box className="flex items-center gap-2">
              <HistoryRoundedIcon sx={{ color: '#1E3A8A' }} fontSize="small" />
              <Typography variant="subtitle1" className="font-semibold!">
                Últimos checklists
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/checklists"
              state={{ tab: 'historial' }}
              size="small"
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Historial
            </Button>
          </Box>
          {registrosRecientes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              Todavía no se realizaron checklists.
            </Typography>
          ) : (
            <Box className="flex flex-col divide-y divide-slate-100">
              {registrosRecientes.map((registro) => {
                const estilo = ESTILO_REGISTRO_ESTADO[registro.estado]
                return (
                  <Box
                    key={registro.id}
                    component={RouterLink}
                    to={`/checklists/registros/${registro.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-1 py-2.5 no-underline transition-colors hover:bg-slate-50"
                  >
                    <Box className="min-w-0">
                      <Typography variant="body2" className="truncate font-semibold! text-slate-800">
                        {registro.movilidadNombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registro.realizadoPorNombre} · {formatearFechaHora(registro.fecha)}
                      </Typography>
                    </Box>
                    <Chip
                      label={estilo.label}
                      size="small"
                      sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700, flexShrink: 0 }}
                    />
                  </Box>
                )
              })}
            </Box>
          )}
        </Paper>

        {/* Alertas */}
        <Paper elevation={0} className="rounded-2xl! flex flex-col border border-slate-200 p-4 sm:p-5">
          <Box className="mb-2 flex items-center justify-between gap-2">
            <Box className="flex items-center gap-2">
              <WarningAmberRoundedIcon sx={{ color: '#B45309' }} fontSize="small" />
              <Typography variant="subtitle1" className="font-semibold!">
                Alertas
              </Typography>
            </Box>
            <Button component={RouterLink} to="/inventario" size="small" endIcon={<ArrowForwardRoundedIcon />}>
              Inventario
            </Button>
          </Box>

          {!hayAlertas ? (
            <Box className="flex flex-col items-center gap-1.5 py-6 text-center">
              <CheckCircleRoundedIcon sx={{ fontSize: 34, color: '#16A34A' }} />
              <Typography variant="body2" color="text.secondary">
                Todo en orden: sin vencimientos ni movilidades fuera de servicio.
              </Typography>
            </Box>
          ) : (
            <Box className="flex flex-col divide-y divide-slate-100">
              {movilidadesFuera > 0 && (
                <Box
                  component={RouterLink}
                  to="/movilidades"
                  className="flex items-center justify-between gap-2 rounded-lg px-1 py-2.5 no-underline transition-colors hover:bg-slate-50"
                >
                  <Box className="flex items-center gap-2">
                    <DirectionsCarFilledRoundedIcon sx={{ fontSize: 18, color: '#B91C1C' }} />
                    <Typography variant="body2" className="font-medium! text-slate-800">
                      {movilidadesFuera === 1
                        ? '1 movilidad fuera de servicio'
                        : `${movilidadesFuera} movilidades fuera de servicio`}
                    </Typography>
                  </Box>
                  <Chip
                    label="Fuera de servicio"
                    size="small"
                    sx={{ height: 22, bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 700, flexShrink: 0 }}
                  />
                </Box>
              )}
              {alertasInventario.slice(0, 5).map((alerta) => {
                const estilo = ESTILO_VENCIMIENTO[alerta.estado]
                return (
                  <Box
                    key={alerta.id}
                    component={RouterLink}
                    to={`/inventario/${alerta.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-1 py-2.5 no-underline transition-colors hover:bg-slate-50"
                  >
                    <Box className="flex min-w-0 items-center gap-2">
                      <EventBusyRoundedIcon sx={{ fontSize: 18, color: estilo.color }} />
                      <Box className="min-w-0">
                        <Typography variant="body2" className="truncate font-medium! text-slate-800">
                          {alerta.nombre}
                        </Typography>
                        {alerta.fecha && (
                          <Typography variant="caption" color="text.secondary">
                            Vence: {formatearFecha(alerta.fecha)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={estilo.label}
                      size="small"
                      sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700, flexShrink: 0 }}
                    />
                  </Box>
                )
              })}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Accesos rápidos */}
      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {accesosRapidos.map(({ to, label, icon: Icon }) => (
          <Button
            key={to}
            component={RouterLink}
            to={to}
            variant="outlined"
            color="primary"
            startIcon={<Icon />}
            className="rounded-xl! justify-start! py-2.5!"
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  )
}

export default DashboardPage
