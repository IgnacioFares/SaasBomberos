import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosIncendioForestalLugar, DatosIncendioIndustrial } from '../../types'
import { CAUSAS_INCENDIO, SUBTIPOS_INDUSTRIAL } from '../../constants'

interface Props {
  value: DatosIncendioIndustrial
  onChange: (value: DatosIncendioIndustrial) => void
  // Incendio Forestal reutiliza esta misma estructura y agrega el bloque
  // de "Característica del lugar" (campo/pastizal/etc.).
  forestal?: { value: DatosIncendioForestalLugar; onChange: (value: DatosIncendioForestalLugar) => void }
  disabled?: boolean
}

const ETIQUETAS_SUBTIPO: Record<string, string> = {
  ALIMENTACION: 'Alimentación', AUTOMOTRIZ: 'Automotriz', METALURGICA: 'Metalúrgica',
  QUIMICA: 'Química', PETROQUIMICA: 'Petroquímica', TEXTIL: 'Textil', OTRO: 'Otro',
}

const IncendioIndustrialCampos = ({ value, onChange, forestal, disabled }: Props) => {
  const checkForestal = (campo: keyof DatosIncendioForestalLugar) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (forestal) forestal.onChange({ ...forestal.value, [campo]: e.target.checked })
  }

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Subtipo</Typography>
        <RadioGroup row value={value.subtipoIndustrial ?? ''} onChange={(e) => onChange({ ...value, subtipoIndustrial: e.target.value as DatosIncendioIndustrial['subtipoIndustrial'] })}>
          {SUBTIPOS_INDUSTRIAL.map((s) => (
            <FormControlLabel key={s} value={s} control={<Radio size="small" disabled={disabled} />} label={ETIQUETAS_SUBTIPO[s]} />
          ))}
        </RadioGroup>
        {value.subtipoIndustrial === 'OTRO' && (
          <TextField
            size="small"
            label="Detalle"
            value={value.subtipoIndustrialOtroDetalle ?? ''}
            onChange={(e) => onChange({ ...value, subtipoIndustrialOtroDetalle: e.target.value })}
            disabled={disabled}
          />
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Causa del incendio</Typography>
        <RadioGroup row value={value.causaIncendio ?? ''} onChange={(e) => onChange({ ...value, causaIncendio: e.target.value as DatosIncendioIndustrial['causaIncendio'] })}>
          {CAUSAS_INCENDIO.map((c) => (
            <FormControlLabel key={c} value={c} control={<Radio size="small" disabled={disabled} />} label={c.charAt(0) + c.slice(1).toLowerCase()} />
          ))}
        </RadioGroup>
      </Box>

      {forestal && (
        <Box>
          <Typography variant="subtitle2" className="mb-1! font-semibold!">Característica del lugar</Typography>
          <Box className="flex flex-wrap items-center gap-1">
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarCampo} disabled={disabled} onChange={checkForestal('lugarCampo')} />} label="Campo" />
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarPastizal} disabled={disabled} onChange={checkForestal('lugarPastizal')} />} label="Pastizal" />
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarArbustalMatorral} disabled={disabled} onChange={checkForestal('lugarArbustalMatorral')} />} label="Arbustal o matorral" />
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarInterfase} disabled={disabled} onChange={checkForestal('lugarInterfase')} />} label="Interfase" />
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarBasural} disabled={disabled} onChange={checkForestal('lugarBasural')} />} label="Basural" />
            <FormControlLabel control={<Checkbox checked={!!forestal.value.lugarOtro} disabled={disabled} onChange={checkForestal('lugarOtro')} />} label="Otro" />
            {forestal.value.lugarOtro && (
              <TextField
                size="small"
                label="Detalle"
                value={forestal.value.lugarOtroDetalle ?? ''}
                onChange={(e) => forestal.onChange({ ...forestal.value, lugarOtroDetalle: e.target.value })}
                disabled={disabled}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default IncendioIndustrialCampos
