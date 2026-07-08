import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material'
import useMovilidades from '../hooks/useMovilidades'
import MovilidadForm from '../components/MovilidadForm'
import MovilidadTable from '../components/MovilidadTable'

const MovilidadesPage = () => {
  const { movilidades, loading, error, agregar, eliminar } = useMovilidades()

  return (
    <Box className="flex flex-col gap-6">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Movilidades
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Alta y control de la flota del cuartel: estado operativo y kilometraje.
        </Typography>
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-6">
        <MovilidadForm onGuardar={agregar} loading={loading} error={error} />
      </Paper>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-6">
        <Typography variant="subtitle1" className="mb-3! font-semibold!">
          Flota registrada
        </Typography>

        {loading && movilidades.length === 0 ? (
          <Box className="flex justify-center py-10">
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {error && movilidades.length === 0 && (
              <Alert severity="error" variant="outlined" className="mb-4!">
                {error}
              </Alert>
            )}
            <MovilidadTable movilidades={movilidades} onEliminar={eliminar} />
          </>
        )}
      </Paper>
    </Box>
  )
}

export default MovilidadesPage
