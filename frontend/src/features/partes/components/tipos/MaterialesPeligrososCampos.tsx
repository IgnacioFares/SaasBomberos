import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { DatosMaterialesPeligrosos } from '../../types'

interface Props {
  value: DatosMaterialesPeligrosos
  onChange: (value: DatosMaterialesPeligrosos) => void
  disabled?: boolean
}

const MaterialesPeligrososCampos = ({ value, onChange, disabled }: Props) => {
  const check = (campo: keyof DatosMaterialesPeligrosos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [campo]: e.target.checked })

  return (
    <Box className="flex flex-col gap-4">
      <TextField
        label="Sustancias involucradas"
        value={value.sustanciasInvolucradas ?? ''}
        onChange={(e) => onChange({ ...value, sustanciasInvolucradas: e.target.value })}
        disabled={disabled}
        fullWidth
        multiline
        minRows={2}
      />

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Tipo de evento</Typography>
        <RadioGroup row value={value.tipoEvento ?? ''} onChange={(e) => onChange({ ...value, tipoEvento: e.target.value as DatosMaterialesPeligrosos['tipoEvento'] })}>
          <FormControlLabel value="ESCAPE" control={<Radio size="small" disabled={disabled} />} label="Escape" />
          <FormControlLabel value="DERRAME" control={<Radio size="small" disabled={disabled} />} label="Derrame" />
          <FormControlLabel value="EXPLOSION" control={<Radio size="small" disabled={disabled} />} label="Explosión" />
        </RadioGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Acciones sobre los materiales</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.accMatQuemaControlada} disabled={disabled} onChange={check('accMatQuemaControlada')} />} label="Quema controlada" />
          <FormControlLabel control={<Checkbox checked={!!value.accMatVenteo} disabled={disabled} onChange={check('accMatVenteo')} />} label="Venteo" />
          <FormControlLabel control={<Checkbox checked={!!value.accMatDilucionVapores} disabled={disabled} onChange={check('accMatDilucionVapores')} />} label="Dilución de vapores" />
          <FormControlLabel control={<Checkbox checked={!!value.accMatTrasvase} disabled={disabled} onChange={check('accMatTrasvase')} />} label="Trasvase" />
          <FormControlLabel control={<Checkbox checked={!!value.accMatOtra} disabled={disabled} onChange={check('accMatOtra')} />} label="Otra" />
          {value.accMatOtra && (
            <TextField size="small" label="Detalle" value={value.accMatOtraDetalle ?? ''} onChange={(e) => onChange({ ...value, accMatOtraDetalle: e.target.value })} disabled={disabled} />
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" className="mb-1! font-semibold!">Acciones sobre las personas</Typography>
        <Box className="flex flex-wrap items-center gap-1">
          <FormControlLabel control={<Checkbox checked={!!value.accPersEvacuacion} disabled={disabled} onChange={check('accPersEvacuacion')} />} label="Evacuación" />
          <FormControlLabel control={<Checkbox checked={!!value.accPersDescontaminacion} disabled={disabled} onChange={check('accPersDescontaminacion')} />} label="Descontaminación" />
          <FormControlLabel control={<Checkbox checked={!!value.accPersConfinamiento} disabled={disabled} onChange={check('accPersConfinamiento')} />} label="Confinamiento" />
          <FormControlLabel control={<Checkbox checked={!!value.accPersSinAccion} disabled={disabled} onChange={check('accPersSinAccion')} />} label="Sin acción" />
          <FormControlLabel control={<Checkbox checked={!!value.accPersOtra} disabled={disabled} onChange={check('accPersOtra')} />} label="Otra" />
          {value.accPersOtra && (
            <TextField size="small" label="Detalle" value={value.accPersOtraDetalle ?? ''} onChange={(e) => onChange({ ...value, accPersOtraDetalle: e.target.value })} disabled={disabled} />
          )}
        </Box>
      </Box>

      {value.tipoEvento === 'EXPLOSION' && (
        <Box>
          <Typography variant="subtitle2" className="mb-1! font-semibold!">Situación (evento: explosión)</Typography>
          <Typography variant="caption" color="text.secondary">¿Qué ocurrió primero?</Typography>
          <RadioGroup row value={value.situacionQueOcurrioPrimero ?? ''} onChange={(e) => onChange({ ...value, situacionQueOcurrioPrimero: e.target.value as DatosMaterialesPeligrosos['situacionQueOcurrioPrimero'] })}>
            <FormControlLabel value="DERRAME" control={<Radio size="small" disabled={disabled} />} label="Derrame" />
            <FormControlLabel value="INCENDIO" control={<Radio size="small" disabled={disabled} />} label="Incendio" />
            <FormControlLabel value="INDETERMINADO" control={<Radio size="small" disabled={disabled} />} label="Indeterminado" />
          </RadioGroup>
        </Box>
      )}
    </Box>
  )
}

export default MaterialesPeligrososCampos
