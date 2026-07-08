import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import useChecklistTemplates from '../hooks/useChecklistTemplates'
import ChecklistCard from '../components/ChecklistCard'
import { useAuthContext } from '../../auth/hooks/useAuthContext'

const ChecklistsPage = () => {
  const { usuario } = useAuthContext()
  const { templates, loading, error, eliminar } = useChecklistTemplates()
  const location = useLocation()
  const mensajeExito = (location.state as { mensaje?: string } | null)?.mensaje
  const esAdmin = usuario?.rol === 'Administrador'

  return (
    <Box className="flex flex-col gap-6">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Checklists
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Controles de equipamiento por movilidad.
          </Typography>
        </Box>
        {esAdmin && (
          <Button
            component={RouterLink}
            to="/checklists/nuevo"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
          >
            Nuevo checklist
          </Button>
        )}
      </Box>

      {mensajeExito && (
        <Alert severity="success" variant="outlined">
          {mensajeExito}
        </Alert>
      )}

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <ChecklistRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">
            {esAdmin
              ? 'Todavía no creaste ningún checklist. Empezá con el botón de arriba.'
              : 'Todavía no hay checklists cargados por un administrador.'}
          </Typography>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <ChecklistCard
              key={template.id}
              template={template}
              esAdmin={esAdmin}
              onEliminar={eliminar}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ChecklistsPage
