import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import DrawRoundedIcon from '@mui/icons-material/DrawRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import type { ChecklistRegistro } from '../types'
import { ESTILO_REGISTRO_ESTADO, formatearDuracion, formatearFechaHora } from '../constants'
import ResumenChips from './ResumenChips'

interface Props {
  registro: ChecklistRegistro
}

// Tarjeta compartida por "Pendientes de firma" e "Historial": muestra
// toda la información resumida sin necesidad de abrir el detalle.
const RegistroCard = ({ registro }: Props) => {
  const estiloEstado = ESTILO_REGISTRO_ESTADO[registro.estado]
  const duracion = formatearDuracion(registro.duracionSegundos)

  const metaRow = (icono: React.ReactElement, contenido: React.ReactNode, key: string) => (
    <Box key={key} className="flex items-center gap-1.5 text-slate-600">
      {icono}
      <Typography variant="body2" color="text.secondary" className="min-w-0 truncate">
        {contenido}
      </Typography>
    </Box>
  )

  return (
    <Paper
      elevation={0}
      className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 transition-shadow hover:shadow-md sm:p-5"
    >
      <Box className="flex items-start justify-between gap-2">
        <Box className="min-w-0">
          <Box className="flex items-center gap-1.5">
            <DirectionsCarFilledRoundedIcon fontSize="small" sx={{ color: '#0D9488' }} />
            <Typography variant="subtitle1" className="truncate font-semibold! leading-tight!">
              {registro.movilidadNombre}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" className="block truncate">
            {registro.templateNombre}
          </Typography>
        </Box>
        <Chip
          label={estiloEstado.label}
          size="small"
          sx={{ bgcolor: estiloEstado.bg, color: estiloEstado.color, fontWeight: 700, flexShrink: 0 }}
        />
      </Box>

      <Box className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {metaRow(
          <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
          formatearFechaHora(registro.fecha),
          'fecha'
        )}
        {metaRow(
          <PersonRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
          <>Responsable: {registro.realizadoPorNombre}</>,
          'responsable'
        )}
        {registro.participantes.length > 0 &&
          metaRow(
            <GroupsRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
            registro.participantes.map((p) => p.nombre).join(', '),
            'participantes'
          )}
        {duracion &&
          metaRow(<TimerOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />, duracion, 'duracion')}
        {registro.firmadoPorNombre &&
          metaRow(
            <DrawRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
            <>Firmó: {registro.firmadoPorNombre}</>,
            'firma'
          )}
      </Box>

      <ResumenChips resumen={registro.resumen} />

      <Button
        component={RouterLink}
        to={`/checklists/registros/${registro.id}`}
        variant={registro.estado === 'PENDIENTE_FIRMA' ? 'contained' : 'outlined'}
        color="primary"
        endIcon={<ArrowForwardRoundedIcon />}
        className="mt-1! self-start!"
      >
        {registro.estado === 'PENDIENTE_FIRMA' ? 'Revisar y firmar' : 'Ver detalle'}
      </Button>
    </Paper>
  )
}

export default RegistroCard
