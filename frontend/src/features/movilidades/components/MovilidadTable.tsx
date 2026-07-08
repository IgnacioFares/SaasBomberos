import {
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import type { Movilidad } from '../../../types'

interface Props {
  movilidades: Movilidad[]
  onEliminar: (id: number) => void
}

const MovilidadTable = ({ movilidades, onEliminar }: Props) => {
  if (movilidades.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <DirectionsCarFilledRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
        <Typography variant="body2" color="text.secondary">
          Todavía no hay movilidades cargadas.
        </Typography>
      </div>
    )
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Patente</TableCell>
            <TableCell>Marca / Modelo</TableCell>
            <TableCell align="right">Kilometraje</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movilidades.map((movilidad) => (
            <TableRow key={movilidad.id} hover>
              <TableCell className="font-medium!">{movilidad.nombre}</TableCell>
              <TableCell>{movilidad.patente || '—'}</TableCell>
              <TableCell>
                {[movilidad.marca, movilidad.modelo].filter(Boolean).join(' ') || '—'}
              </TableCell>
              <TableCell align="right">{movilidad.kilometraje.toLocaleString('es-AR')} km</TableCell>
              <TableCell>
                <Chip
                  label={movilidad.enServicio ? 'En servicio' : 'Fuera de servicio'}
                  size="small"
                  sx={{
                    bgcolor: movilidad.enServicio ? '#DCFCE7' : '#FEE2E2',
                    color: movilidad.enServicio ? '#15803D' : '#B91C1C',
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => movilidad.id && onEliminar(movilidad.id)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default MovilidadTable
