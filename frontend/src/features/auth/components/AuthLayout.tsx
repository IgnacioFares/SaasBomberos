import type { ReactNode } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import FireTruckRoundedIcon from '@mui/icons-material/FireTruckRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'

interface Props {
  titulo: string
  subtitulo: string
  children: ReactNode
  footer?: ReactNode
  ancho?: 'sm' | 'md'
}

const bullets = [
  { icon: DirectionsCarFilledRoundedIcon, texto: 'Control de flota y movilidades' },
  { icon: ChecklistRoundedIcon, texto: 'Checklists de equipamiento por guardia' },
  { icon: GroupsRoundedIcon, texto: 'Personal, roles y permisos' },
]

const AuthLayout = ({ titulo, subtitulo, children, footer, ancho = 'sm' }: Props) => {
  return (
    <Box className="flex min-h-screen w-full bg-slate-100">
      <Box
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 text-white lg:flex"
        sx={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(94,234,212,0.25), transparent 45%), linear-gradient(160deg, #0B1C4A 0%, #1E3A8A 55%, #0D9488 130%)',
        }}
      >
        <Box className="flex items-center gap-2">
          <FireTruckRoundedIcon sx={{ fontSize: 28, color: '#5EEAD4' }} />
          <Typography variant="h6" className="font-bold!">
            SaaS Bomberos
          </Typography>
        </Box>

        <Box>
          <Typography variant="h4" className="mb-3! font-bold! leading-tight!">
            Gestión integral de tu cuartel
          </Typography>
          <Typography variant="body1" className="mb-8! text-slate-200!">
            Personal, movilidades y checklists de equipamiento en un solo lugar,
            con trazabilidad de quién controló cada cosa y cuándo.
          </Typography>

          <Box className="flex flex-col gap-3">
            {bullets.map(({ icon: Icon, texto }) => (
              <Box key={texto} className="flex items-center gap-3">
                <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon fontSize="small" sx={{ color: '#5EEAD4' }} />
                </Box>
                <Typography variant="body2" className="text-slate-100!">
                  {texto}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" className="text-slate-300!">
          © {new Date().getFullYear()} SaaS Bomberos
        </Typography>
      </Box>

      <Box className="flex flex-1 items-center justify-center p-6">
        <Box className={`w-full ${ancho === 'md' ? 'max-w-xl' : 'max-w-sm'}`}>
          <Box className="mb-6 flex items-center gap-2 lg:hidden">
            <FireTruckRoundedIcon color="primary" />
            <Typography variant="h6" className="font-bold!" color="primary">
              SaaS Bomberos
            </Typography>
          </Box>

          <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-8 shadow-sm">
            <Typography variant="h5" className="mb-1! font-bold!">
              {titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-6!">
              {subtitulo}
            </Typography>

            {children}
          </Paper>

          {footer && <Box className="mt-5 text-center">{footer}</Box>}
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
