import { Box, TextField } from '@mui/material'
import type { Solicitante } from '../../types'

interface Props {
  value: Solicitante
  onChange: (value: Solicitante) => void
  disabled?: boolean
}

const SolicitanteBlock = ({ value, onChange, disabled }: Props) => {
  const campo = (nombre: keyof Solicitante) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [nombre]: e.target.value })

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <TextField label="Nombre" value={value.nombre ?? ''} onChange={campo('nombre')} disabled={disabled} fullWidth />
      <TextField label="Apellido" value={value.apellido ?? ''} onChange={campo('apellido')} disabled={disabled} fullWidth />
      <TextField label="DNI" value={value.dni ?? ''} onChange={campo('dni')} disabled={disabled} fullWidth />
      <TextField label="Teléfono" value={value.telefono ?? ''} onChange={campo('telefono')} disabled={disabled} fullWidth />
    </Box>
  )
}

export default SolicitanteBlock
