import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { Vehiculo } from '../../types'
import { filaInicialVehiculo } from '../../constants'

interface Props {
  value: Vehiculo[]
  onChange: (value: Vehiculo[]) => void
  disabled?: boolean
}

const VehiculosTable = ({ value, onChange, disabled }: Props) => {
  const cambiarFila = (index: number, campo: keyof Vehiculo, valor: string) =>
    onChange(
      value.map((fila, i) =>
        i === index ? { ...fila, [campo]: campo === 'anio' ? (valor === '' ? null : Number(valor)) : valor } : fila,
      ),
    )

  const agregarFila = () => onChange([...value, filaInicialVehiculo()])
  const eliminarFila = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <Box className="flex flex-col gap-2">
      {value.map((fila, index) => (
        <Box key={index} className="grid grid-cols-2 gap-2 sm:grid-cols-8 sm:items-center">
          <TextField label="Tipo" size="small" value={fila.tipo ?? ''} onChange={(e) => cambiarFila(index, 'tipo', e.target.value)} disabled={disabled} />
          <TextField label="Marca" size="small" value={fila.marca ?? ''} onChange={(e) => cambiarFila(index, 'marca', e.target.value)} disabled={disabled} />
          <TextField label="Dominio" size="small" value={fila.dominio ?? ''} onChange={(e) => cambiarFila(index, 'dominio', e.target.value)} disabled={disabled} />
          <TextField label="Modelo" size="small" value={fila.modelo ?? ''} onChange={(e) => cambiarFila(index, 'modelo', e.target.value)} disabled={disabled} />
          <TextField label="Año" size="small" type="number" value={fila.anio ?? ''} onChange={(e) => cambiarFila(index, 'anio', e.target.value)} disabled={disabled} />
          <TextField label="Aseguradora" size="small" value={fila.aseguradora ?? ''} onChange={(e) => cambiarFila(index, 'aseguradora', e.target.value)} disabled={disabled} />
          <Box className="flex items-center gap-1 col-span-2">
            <TextField label="Póliza" size="small" value={fila.poliza ?? ''} onChange={(e) => cambiarFila(index, 'poliza', e.target.value)} disabled={disabled} fullWidth />
            {!disabled && (
              <Tooltip title="Quitar vehículo">
                <IconButton size="small" color="error" onClick={() => eliminarFila(index)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ))}
      {value.length === 0 && (
        <Typography variant="caption" color="text.secondary">Sin vehículos agregados.</Typography>
      )}
      {!disabled && (
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={agregarFila} className="self-start!">
          Agregar vehículo
        </Button>
      )}
    </Box>
  )
}

export default VehiculosTable
