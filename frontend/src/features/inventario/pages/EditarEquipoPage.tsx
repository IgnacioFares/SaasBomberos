import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material'
import BotonVolver from '../../../components/BotonVolver'
import EquipoForm from '../components/EquipoForm'
import { getEquipo, updateEquipo } from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'
import type { Equipo, EquipoRequest } from '../types'

const EditarEquipoPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getEquipo(Number(id))
      .then(setEquipo)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar el equipo')))
      .finally(() => setCargando(false))
  }, [id])

  const handleGuardar = async (data: EquipoRequest) => {
    if (!equipo) return false
    setGuardando(true)
    setError(null)
    try {
      await updateEquipo(equipo.id, data)
      navigate(`/inventario/${equipo.id}`, {
        replace: true,
        state: { mensaje: 'Cambios guardados correctamente.' },
      })
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudieron guardar los cambios'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!equipo) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Equipo no encontrado'}
      </Alert>
    )
  }

  return (
    <Box className="flex flex-col gap-6">
      <BotonVolver to={`/inventario/${equipo.id}`} texto={equipo.nombre} />
      <Box>
        <Typography variant="h5" className="font-bold!">
          Editar equipo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los cambios de estado y ubicación también quedan registrados en el historial.
        </Typography>
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-6">
        <EquipoForm
          onGuardar={handleGuardar}
          loading={guardando}
          error={error}
          inicial={equipo}
          textoBoton="Guardar cambios"
        />
      </Paper>
    </Box>
  )
}

export default EditarEquipoPage
