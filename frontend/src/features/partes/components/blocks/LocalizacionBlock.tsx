import { Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import type { Localizacion } from '../../types'

interface Props {
  value: Localizacion
  onChange: (value: Localizacion) => void
  disabled?: boolean
}

const LocalizacionBlock = ({ value, onChange, disabled }: Props) => {
  const campo = (nombre: keyof Localizacion) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [nombre]: e.target.value })

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField label="Localidad" value={value.localidad ?? ''} onChange={campo('localidad')} disabled={disabled} fullWidth />
      <TextField label="Distrito" value={value.distrito ?? ''} onChange={campo('distrito')} disabled={disabled} fullWidth />
      <TextField label="Calle/Ruta" value={value.calleRuta ?? ''} onChange={campo('calleRuta')} disabled={disabled} fullWidth />
      <TextField label="N°/Km" value={value.numeroKm ?? ''} onChange={campo('numeroKm')} disabled={disabled} fullWidth />
      <TextField
        label="Entre calles"
        value={value.entreCalles ?? ''}
        onChange={campo('entreCalles')}
        disabled={disabled}
        fullWidth
        className="sm:col-span-2"
      />
      <Box className="sm:col-span-2">
        <Typography variant="caption" color="text.secondary">Tipo de zona</Typography>
        <RadioGroup
          row
          value={value.tipoZona ?? ''}
          onChange={(e) => onChange({ ...value, tipoZona: e.target.value as Localizacion['tipoZona'] })}
        >
          <FormControlLabel value="URBANA" control={<Radio disabled={disabled} />} label="Urbana" />
          <FormControlLabel value="RURAL" control={<Radio disabled={disabled} />} label="Rural" />
        </RadioGroup>
      </Box>
    </Box>
  )
}

export default LocalizacionBlock
