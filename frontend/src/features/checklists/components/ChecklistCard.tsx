import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import type { ChecklistTemplate } from '../types'

interface Props {
  template: ChecklistTemplate
  onEliminar: (id: number) => void
}

const ChecklistCard = ({ template, onEliminar }: Props) => (
  <Paper
    elevation={0}
    className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 transition-shadow hover:shadow-md sm:p-5"
  >
    <Box className="flex items-start justify-between gap-2">
      <Box className="flex min-w-0 items-center gap-3">
        <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF4FF]">
          <ChecklistRoundedIcon sx={{ color: '#1E3A8A' }} />
        </Box>
        <Box className="min-w-0">
          <Typography variant="subtitle1" className="truncate font-semibold! leading-tight!">
            {template.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Creado por {template.creadoPorNombre}
          </Typography>
        </Box>
      </Box>
      <Box className="flex shrink-0 items-center">
        <Tooltip title="Editar">
          <IconButton
            component={RouterLink}
            to={`/checklists/${template.id}/editar`}
            size="small"
            color="primary"
            aria-label={`Editar ${template.nombre}`}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            color="error"
            onClick={() => onEliminar(template.id)}
            aria-label={`Eliminar ${template.nombre}`}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

    <Box className="flex flex-wrap items-center gap-2">
      <Chip
        icon={<DirectionsCarFilledRoundedIcon sx={{ color: '#0D9488!important' }} />}
        label={template.movilidadNombre}
        size="small"
        sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
      />
      <Chip
        label={`${template.secciones.length} secciones · ${template.totalItems} ítems`}
        size="small"
        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }}
      />
    </Box>

    <Button
      component={RouterLink}
      to={`/checklists/${template.id}/realizar`}
      variant="contained"
      color="primary"
      startIcon={<PlayArrowRoundedIcon />}
      className="mt-1! self-start!"
    >
      Realizar checklist
    </Button>
  </Paper>
)

export default ChecklistCard
