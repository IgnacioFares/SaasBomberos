import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import {
  MESES,
  TODOS,
  diasDelMes,
  periodoDelMesActual,
  type Periodo,
} from '../kilometraje'

interface Props {
  periodo: Periodo
  anios: number[]
  onCambiar: (periodo: Periodo) => void
}

// Filtro de período del registro: un año, un mes de ese año, o un día
// puntual. Es el recorte con el que se mira el kilometraje.
const FiltroPeriodo = ({ periodo, anios, onCambiar }: Props) => {
  const hoy = new Date()

  const dias = Array.from({ length: diasDelMes(periodo.anio, periodo.mes) }, (_, i) => i + 1)

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4">
      <Box className="flex items-center gap-2">
        <CalendarMonthRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
        <Typography variant="subtitle2" className="font-bold!">
          Período
        </Typography>
      </Box>

      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField
          select
          size="small"
          label="Año"
          value={periodo.anio}
          onChange={(e) => onCambiar({ ...periodo, anio: Number(e.target.value) })}
        >
          {anios.map((anio) => (
            <MenuItem key={anio} value={anio}>
              {anio}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Mes"
          value={periodo.mes}
          onChange={(e) => {
            const mes = Number(e.target.value)
            // Al cambiar de mes se vuelve al mes completo: el día que
            // estaba elegido puede no existir en el mes nuevo.
            onCambiar({ ...periodo, mes, dia: TODOS })
          }}
        >
          <MenuItem value={TODOS}>Todo el año</MenuItem>
          {MESES.map((nombre, indice) => (
            <MenuItem key={nombre} value={indice}>
              {nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Día"
          value={periodo.dia}
          disabled={periodo.mes === TODOS}
          helperText={periodo.mes === TODOS ? 'Elegí un mes para filtrar por día' : undefined}
          onChange={(e) => onCambiar({ ...periodo, dia: Number(e.target.value) })}
        >
          <MenuItem value={TODOS}>Todo el mes</MenuItem>
          {dias.map((dia) => (
            <MenuItem key={dia} value={dia}>
              {dia}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box className="flex flex-wrap gap-2">
        <Button size="small" variant="outlined" onClick={() => onCambiar(periodoDelMesActual())}>
          Este mes
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            onCambiar({ anio: hoy.getFullYear(), mes: hoy.getMonth(), dia: hoy.getDate() })
          }
        >
          Hoy
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onCambiar({ anio: hoy.getFullYear(), mes: TODOS, dia: TODOS })}
        >
          Todo el año
        </Button>
      </Box>
    </Paper>
  )
}

export default FiltroPeriodo
