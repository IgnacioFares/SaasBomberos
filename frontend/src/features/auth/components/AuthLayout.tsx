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
      {/* Foto del cuartel (frontend/public/cuartel.png) a color real, con
          apenas un sombreado neutro hacia abajo para que el texto blanco
          siga siendo legible; si la foto no existe, no se rompe nada. */}
      <Box
        className="relative hidden w-[42%] flex-col overflow-hidden p-10 text-white lg:flex"
        sx={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.35) 55%, rgba(2,6,23,0.15) 100%), url('/cuartel.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box className="flex items-center gap-2">
          <FireTruckRoundedIcon sx={{ fontSize: 28, color: '#5EEAD4' }} />
        </Box>

        <Box className="mt-10">
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

        <Typography variant="caption" className="mt-auto! text-slate-300!">
          © {new Date().getFullYear()}
        </Typography>
      </Box>

      <Box className="flex flex-1 items-center justify-center p-6">
        <Box className={`w-full ${ancho === 'md' ? 'max-w-xl' : 'max-w-sm'}`}>
          <Box className="mb-6 flex items-center justify-center lg:hidden">
            <FireTruckRoundedIcon color="primary" />
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
