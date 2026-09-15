import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import ShieldPersonRoundedIcon from '@mui/icons-material/ShieldRounded'
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import type { AreaTrabajo } from '../types'

interface Props {
  area: AreaTrabajo
  // Sin "gestionar_areas_trabajo" la tarjeta es solo de consulta.
  puedeGestionar: boolean
  onAbrir: (area: AreaTrabajo) => void
  onEditar: (area: AreaTrabajo) => void
  onEliminar: (area: AreaTrabajo) => void
}

const AreaTrabajoCard = ({ area, puedeGestionar, onAbrir, onEditar, onEliminar }: Props) => {
  return (
    <Paper
      elevation={0}
      className="rounded-2xl! flex flex-col gap-3 overflow-hidden border border-slate-200 transition-shadow hover:shadow-md"
    >
      <Box
        className="flex cursor-pointer items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-5"
        sx={{ background: 'linear-gradient(120deg, #FFE4E6 0%, #ECFDF9 100%)' }}
        onClick={() => onAbrir(area)}
      >
        <Box className="flex min-w-0 items-center gap-3">
          <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" sx={{ bgcolor: '#FECDD3' }}>
            <GroupsRoundedIcon sx={{ color: '#9F1239' }} />
          </Box>
          <Box className="min-w-0">
            {/* Color fijo, no el de texto del tema: la franja de fondo es
                siempre clara (gradiente rosa/verde-agua) tanto en modo
                claro como oscuro, así que el texto también debe quedar fijo. */}
            <Typography variant="h6" className="truncate font-bold! leading-tight!" sx={{ color: '#1C1917' }}>
              {area.nombre}
            </Typography>
            <Typography variant="caption" sx={{ color: '#57534E' }}>
              {area.integrantes.length} integrante{area.integrantes.length === 1 ? '' : 's'}
            </Typography>
          </Box>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: '#94A3B8' }} />
      </Box>

      <Box className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
        <Box className="flex flex-wrap items-center gap-2">
          <Chip
            icon={<ShieldPersonRoundedIcon sx={{ color: '#9F1239!important' }} />}
            label={area.encargado ? area.encargado.nombreCompleto : 'Sin encargado'}
            size="small"
            sx={{
              bgcolor: area.encargado ? '#FFE4E6' : '#F1F5F9',
              color: area.encargado ? '#9F1239' : '#64748B',
              fontWeight: 600,
            }}
          />
          {area.tareasPendientes > 0 && (
            <Chip
              icon={<AssignmentLateRoundedIcon sx={{ color: '#92400E!important' }} />}
              label={`${area.tareasPendientes} pendiente${area.tareasPendientes === 1 ? '' : 's'}`}
              size="small"
              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
            />
          )}
        </Box>

        {area.descripcion && (
          <Typography variant="body2" color="text.secondary" className="line-clamp-2">
            {area.descripcion}
          </Typography>
        )}

        <Box className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <Button size="small" onClick={() => onAbrir(area)}>
            Ver tareas
          </Button>
          {puedeGestionar && (
            <Box className="flex items-center gap-1">
              <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => onEditar(area)}>
                Editar
              </Button>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onEliminar(area)}
                  aria-label={`Eliminar ${area.nombre}`}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default AreaTrabajoCard
