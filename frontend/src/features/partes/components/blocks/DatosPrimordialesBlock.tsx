import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import type { DatosPrimordiales } from '../../types'

interface Props {
  value: DatosPrimordiales
  onChange: (value: DatosPrimordiales) => void
  disabled?: boolean
}

const DatosPrimordialesBlock = ({ value, onChange, disabled }: Props) => {
  const campo = (nombre: keyof DatosPrimordiales) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [nombre]: e.target.value })

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value.participoComisionDirectiva}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, participoComisionDirectiva: e.target.checked })}
            />
          }
          label="Participó comisión directiva"
        />
        {value.participoComisionDirectiva && (
          <TextField
            label="Detalle"
            value={value.participoComisionDetalle ?? ''}
            onChange={campo('participoComisionDetalle')}
            disabled={disabled}
            fullWidth
            size="small"
          />
        )}
      </Box>

      <Box className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <TextField label="Hora llamado" type="time" value={value.horaLlamado ?? ''} onChange={campo('horaLlamado')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Hora salida" type="time" value={value.horaSalida ?? ''} onChange={campo('horaSalida')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Hora arribo" type="time" value={value.horaArribo ?? ''} onChange={campo('horaArribo')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Hora terminada" type="time" value={value.horaTerminada ?? ''} onChange={campo('horaTerminada')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Hora regreso al cuartel" type="time" value={value.horaRegresoCuartel ?? ''} onChange={campo('horaRegresoCuartel')} disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
      </Box>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextField label="A cargo" value={value.aCargo ?? ''} onChange={campo('aCargo')} disabled={disabled} />
        <TextField label="Operador" value={value.operador ?? ''} onChange={campo('operador')} disabled={disabled} />
        <TextField label="Móvil N°" value={value.movilNro ?? ''} onChange={campo('movilNro')} disabled={disabled} />
        <TextField label="Chofer" value={value.chofer ?? ''} onChange={campo('chofer')} disabled={disabled} />
        <TextField label="Apoyo móvil N°" value={value.apoyoMovilNro ?? ''} onChange={campo('apoyoMovilNro')} disabled={disabled} />
        <TextField label="Chofer (apoyo)" value={value.choferApoyo ?? ''} onChange={campo('choferApoyo')} disabled={disabled} />
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">Dotación (móvil)</Typography>
        <TextField
          value={value.dotacionMovil ?? ''}
          onChange={campo('dotacionMovil')}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
          placeholder="Lista de nombres"
        />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">Dotación (apoyo móvil)</Typography>
        <TextField
          value={value.dotacionApoyoMovil ?? ''}
          onChange={campo('dotacionApoyoMovil')}
          disabled={disabled}
          fullWidth
          multiline
          minRows={2}
          placeholder="Lista de nombres"
        />
      </Box>
    </Box>
  )
}

export default DatosPrimordialesBlock
