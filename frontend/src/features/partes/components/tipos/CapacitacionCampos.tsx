import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosCapacitacion } from '../../types'
import { NIVELES_CAPACITACION } from '../../constants'

interface Props {
  value: DatosCapacitacion
  onChange: (value: DatosCapacitacion) => void
  disabled?: boolean
}

const ETIQUETAS_NIVEL: Record<string, string> = {
  CUARTEL: 'Cuartel', FEDERATIVA: 'Federativa', NACIONAL: 'Nacional',
  INTERNACIONAL: 'Internacional', REGIONAL: 'Regional', OTRA: 'Otra',
}

const CapacitacionCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosCapacitacion) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })
  const numero = (campo: keyof DatosCapacitacion) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.value === '' ? null : Number(e.target.value) })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Nivel de capacitación</Typography>
        <RadioGroup row value={value.nivelCapacitacion ?? ''} onChange={(e) => onChange({ ...value, nivelCapacitacion: e.target.value as DatosCapacitacion['nivelCapacitacion'] })}>
          {NIVELES_CAPACITACION.map((n) => (
            <FormControlLabel key={n} value={n} control={<Radio size="small" disabled={disabled} />} label={ETIQUETAS_NIVEL[n]} />
          ))}
        </RadioGroup>
        {value.nivelCapacitacion === 'OTRA' && (
          <TextField
            size="small"
            label="Detalle"
            value={value.nivelCapacitacionOtroDetalle ?? ''}
            onChange={(e) => onChange({ ...value, nivelCapacitacionOtroDetalle: e.target.value })}
            disabled={disabled}
          />
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de capacitación</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.tipoIncendioEstructural} disabled={disabled} onChange={check('tipoIncendioEstructural')} />} label="Incendio Estructural" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoIncendioForestal} disabled={disabled} onChange={check('tipoIncendioForestal')} />} label="Incendio Forestal" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoUsarBrec} disabled={disabled} onChange={check('tipoUsarBrec')} />} label="USAR/BREC" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoGrimpRtc} disabled={disabled} onChange={check('tipoGrimpRtc')} />} label="GRIMP/RTC" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoMatPel} disabled={disabled} onChange={check('tipoMatPel')} />} label="MAT-PEL" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoPsicologiaEmergencia} disabled={disabled} onChange={check('tipoPsicologiaEmergencia')} />} label="Psicología de la Emergencia" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoRescateAcuatico} disabled={disabled} onChange={check('tipoRescateAcuatico')} />} label="Rescate Acuático" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoRescateVehicular} disabled={disabled} onChange={check('tipoRescateVehicular')} />} label="Rescate Vehicular" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoSocorrismo} disabled={disabled} onChange={check('tipoSocorrismo')} />} label="Socorrismo" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoEscuelaCadetes} disabled={disabled} onChange={check('tipoEscuelaCadetes')} />} label="Escuela de Cadetes" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoComandoIncidente} disabled={disabled} onChange={check('tipoComandoIncidente')} />} label="Comando de Incidente" />
          <FormControlLabel control={<Checkbox checked={!!value.tipoOtra} disabled={disabled} onChange={check('tipoOtra')} />} label="Otra" />
          {value.tipoOtra && (
            <TextField
              size="small"
              label="Detalle"
              value={value.tipoOtraDetalle ?? ''}
              onChange={(e) => onChange({ ...value, tipoOtraDetalle: e.target.value })}
              disabled={disabled}
            />
          )}
        </Box>
        <TextField
          className="mt-2!"
          label="Detalle libre"
          value={value.detalleLibre ?? ''}
          onChange={(e) => onChange({ ...value, detalleLibre: e.target.value })}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
        />
      </Box>

      <Box className="grid grid-cols-2 gap-4 sm:w-1/2">
        <TextField label="Días de capacitación" type="number" value={value.diasCapacitacion ?? ''} onChange={numero('diasCapacitacion')} disabled={disabled} />
        <TextField label="Horas de capacitación" type="number" value={value.horasCapacitacion ?? ''} onChange={numero('horasCapacitacion')} disabled={disabled} />
      </Box>
    </Box>
  )
}

export default CapacitacionCampos
