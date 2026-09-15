import { Box, Paper, Typography } from '@mui/material'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useNavigate } from 'react-router-dom'
import BotonVolver from '../../../components/BotonVolver'
import { TIPOS_PARTE } from '../constants'

const SeleccionarTipoPartePage = () => {
  const navigate = useNavigate()

  return (
    <Box className="flex flex-col gap-5">
      <BotonVolver to="/partes" texto="Partes de intervención" />
      <Box>
        <Typography variant="h5" className="font-bold!">Nuevo parte de intervención</Typography>
        <Typography variant="body2" color="text.secondary">
          Elegí el tipo de parte que corresponde. El formulario cambia según el tipo elegido.
        </Typography>
      </Box>

      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TIPOS_PARTE.map(({ tipo, titulo, codigoFormulario }, index) => (
          <Paper
            key={tipo}
            elevation={0}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl! border border-slate-200 px-4 py-3.5 transition-shadow hover:shadow-md"
            onClick={() => navigate(`/partes/nuevo/${tipo}`)}
          >
            <Box className="flex items-center gap-3">
              <Box
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                sx={{ bgcolor: '#FFE4E6', color: '#9F1239' }}
              >
                {index + 1}
              </Box>
              <Box>
                <Typography variant="body1" className="font-semibold!">{titulo}</Typography>
                <Typography variant="caption" color="text.secondary">{codigoFormulario}</Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: '#94A3B8' }} />
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default SeleccionarTipoPartePage
