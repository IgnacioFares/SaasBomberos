import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import { useAuthContext } from '../../features/auth/hooks/useAuthContext'

const DRAWER_WIDTH = 264

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardRoundedIcon },
  { to: '/bomberos', label: 'Personal', icon: PeopleAltRoundedIcon },
  { to: '/movilidades', label: 'Movilidades', icon: DirectionsCarFilledRoundedIcon },
  { to: '/checklists', label: 'Checklists', icon: ChecklistRoundedIcon },
  { to: '/inventario', label: 'Inventario', icon: Inventory2RoundedIcon },
]

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

  const sidebarContent = (
    <Box
      className="flex h-full flex-col text-white"
      sx={{
        background: 'linear-gradient(180deg, #0B1C4A 0%, #1E3A8A 55%, #0D9488 130%)',
      }}
    >
      <Box className="flex items-center gap-2 px-5 py-5">
        <FireTruckRoundedIcon sx={{ color: '#5EEAD4' }} />
        <Typography variant="h6" className="font-bold! text-white">
          SaaS Bomberos
        </Typography>
      </Box>

      <Box component="nav" className="flex flex-col gap-1 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClasses} onClick={() => setMobileOpen(false)}>
            <Icon fontSize="small" />
            {label}
          </NavLink>
        ))}
      </Box>

      <Box className="flex-1" />

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

      <Box className="flex flex-col gap-3 p-4">
        <Box className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#0D9488', width: 40, height: 40, fontSize: 14, fontWeight: 700 }}>
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
            icon={<ShieldRoundedIcon sx={{ color: '#5EEAD4!important' }} />}
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
    <Box className="flex min-h-screen bg-slate-100">
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { sm: 'none' },
          background: 'linear-gradient(90deg, #152a63 0%, #1E3A8A 60%, #0D9488 130%)',
        }}
      >
        <Toolbar className="gap-2">
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
          <FireTruckRoundedIcon sx={{ color: '#5EEAD4' }} />
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
