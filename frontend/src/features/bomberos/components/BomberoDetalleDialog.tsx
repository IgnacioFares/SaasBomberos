import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from '@mui/material'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import BloodtypeRoundedIcon from '@mui/icons-material/BloodtypeRounded'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import HealingRoundedIcon from '@mui/icons-material/HealingRounded'
import type { Bombero } from '../../../types'

interface Props {
  bombero: Bombero | null
  onCerrar: () => void
}

const iniciales = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

// Ficha completa de un bombero: contacto + datos médicos y de
// emergencia, pensada para encontrar rápido lo crítico.
const BomberoDetalleDialog = ({ bombero, onCerrar }: Props) => {
  if (!bombero) return null

  const fila = (icono: React.ReactElement, etiqueta: string, valor?: string | null) => (
    <Box className="flex items-start gap-3 py-1.5">
      <Box className="mt-0.5 shrink-0">{icono}</Box>
      <Box className="min-w-0">
        <Typography variant="caption" color="text.secondary">
          {etiqueta}
        </Typography>
        <Typography variant="body2" className="font-medium!">
          {valor || '—'}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      {/* Encabezado con identidad y lo crítico a simple vista */}
      <Box
        className="flex items-center gap-4 px-6 pb-4 pt-6 text-white"
        sx={{ background: 'linear-gradient(120deg, #1C1917 0%, #44403C 60%, #57534E 140%)' }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'rgba(255,255,255,0.15)',
            fontSize: 22,
            fontWeight: 700,
            border: '2px solid rgba(252,211,77,0.6)',
          }}
        >
          {iniciales(bombero.nombre, bombero.apellido)}
        </Avatar>
        <Box className="min-w-0">
          <Typography variant="h6" className="font-bold! leading-tight! text-white!">
            {bombero.nombre} {bombero.apellido}
          </Typography>
          <Box className="mt-1 flex flex-wrap items-center gap-1.5">
            {bombero.rango && (
              <Chip
                icon={<ShieldRoundedIcon sx={{ color: '#FCD34D!important', fontSize: 15 }} />}
                label={bombero.rango}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#E2E8F0', fontWeight: 600, height: 24 }}
              />
            )}
            {bombero.grupoSanguineo && (
              <Chip
                icon={<BloodtypeRoundedIcon sx={{ color: '#FECACA!important', fontSize: 15 }} />}
                label={bombero.grupoSanguineo}
                size="small"
                sx={{ bgcolor: 'rgba(220,38,38,0.35)', color: '#FEE2E2', fontWeight: 700, height: 24 }}
              />
            )}
            <Chip
              label={bombero.activo === false ? 'Inactivo' : 'Activo'}
              size="small"
              sx={{
                bgcolor: bombero.activo === false ? 'rgba(220,38,38,0.3)' : 'rgba(34,197,94,0.25)',
                color: bombero.activo === false ? '#FECACA' : '#BBF7D0',
                fontWeight: 600,
                height: 24,
              }}
            />
          </Box>
        </Box>
      </Box>

      <DialogContent className="flex flex-col gap-1 pt-4!">
        <Typography variant="subtitle2" color="text.secondary" className="font-semibold! uppercase tracking-wide">
          Contacto
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2">
          {fila(<BadgeRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />, 'DNI', bombero.dni)}
          {fila(<PhoneRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />, 'Teléfono', bombero.telefono)}
          {fila(<MailOutlineRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />, 'Email', bombero.email)}
          {fila(
            <CalendarMonthRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />,
            'Fecha de ingreso',
            // T00:00:00 fija la fecha en horario local; sin eso, el ISO
            // se interpreta como UTC y resta un día en Argentina.
            bombero.fechaIngreso
              ? new Date(`${bombero.fechaIngreso}T00:00:00`).toLocaleDateString('es-AR')
              : null
          )}
        </Box>

        <Divider className="my-2!" />

        <Typography variant="subtitle2" color="text.secondary" className="font-semibold! uppercase tracking-wide">
          Emergencia y salud
        </Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2">
          {fila(
            <LocalPhoneRoundedIcon sx={{ fontSize: 20, color: '#B45309' }} />,
            'Teléfono de emergencia',
            bombero.telefonoEmergencia
          )}
          {fila(
            <BloodtypeRoundedIcon sx={{ fontSize: 20, color: '#B91C1C' }} />,
            'Grupo sanguíneo',
            bombero.grupoSanguineo
          )}
          {fila(
            <MedicalServicesRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />,
            'Obra social',
            bombero.obraSocial
          )}
          {fila(
            <HealingRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />,
            'Enfermedades / alergias',
            bombero.enfermedades || 'Ninguna declarada'
          )}
        </Box>
      </DialogContent>

      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BomberoDetalleDialog
