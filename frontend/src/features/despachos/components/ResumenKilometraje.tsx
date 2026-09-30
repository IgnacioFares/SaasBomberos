import { Box, Chip, Paper, Typography } from '@mui/material'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded'
import StatCard from '../../../components/StatCard'
import type { KilometrajeMovilidad, ResumenKilometraje as Resumen } from '../kilometraje'

interface Props {
  resumen: Resumen
  porMovilidad: KilometrajeMovilidad[]
  etiquetaPeriodo: string
}

// Lo que se lleva a la rendición: cuántos kilómetros hizo cada
// movilidad en el período elegido.
const ResumenKilometraje = ({ resumen, porMovilidad, etiquetaPeriodo }: Props) => (
  <Box className="flex flex-col gap-3">
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icono={LocalShippingRoundedIcon}
        etiqueta={`Kilómetros recorridos · ${etiquetaPeriodo}`}
        valor={`${resumen.totalKm} km`}
        color="red"
      />
      <StatCard
        icono={RouteRoundedIcon}
        etiqueta="Salidas finalizadas medidas"
        valor={resumen.salidasMedidas}
        color="blue"
      />
      <StatCard
        icono={StraightenRoundedIcon}
        etiqueta="Promedio por salida (ida y vuelta)"
        valor={`${resumen.promedioKm} km`}
        color="teal"
      />
    </Box>

    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="subtitle2" className="font-bold!">
          Kilometraje por movilidad
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {etiquetaPeriodo}
        </Typography>
      </Box>

      {porMovilidad.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay salidas registradas en este período.
        </Typography>
      ) : (
        <Box className="flex flex-col">
          {/* Encabezado de la grilla; en pantalla chica se oculta y
              cada fila se lee con sus propias etiquetas. */}
          <Box className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-slate-200 pb-2 sm:grid">
            {['Movilidad', 'Salidas', 'Kilómetros', 'Promedio'].map((titulo, indice) => (
              <Typography
                key={titulo}
                variant="caption"
                color="text.secondary"
                className={`font-bold! ${indice === 0 ? '' : 'text-right!'}`}
              >
                {titulo}
              </Typography>
            ))}
          </Box>

          {porMovilidad.map((fila) => (
            <Box
              key={fila.movilidadId}
              className="grid grid-cols-2 gap-2 border-b border-slate-100 py-2 last:border-0 sm:grid-cols-[2fr_1fr_1fr_1fr]"
            >
              <Box className="col-span-2 min-w-0 sm:col-span-1">
                <Typography variant="body2" className="truncate font-semibold!">
                  {fila.nombre}
                </Typography>
                {fila.patente && (
                  <Typography variant="caption" color="text.secondary">
                    {fila.patente}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" className="tabular-nums sm:text-right!">
                <span className="text-slate-400 sm:hidden">Salidas: </span>
                {fila.salidas}
              </Typography>
              <Typography variant="body2" className="tabular-nums font-bold! sm:text-right!">
                <span className="font-normal! text-slate-400 sm:hidden">Km: </span>
                {fila.totalKm} km
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="tabular-nums sm:text-right!"
              >
                <span className="text-slate-400 sm:hidden">Promedio: </span>
                {fila.promedioKm} km
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box className="flex flex-wrap items-center gap-2">
        {resumen.salidasSinUbicacion > 0 && (
          <Chip
            size="small"
            label={`${resumen.salidasSinUbicacion} salidas sin destino ubicado`}
            sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          Kilómetros en línea recta entre origen y destino, ida y vuelta: el recorrido real por
          calle siempre da algo más. Las salidas sin el destino marcado en el mapa no suman.
        </Typography>
      </Box>
    </Paper>
  </Box>
)

export default ResumenKilometraje
