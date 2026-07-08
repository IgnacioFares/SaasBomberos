import type { SvgIconComponent } from '@mui/icons-material'
import { Box, Chip, CircularProgress, Paper, Typography } from '@mui/material'

type Color = 'blue' | 'teal' | 'amber' | 'violet' | 'green' | 'orange' | 'red' | 'slate'

const paletas: Record<Color, { bg: string; icon: string; text: string }> = {
  blue: { bg: '#EFF4FF', icon: '#1E3A8A', text: '#1E3A8A' },
  teal: { bg: '#ECFDF9', icon: '#0D9488', text: '#0F766E' },
  amber: { bg: '#FFF7ED', icon: '#B45309', text: '#B45309' },
  violet: { bg: '#F3F0FF', icon: '#6D28D9', text: '#6D28D9' },
  green: { bg: '#F0FDF4', icon: '#16A34A', text: '#166534' },
  orange: { bg: '#FFF7ED', icon: '#EA580C', text: '#C2410C' },
  red: { bg: '#FEF2F2', icon: '#DC2626', text: '#B91C1C' },
  slate: { bg: '#F1F5F9', icon: '#475569', text: '#475569' },
}

interface Props {
  icono: SvgIconComponent
  etiqueta: string
  valor: number | string | null
  color: Color
  cargando?: boolean
  proximamente?: boolean
}

const StatCard = ({ icono: Icono, etiqueta, valor, color, cargando, proximamente }: Props) => {
  const paleta = paletas[color]

  return (
    <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-5">
      <Box className="flex items-start justify-between">
        <Box
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          sx={{ bgcolor: paleta.bg }}
        >
          <Icono sx={{ color: paleta.icon }} />
        </Box>
        {proximamente && (
          <Chip
            label="Próximamente"
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600 }}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" className="mt-3!">
        {etiqueta}
      </Typography>

      {cargando ? (
        <CircularProgress size={22} className="mt-2!" sx={{ color: paleta.text }} />
      ) : (
        <Typography variant="h4" className="mt-1! font-bold!" sx={{ color: paleta.text }}>
          {valor ?? '—'}
        </Typography>
      )}
    </Paper>
  )
}

export default StatCard
