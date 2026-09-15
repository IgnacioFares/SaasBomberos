import { Box, Chip, Paper, Typography } from '@mui/material'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import type { EquipoMovimiento, MovimientoTipo } from '../types'
import { ETIQUETA_MOVIMIENTO, formatearFechaHora } from '../constants'

const ICONO_TIPO: Record<MovimientoTipo, { icono: React.ReactElement; color: string; bg: string }> = {
  ALTA: { icono: <AddCircleRoundedIcon fontSize="small" />, color: '#166534', bg: '#DCFCE7' },
  ACTUALIZACION: { icono: <SyncRoundedIcon fontSize="small" />, color: '#9F1239', bg: '#FFE4E6' },
  CAMBIO_ESTADO: { icono: <SwapHorizRoundedIcon fontSize="small" />, color: '#92400E', bg: '#FEF3C7' },
  CAMBIO_UBICACION: { icono: <PlaceRoundedIcon fontSize="small" />, color: '#0F766E', bg: '#ECFDF9' },
  OBSERVACION: { icono: <ChatBubbleOutlineRoundedIcon fontSize="small" />, color: '#475569', bg: '#F1F5F9' },
  BAJA: { icono: <RemoveCircleOutlineRoundedIcon fontSize="small" />, color: '#991B1B', bg: '#FEE2E2' },
}

interface Props {
  movimientos: EquipoMovimiento[]
}

// Línea de tiempo del historial de un equipo: quién hizo qué y cuándo.
// Base visible de la trazabilidad del inventario.
const MovimientosTimeline = ({ movimientos }: Props) => {
  if (movimientos.length === 0) {
    return (
      <Box className="flex flex-col items-center gap-2 py-8 text-center">
        <HistoryRoundedIcon sx={{ fontSize: 36, color: '#94A3B8' }} />
        <Typography variant="body2" color="text.secondary">
          Todavía no hay movimientos registrados.
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="flex flex-col">
      {movimientos.map((movimiento, index) => {
        const estilo = ICONO_TIPO[movimiento.tipo]
        const esUltimo = index === movimientos.length - 1
        return (
          <Box key={movimiento.id} className="flex gap-3">
            <Box className="flex flex-col items-center">
              <Box
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                sx={{ bgcolor: estilo.bg, color: estilo.color }}
              >
                {estilo.icono}
              </Box>
              {!esUltimo && <Box className="w-px flex-1 bg-slate-200" />}
            </Box>
            <Paper
              elevation={0}
              className={`min-w-0 flex-1 rounded-xl! border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 ${esUltimo ? '' : 'mb-3'}`}
            >
              <Box className="flex flex-wrap items-center gap-1.5">
                <Typography variant="body2" className="font-semibold!">
                  {ETIQUETA_MOVIMIENTO[movimiento.tipo]}
                </Typography>
                {movimiento.unidadNumero != null && (
                  <Chip
                    label={`Unidad N°${movimiento.unidadNumero}`}
                    size="small"
                    sx={{ height: 20, fontSize: 11, bgcolor: '#FFE4E6', color: '#9F1239', fontWeight: 600 }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" className="mt-0.5!">
                {movimiento.detalle}
              </Typography>
              <Typography variant="caption" color="text.secondary" className="mt-1! block">
                {movimiento.realizadoPorNombre} · {formatearFechaHora(movimiento.fecha)}
              </Typography>
            </Paper>
          </Box>
        )
      })}
    </Box>
  )
}

export default MovimientosTimeline
