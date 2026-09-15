import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosRescate } from '../../types'

interface Props {
  value: DatosRescate
  onChange: (value: DatosRescate) => void
  disabled?: boolean
}

const RescateCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosRescate) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Subtipo</Typography>
        <RadioGroup row value={value.subtipo ?? ''} onChange={(e) => onChange({ ...value, subtipo: e.target.value as DatosRescate['subtipo'] })}>
          <FormControlLabel value="ANIMAL" control={<Radio size="small" disabled={disabled} />} label="Animal" />
          <FormControlLabel value="PERSONA" control={<Radio size="small" disabled={disabled} />} label="Persona" />
          <FormControlLabel value="OTRO" control={<Radio size="small" disabled={disabled} />} label="Otro" />
        </RadioGroup>
        {value.subtipo === 'OTRO' && (
          <TextField
            size="small"
            label="Detalle"
            value={value.subtipoOtroDetalle ?? ''}
            onChange={(e) => onChange({ ...value, subtipoOtroDetalle: e.target.value })}
            disabled={disabled}
          />
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Características del lugar</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.lugarCasas} disabled={disabled} onChange={check('lugarCasas')} />} label="Casas" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarEdificio} disabled={disabled} onChange={check('lugarEdificio')} />} label="Edificio" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarArbol} disabled={disabled} onChange={check('lugarArbol')} />} label="Árbol" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarRios} disabled={disabled} onChange={check('lugarRios')} />} label="Ríos" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarPileta} disabled={disabled} onChange={check('lugarPileta')} />} label="Pileta" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarLagos} disabled={disabled} onChange={check('lugarLagos')} />} label="Lagos" />
          <FormControlLabel control={<Checkbox checked={!!value.lugarOtro} disabled={disabled} onChange={check('lugarOtro')} />} label="Otro" />
          {value.lugarOtro && (
            <TextField
              size="small"
              label="Detalle"
              value={value.lugarOtroDetalle ?? ''}
              onChange={(e) => onChange({ ...value, lugarOtroDetalle: e.target.value })}
              disabled={disabled}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default RescateCampos
