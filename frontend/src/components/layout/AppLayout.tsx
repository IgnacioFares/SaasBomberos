import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import FireTruckRoundedIcon from '@mui/icons-material/FireTruckRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { useAuthContext } from '../../features/auth/hooks/useAuthContext'
import { AreasTrabajoProvider, useAreasTrabajoContext } from '../../features/areas-trabajo/context/AreasTrabajoContext'
import { useThemeMode } from '../../theme/useThemeMode'

const DRAWER_WIDTH = 264

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardRoundedIcon },
  { to: '/bomberos', label: 'Personal', icon: PeopleAltRoundedIcon },
  { to: '/movilidades', label: 'Movilidades', icon: DirectionsCarFilledRoundedIcon },
  { to: '/checklists', label: 'Checklists', icon: ChecklistRoundedIcon },
  { to: '/inventario', label: 'Inventario', icon: Inventory2RoundedIcon },
  { to: '/partes', label: 'Partes de intervención', icon: DescriptionRoundedIcon },
]

const subNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `block truncate rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/15 text-white'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

const iniciales = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

const AppLayout = () => {
  const { usuario, cerrarSesion } = useAuthContext()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <AreasTrabajoProvider>
      <AppLayoutContent
        usuario={usuario}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        handleLogout={handleLogout}
      />
    </AreasTrabajoProvider>
  )
}

interface AppLayoutContentProps {
  usuario: ReturnType<typeof useAuthContext>['usuario']
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  handleLogout: () => void
}

const AppLayoutContent = ({ usuario, mobileOpen, setMobileOpen, handleLogout }: AppLayoutContentProps) => {
  const location = useLocation()
  const { areas } = useAreasTrabajoContext()
  const { mode, toggleMode } = useThemeMode()
  const areasActivo = location.pathname.startsWith('/areas-trabajo')
  const [areasAbiertas, setAreasAbiertas] = useState(areasActivo)

  // Si se navega directo a una URL de áreas de trabajo (link, refresh),
  // el desplegable se abre solo para reflejar dónde está el usuario.
  useEffect(() => {
    if (areasActivo) setAreasAbiertas(true)
  }, [areasActivo])

  const sidebarContent = (
    <Box
      className="flex h-full flex-col text-white"
      sx={{
        background: 'linear-gradient(180deg, #450A0A 0%, #B91C1C 55%, #7F1D1D 130%)',
      }}
    >
      <Box component="nav" className="flex flex-col gap-1 px-3 pt-5 pb-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClasses} onClick={() => setMobileOpen(false)}>
            <Icon fontSize="small" />
            {label}
          </NavLink>
        ))}

        <Box
          component="button"
          onClick={() => setAreasAbiertas((abierto) => !abierto)}
          aria-expanded={areasAbiertas}
          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
            areasActivo ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Box className="flex items-center gap-3">
            <GroupsRoundedIcon fontSize="small" />
            Áreas de trabajo
          </Box>
          <ExpandMoreRoundedIcon
            fontSize="small"
            sx={{ transition: 'transform 0.15s', transform: areasAbiertas ? 'rotate(180deg)' : 'none' }}
          />
        </Box>
        <Collapse in={areasAbiertas}>
          <Box className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
            <NavLink to="/areas-trabajo" end className={subNavLinkClasses} onClick={() => setMobileOpen(false)}>
              Todas las áreas
            </NavLink>
            {areas.map((area) => (
              <NavLink
                key={area.id}
                to={`/areas-trabajo/${area.id}`}
                className={subNavLinkClasses}
                onClick={() => setMobileOpen(false)}
              >
                {area.nombre}
              </NavLink>
            ))}
            {areas.length === 0 && (
              <Typography variant="caption" className="px-3 py-1.5 text-slate-400!">
                Sin áreas todavía
              </Typography>
            )}
          </Box>
        </Collapse>

        {usuario?.rol === 'Administrador' && (
          <NavLink to="/administracion" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
            <AdminPanelSettingsRoundedIcon fontSize="small" />
            Administración
          </NavLink>
        )}
      </Box>

      <Box className="flex-1" />

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

      <Box className="flex flex-col gap-3 p-4">
        <FormControlLabel
          labelPlacement="start"
          control={<Switch checked={mode === 'dark'} onChange={toggleMode} size="small" />}
          label={
            <Box className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {mode === 'dark' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
              Modo oscuro
            </Box>
          }
          className="ml-0! w-full justify-between! rounded-xl px-3.5 py-2"
        />

        <Box className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#F59E0B', width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>
            {iniciales(usuario?.bombero?.nombre, usuario?.bombero?.apellido) || '?'}
          </Avatar>
          <Box className="min-w-0">
            <Typography variant="body2" className="truncate font-semibold! text-white">
              {usuario?.bombero?.nombre} {usuario?.bombero?.apellido}
            </Typography>
            <Typography variant="caption" className="truncate text-slate-300!">
              {usuario?.email}
            </Typography>
          </Box>
        </Box>

        {usuario?.rol && (
          <Chip
            icon={<ShieldRoundedIcon sx={{ color: '#FCD34D!important' }} />}
            label={usuario.rol}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#E2E8F0', fontWeight: 600 }}
          />
        )}

        <Box
          component="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogoutRoundedIcon fontSize="small" />
          Cerrar sesión
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box className="flex min-h-screen" sx={{ bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { sm: 'none' },
          background: 'linear-gradient(90deg, #450A0A 0%, #B91C1C 60%, #7F1D1D 130%)',
        }}
      >
        <Toolbar className="gap-2">
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
          <FireTruckRoundedIcon sx={{ color: '#FCD34D' }} />
          <Typography variant="h6" className="font-bold! text-white">
            SaaS Bomberos
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        component="main"
        className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
        sx={{ width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar sx={{ display: { sm: 'none' } }} />
        <Box className="mx-auto max-w-7xl">
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppLayout
