import { Box, Paper, TextField, Typography } from '@mui/material'
import type { DatosFalsaAlarma } from '../../types'

interface Props {
  value: DatosFalsaAlarma
  onChange: (value: DatosFalsaAlarma) => void
  disabled?: boolean
}

const relleno = (valor: string | number | null | undefined) =>
  valor === null || valor === undefined || valor === '' ? '____' : valor

const soloHora = (valor: string | null) => (valor ? valor.slice(0, 5) : '____')

// Mismo texto que arma el backend (ParteService#generarTextoFalsaAlarma):
// se recalcula acá solo para mostrar una vista previa mientras se completa.
export const generarTextoFalsaAlarma = (d: DatosFalsaAlarma) =>
  `Por el presente informo que, siendo las ${soloHora(d.horaComunicacion)} el CEO comunica sobre un incendio de ` +
  `${relleno(d.tipoIncendioComunicado)} en calle ${relleno(d.calle)}, verificado por la movilidad policial n° ` +
  `${relleno(d.movilPolicialNro)}, a cargo ${relleno(d.aCargoDe)}. Al arribar la movilidad n° ${relleno(d.movilArriboNro)} ` +
  `a las ${soloHora(d.horaArribo)} hs, confirmamos que no habría ningún incendio. Se regresa al cuartel tras haber ` +
  `informado al CEO dicha novedad, con un recorrido de ${relleno(d.kilometrosRecorridos)} Km y un consumo de ` +
  `${relleno(d.litrosCombustible)} lts. de combustible.`

const FalsaAlarmaCampos = ({ value, onChange, disabled }: Props) => {
  const texto = (campo: keyof DatosFalsaAlarma) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.value })
  const numero = (campo: keyof DatosFalsaAlarma) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.value === '' ? null : Number(e.target.value) })

  return (
    <Box className="flex flex-col gap-4">
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Hora de la comunicación" type="time" value={value.horaComunicacion ?? ''} onChange={texto('horaComunicacion')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Tipo de incendio comunicado" value={value.tipoIncendioComunicado ?? ''} onChange={texto('tipoIncendioComunicado')} disabled={disabled} />
        <TextField label="Calle" value={value.calle ?? ''} onChange={texto('calle')} disabled={disabled} />
        <TextField label="Móvil policial que verificó, N°" value={value.movilPolicialNro ?? ''} onChange={texto('movilPolicialNro')} disabled={disabled} />
        <TextField label="A cargo de" value={value.aCargoDe ?? ''} onChange={texto('aCargoDe')} disabled={disabled} />
        <TextField label="Móvil que arribó, N°" value={value.movilArriboNro ?? ''} onChange={texto('movilArriboNro')} disabled={disabled} />
        <TextField label="Hora de arribo" type="time" value={value.horaArribo ?? ''} onChange={texto('horaArribo')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Kilómetros recorridos" type="number" value={value.kilometrosRecorridos ?? ''} onChange={numero('kilometrosRecorridos')} disabled={disabled} />
        <TextField label="Litros de combustible consumidos" type="number" value={value.litrosCombustible ?? ''} onChange={numero('litrosCombustible')} disabled={disabled} />
      </Box>

      <Paper variant="outlined" className="p-3! bg-slate-50!">
        <Typography variant="caption" color="text.secondary">Vista previa del texto generado</Typography>
        <Typography variant="body2" className="mt-1!">{generarTextoFalsaAlarma(value)}</Typography>
      </Paper>
    </Box>
  )
}

export default FalsaAlarmaCampos
