import { Box, Button, IconButton, TextField, Tooltip } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { PersonaDamnificada } from '../../types'
import { filaInicialPersona } from '../../constants'

interface Props {
  value: PersonaDamnificada[]
  onChange: (value: PersonaDamnificada[]) => void
  disabled?: boolean
}

const PersonasDamnificadasTable = ({ value, onChange, disabled }: Props) => {
  const cambiarFila = (index: number, campo: keyof PersonaDamnificada, valor: string) =>
    onChange(value.map((fila, i) => (i === index ? { ...fila, [campo]: valor } : fila)))

  const agregarFila = () => onChange([...value, filaInicialPersona('')])
  const eliminarFila = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <Box className="flex flex-col gap-2">
      {value.map((fila, index) => (
        <Box key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-center">
          <TextField
            label="Rol"
            size="small"
            value={fila.rol ?? ''}
            onChange={(e) => cambiarFila(index, 'rol', e.target.value)}
            disabled={disabled}
          />
          <TextField
            label="Nombre y apellido"
            size="small"
            value={fila.nombreApellido ?? ''}
            onChange={(e) => cambiarFila(index, 'nombreApellido', e.target.value)}
            disabled={disabled}
          />
          <TextField
            label="DNI"
            size="small"
            value={fila.dni ?? ''}
            onChange={(e) => cambiarFila(index, 'dni', e.target.value)}
            disabled={disabled}
          />
          <TextField
            label="Teléfono"
            size="small"
            value={fila.telefono ?? ''}
            onChange={(e) => cambiarFila(index, 'telefono', e.target.value)}
            disabled={disabled}
          />
          <Box className="flex items-center gap-1">
            <TextField
              label="Domicilio"
              size="small"
              value={fila.domicilio ?? ''}
              onChange={(e) => cambiarFila(index, 'domicilio', e.target.value)}
              disabled={disabled}
              fullWidth
            />
            {!disabled && (
              <Tooltip title="Quitar fila">
                <IconButton size="small" color="error" onClick={() => eliminarFila(index)} disabled={value.length <= 1}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ))}
      {!disabled && (
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={agregarFila} className="self-start!">
          Agregar fila
        </Button>
      )}
    </Box>
  )
}

export default PersonasDamnificadasTable
