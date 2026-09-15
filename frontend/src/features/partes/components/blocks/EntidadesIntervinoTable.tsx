import { Box, Button, Checkbox, FormControlLabel, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { EntidadIntervino } from '../../types'
import { filaInicialEntidad } from '../../constants'

interface Props {
  value: EntidadIntervino[]
  onChange: (value: EntidadIntervino[]) => void
  disabled?: boolean
}

// Primera fila especial: "¿Se constató?" en vez de nombre de entidad.
// Las siguientes son filas libres agregables.
const EntidadesIntervinoTable = ({ value, onChange, disabled }: Props) => {
  const cambiarFila = (index: number, cambios: Partial<EntidadIntervino>) =>
    onChange(value.map((fila, i) => (i === index ? { ...fila, ...cambios } : fila)))

  const agregarFila = () => onChange([...value, filaInicialEntidad()])
  const eliminarFila = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <Box className="flex flex-col gap-2">
      {value.map((fila, index) =>
        fila.filaPrincipal ? (
          <Box key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!fila.seConstato}
                  disabled={disabled}
                  onChange={(e) => cambiarFila(index, { seConstato: e.target.checked })}
                />
              }
              label="¿Se constató?"
            />
            <TextField label="Móvil N°" size="small" value={fila.movilNro ?? ''} onChange={(e) => cambiarFila(index, { movilNro: e.target.value })} disabled={disabled} />
            <TextField label="A cargo" size="small" value={fila.aCargo ?? ''} onChange={(e) => cambiarFila(index, { aCargo: e.target.value })} disabled={disabled} className="sm:col-span-2" />
          </Box>
        ) : (
          <Box key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
            <TextField label="Entidad" size="small" value={fila.entidad ?? ''} onChange={(e) => cambiarFila(index, { entidad: e.target.value })} disabled={disabled} />
            <TextField label="Móvil N°" size="small" value={fila.movilNro ?? ''} onChange={(e) => cambiarFila(index, { movilNro: e.target.value })} disabled={disabled} />
            <Box className="flex items-center gap-1 sm:col-span-2">
              <TextField label="A cargo" size="small" value={fila.aCargo ?? ''} onChange={(e) => cambiarFila(index, { aCargo: e.target.value })} disabled={disabled} fullWidth />
              {!disabled && (
                <Tooltip title="Quitar fila">
                  <IconButton size="small" color="error" onClick={() => eliminarFila(index)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        ),
      )}
      {value.length === 0 && (
        <Typography variant="caption" color="text.secondary">Sin filas.</Typography>
      )}
      {!disabled && (
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={agregarFila} className="self-start!">
          Agregar entidad
        </Button>
      )}
    </Box>
  )
}

export default EntidadesIntervinoTable
