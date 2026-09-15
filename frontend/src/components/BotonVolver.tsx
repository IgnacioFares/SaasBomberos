import { Box, IconButton, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate } from 'react-router-dom'

interface BotonVolverProps {
  // Destino explícito. Si no se pasa, vuelve un paso en el historial del navegador.
  to?: string
  // Texto opcional al lado de la flecha (breadcrumb tipo "Inventario / Mangueras").
  texto?: string
}

// Flecha para volver un paso atrás. Se usa en toda página a la que se
// "entra" desde un listado (detalle, alta, edición): sin esto, la única
// forma de volver era el botón atrás del navegador.
const BotonVolver = ({ to, texto }: BotonVolverProps) => {
  const navigate = useNavigate()
  const volver = () => (to ? navigate(to) : navigate(-1))

  return (
    <Box className="flex items-center gap-2">
      <IconButton onClick={volver} aria-label="Volver" size="small">
        <ArrowBackRoundedIcon />
      </IconButton>
      {texto && (
        <Typography variant="body2" color="text.secondary">
          {texto}
        </Typography>
      )}
    </Box>
  )
}

export default BotonVolver
