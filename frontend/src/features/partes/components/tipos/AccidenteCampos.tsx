import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosAccidente } from '../../types'

interface Props {
  value: DatosAccidente
  onChange: (value: DatosAccidente) => void
  disabled?: boolean
}

const AccidenteCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosAccidente) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Características del lugar</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.climaLluvia} disabled={disabled} onChange={check('climaLluvia')} />} label="Lluvia" />
          <FormControlLabel control={<Checkbox checked={!!value.climaNeblina} disabled={disabled} onChange={check('climaNeblina')} />} label="Neblina" />
          <FormControlLabel control={<Checkbox checked={!!value.climaSoleado} disabled={disabled} onChange={check('climaSoleado')} />} label="Soleado" />
          <FormControlLabel control={<Checkbox checked={!!value.climaVentoso} disabled={disabled} onChange={check('climaVentoso')} />} label="Ventoso" />
          <FormControlLabel control={<Checkbox checked={!!value.climaNoche} disabled={disabled} onChange={check('climaNoche')} />} label="Noche" />
          <FormControlLabel control={<Checkbox checked={!!value.climaOtro} disabled={disabled} onChange={check('climaOtro')} />} label="Otro" />
          {value.climaOtro && (
            <TextField
              size="small"
              label="Detalle"
              value={value.climaOtroDetalle ?? ''}
              onChange={(e) => onChange({ ...value, climaOtroDetalle: e.target.value })}
              disabled={disabled}
            />
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Causas del accidente</Typography>
        <Box className="flex flex-col gap-2">
          <Box className="flex flex-wrap items-center gap-2">
            <FormControlLabel control={<Checkbox checked={!!value.causaChoque} disabled={disabled} onChange={check('causaChoque')} />} label="Choque" />
            {value.causaChoque && (
              <RadioGroup row value={value.tipoChoque ?? ''} onChange={(e) => onChange({ ...value, tipoChoque: e.target.value as DatosAccidente['tipoChoque'] })}>
                <FormControlLabel value="FRONTAL" control={<Radio size="small" disabled={disabled} />} label="Frontal" />
                <FormControlLabel value="LATERAL" control={<Radio size="small" disabled={disabled} />} label="Lateral" />
                <FormControlLabel value="TRASERO" control={<Radio size="small" disabled={disabled} />} label="Trasero" />
                <FormControlLabel value="MULTIPLES_LUGARES" control={<Radio size="small" disabled={disabled} />} label="Múltiples lugares" />
              </RadioGroup>
            )}
          </Box>
          <FormControlLabel control={<Checkbox checked={!!value.causaDespiste} disabled={disabled} onChange={check('causaDespiste')} />} label="Despiste" />
          <Box className="flex flex-wrap items-center gap-2">
            <FormControlLabel control={<Checkbox checked={!!value.causaDerrame} disabled={disabled} onChange={check('causaDerrame')} />} label="Derrame" />
            {value.causaDerrame && (
              <RadioGroup row value={value.tipoDerrame ?? ''} onChange={(e) => onChange({ ...value, tipoDerrame: e.target.value as DatosAccidente['tipoDerrame'] })}>
                <FormControlLabel value="SOLIDO" control={<Radio size="small" disabled={disabled} />} label="Sólido" />
                <FormControlLabel value="LIQUIDO" control={<Radio size="small" disabled={disabled} />} label="Líquido" />
                <FormControlLabel value="GASEOSO" control={<Radio size="small" disabled={disabled} />} label="Gaseoso" />
              </RadioGroup>
            )}
          </Box>
          <FormControlLabel control={<Checkbox checked={!!value.causaVuelco} disabled={disabled} onChange={check('causaVuelco')} />} label="Vuelco" />
        </Box>
      </Box>
    </Box>
  )
}

export default AccidenteCampos
