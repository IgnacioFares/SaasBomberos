import { Link as RouterLink } from 'react-router-dom'
import { Box, Chip, Paper, Typography } from '@mui/material'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import type { Equipo, EquipoEstado } from '../types'
import { ESTILO_EQUIPO_ESTADO, ESTILO_VENCIMIENTO } from '../constants'
import { ubicacionesDeEquipo } from '../utils'

interface Props {
  equipos: Equipo[]
}

// Vista móvil del inventario: tarjetas táctiles con los datos clave.
const EquipoCardList = ({ equipos }: Props) => {
  if (equipos.length === 0) {
    return (
      <Box className="flex flex-col items-center gap-2 py-16 text-center">
        <Inventory2RoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
        <Typography variant="body2" color="text.secondary">
          No hay equipos que coincidan con la búsqueda o los filtros.
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="flex flex-col gap-3">
      {equipos.map((equipo) => {
        const ubicaciones = ubicacionesDeEquipo(equipo).join(', ')
        const estiloVencimiento = ESTILO_VENCIMIENTO[equipo.estadoVencimiento]

        return (
          <Paper
            key={equipo.id}
            component={RouterLink}
            to={`/inventario/${equipo.id}`}
            elevation={0}
            className="rounded-2xl! flex items-center gap-3 border border-slate-200 p-4 no-underline transition-shadow hover:shadow-md"
          >
            <Box className="min-w-0 flex-1">
              <Box className="flex flex-wrap items-baseline gap-x-2">
                <Typography variant="subtitle2" className="font-semibold! text-slate-900">
                  {equipo.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {equipo.subcategoriaNombre ?? equipo.categoriaNombre}
                  {equipo.cantidad != null &&
                    ` · ${equipo.cantidad}${equipo.unidadMedida ? ` ${equipo.unidadMedida}` : ''}`}
                </Typography>
              </Box>

              <Box className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {Object.entries(equipo.cantidadPorEstado).map(([estado, cantidad]) => {
                  const estilo = ESTILO_EQUIPO_ESTADO[estado as EquipoEstado]
                  const soloUnEstado = Object.keys(equipo.cantidadPorEstado).length === 1
                  return (
                    <Chip
                      key={estado}
                      label={soloUnEstado ? estilo.label : `${cantidad} ${estilo.label.toLowerCase()}`}
                      size="small"
                      sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
                    />
                  )
                })}
                {equipo.estadoVencimiento !== 'SIN_VENCIMIENTO' && (
                  <Chip
                    label={estiloVencimiento.label}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: estiloVencimiento.bg,
                      color: estiloVencimiento.color,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              {ubicaciones && (
                <Box className="mt-1 flex items-center gap-1">
                  <PlaceRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                  <Typography variant="caption" color="text.secondary" className="truncate">
                    {ubicaciones}
                  </Typography>
                </Box>
              )}
            </Box>
            <ChevronRightRoundedIcon sx={{ color: '#94A3B8' }} className="shrink-0" />
          </Paper>
        )
      })}
    </Box>
  )
}

export default EquipoCardList
