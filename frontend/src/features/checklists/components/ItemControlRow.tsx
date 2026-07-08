import { Box, Chip, Collapse, IconButton, TextField, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import type { ChecklistItemDef, RespuestaItem } from '../types'
import { ESTILO_ITEM_ESTADO } from '../constants'

interface Props {
  item: ChecklistItemDef
  respuesta: RespuestaItem
  onCambiar: (cambios: Partial<RespuestaItem>) => void
}

// Fila táctil de control: un tap en ✓ marca correcto; el botón "!"
// abre el panel de novedad (cantidad encontrada + observación).
const ItemControlRow = ({ item, respuesta, onCambiar }: Props) => {
  const esperada = item.cantidadEsperada ?? 0

  const marcarOk = () =>
    onCambiar({
      marcado: 'ok',
      cantidad: item.requiereCantidad ? esperada : null,
      observacion: '',
    })

  const marcarNovedad = () =>
    onCambiar({
      marcado: 'novedad',
      cantidad: item.requiereCantidad ? (respuesta.cantidad ?? esperada) : null,
    })

  const cambiarCantidad = (delta: number) => {
    const actual = respuesta.cantidad ?? esperada
    onCambiar({ cantidad: Math.max(0, actual + delta) })
  }

  const chipEstado = () => {
    if (respuesta.marcado === 'ok') {
      const estilo = ESTILO_ITEM_ESTADO.CORRECTO
      return (
        <Chip label="OK" size="small" sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }} />
      )
    }
    if (respuesta.marcado !== 'novedad') return null

    if (item.requiereCantidad && respuesta.cantidad != null) {
      const diferencia = respuesta.cantidad - esperada
      if (diferencia < 0) {
        const estilo = ESTILO_ITEM_ESTADO.FALTANTE
        return (
          <Chip
            label={diferencia === -1 ? 'Falta 1' : `Faltan ${-diferencia}`}
            size="small"
            sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
          />
        )
      }
      if (diferencia > 0) {
        const estilo = ESTILO_ITEM_ESTADO.SOBRANTE
        return (
          <Chip
            label={diferencia === 1 ? 'Sobra 1' : `Sobran ${diferencia}`}
            size="small"
            sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
          />
        )
      }
      const estilo = ESTILO_ITEM_ESTADO.CORRECTO
      return (
        <Chip label="OK" size="small" sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }} />
      )
    }

    const estilo = ESTILO_ITEM_ESTADO.NOVEDAD
    return (
      <Chip label="Novedad" size="small" sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }} />
    )
  }

  return (
    <Box
      className="rounded-xl border transition-colors"
      sx={{
        borderColor: respuesta.marcado === null ? '#E2E8F0' : 'transparent',
        bgcolor:
          respuesta.marcado === 'ok'
            ? '#F0FDF4'
            : respuesta.marcado === 'novedad'
              ? '#FFFBEB'
              : '#FFFFFF',
      }}
    >
      <Box className="flex items-center gap-2 p-2.5 sm:p-3">
        <Box className="min-w-0 flex-1">
          <Box className="flex flex-wrap items-center gap-1.5">
            <Typography variant="body1" className="font-medium! leading-snug!">
              {item.nombre}
            </Typography>
            {item.requiereCantidad && (
              <Typography variant="caption" color="text.secondary" className="whitespace-nowrap">
                (esperados: {esperada})
              </Typography>
            )}
            {!item.obligatorio && (
              <Chip
                label="Opcional"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 11, color: '#64748B' }}
              />
            )}
          </Box>
          {item.descripcion && (
            <Typography variant="caption" color="text.secondary" className="block">
              {item.descripcion}
            </Typography>
          )}
          <Box className="mt-1 empty:hidden">{chipEstado()}</Box>
        </Box>

        <Box className="flex shrink-0 items-center gap-1.5">
          <IconButton
            aria-label={`Marcar ${item.nombre} correcto`}
            onClick={marcarOk}
            sx={{
              width: 44,
              height: 44,
              border: '2px solid',
              borderColor: respuesta.marcado === 'ok' ? '#16A34A' : '#CBD5E1',
              bgcolor: respuesta.marcado === 'ok' ? '#16A34A' : 'transparent',
              color: respuesta.marcado === 'ok' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 150ms ease',
              '&:hover': { bgcolor: respuesta.marcado === 'ok' ? '#15803D' : '#F0FDF4' },
            }}
          >
            <CheckRoundedIcon />
          </IconButton>
          <IconButton
            aria-label={`Registrar novedad en ${item.nombre}`}
            onClick={marcarNovedad}
            sx={{
              width: 44,
              height: 44,
              border: '2px solid',
              borderColor: respuesta.marcado === 'novedad' ? '#D97706' : '#CBD5E1',
              bgcolor: respuesta.marcado === 'novedad' ? '#D97706' : 'transparent',
              color: respuesta.marcado === 'novedad' ? '#FFFFFF' : '#94A3B8',
              transition: 'all 150ms ease',
              '&:hover': { bgcolor: respuesta.marcado === 'novedad' ? '#B45309' : '#FFFBEB' },
            }}
          >
            <PriorityHighRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={respuesta.marcado === 'novedad'} unmountOnExit>
        <Box className="flex flex-col gap-3 px-3 pb-3">
          {item.requiereCantidad && (
            <Box className="flex items-center gap-2">
              <Typography variant="body2" color="text.secondary">
                Cantidad encontrada:
              </Typography>
              <IconButton
                aria-label="Restar uno"
                size="small"
                onClick={() => cambiarCantidad(-1)}
                sx={{ border: '1px solid #CBD5E1', width: 36, height: 36 }}
              >
                <RemoveRoundedIcon fontSize="small" />
              </IconButton>
              <TextField
                type="number"
                size="small"
                value={respuesta.cantidad ?? esperada}
                onChange={(e) => {
                  const valor = Number(e.target.value)
                  onCambiar({ cantidad: Number.isNaN(valor) ? 0 : Math.max(0, valor) })
                }}
                slotProps={{
                  htmlInput: { min: 0, style: { textAlign: 'center', width: 48 } },
                }}
              />
              <IconButton
                aria-label="Sumar uno"
                size="small"
                onClick={() => cambiarCantidad(1)}
                sx={{ border: '1px solid #CBD5E1', width: 36, height: 36 }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <TextField
            placeholder='Observación (ej: "Falta una linterna")'
            size="small"
            fullWidth
            multiline
            maxRows={3}
            value={respuesta.observacion}
            onChange={(e) => onCambiar({ observacion: e.target.value })}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

export default ItemControlRow
