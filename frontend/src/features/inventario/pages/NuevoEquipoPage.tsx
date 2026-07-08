import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import EquipoForm from '../components/EquipoForm'
import { createEquipo } from '../services/inventarioService'
import { extraerMensajeError } from '../../../utils/http'
import type { EquipoRequest } from '../types'

const NuevoEquipoPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGuardar = async (data: EquipoRequest) => {
    setLoading(true)
    setError(null)
    try {
      const equipo = await createEquipo(data)
      navigate(`/inventario/${equipo.id}`, {
        replace: true,
        state: { mensaje: `"${equipo.nombre}" registrado en el inventario.` },
      })
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo registrar el equipo'))
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Nuevo equipo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registrá equipamiento en el inventario del cuartel.
        </Typography>
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-6">
        <EquipoForm onGuardar={handleGuardar} loading={loading} error={error} />
      </Paper>
    </Box>
  )
}

export default NuevoEquipoPage
