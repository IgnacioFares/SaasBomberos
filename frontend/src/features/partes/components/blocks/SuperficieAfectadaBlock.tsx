import { Box, Checkbox, FormControlLabel, TextField } from '@mui/material'
import type { SuperficieAfectada } from '../../types'

interface Props {
  value: SuperficieAfectada
  onChange: (value: SuperficieAfectada) => void
  disabled?: boolean
}

const campoNumerico = (
  value: SuperficieAfectada,
  onChange: (value: SuperficieAfectada) => void,
  nombre: 'kilometros' | 'metros' | 'hectareas',
) => (e: React.ChangeEvent<HTMLInputElement>) =>
  onChange({ ...value, [nombre]: e.target.value === '' ? null : Number(e.target.value) })

const SuperficieAfectadaBlock = ({ value, onChange, disabled }: Props) => (
  <Box className="flex flex-col gap-4">
    <FormControlLabel
      control={
        <Checkbox
          checked={!!value.noEvacuo}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, noEvacuo: e.target.checked })}
        />
      }
      label="No se evacuó"
    />
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TextField label="Kilómetros" type="number" value={value.kilometros ?? ''} onChange={campoNumerico(value, onChange, 'kilometros')} disabled={disabled} />
      <TextField label="Metros" type="number" value={value.metros ?? ''} onChange={campoNumerico(value, onChange, 'metros')} disabled={disabled} />
      <TextField label="Hectáreas" type="number" value={value.hectareas ?? ''} onChange={campoNumerico(value, onChange, 'hectareas')} disabled={disabled} />
    </Box>
    <TextField
      label="Detalle"
      value={value.detalle ?? ''}
      onChange={(e) => onChange({ ...value, detalle: e.target.value })}
      disabled={disabled}
      fullWidth
      multiline
      minRows={2}
    />
  </Box>
)

export default SuperficieAfectadaBlock
