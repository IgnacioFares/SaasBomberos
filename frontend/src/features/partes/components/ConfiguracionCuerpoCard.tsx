import { useEffect, useState } from 'react'
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { actualizarConfiguracion, getConfiguracion, type ConfiguracionCuerpo } from '../services/configuracionService'
import { extraerMensajeError } from '../../../utils/http'

// Datos institucionales que van en el pie de los partes de intervención
// (Aprobó, departamento que elabora, etc.) — se editan acá en vez de
// estar hardcodeados en el código o en la plantilla del PDF.
const ConfiguracionCuerpoCard = () => {
  const [config, setConfig] = useState<ConfiguracionCuerpo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    getConfiguracion()
      .then(setConfig)
      .catch((err) => setError(extraerMensajeError(err, 'Error al cargar la configuración')))
  }, [])

  const guardar = async () => {
    if (!config) return
    setGuardando(true)
    setError(null)
    try {
      setConfig(await actualizarConfiguracion(config))
      setMensajeExito('Configuración actualizada.')
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al guardar la configuración'))
    } finally {
      setGuardando(false)
    }
  }

  if (!config) return null

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 sm:p-5">
      <Box>
        <Typography variant="subtitle1" className="font-semibold!">Configuración de partes de intervención</Typography>
        <Typography variant="caption" color="text.secondary">
          Estos datos aparecen en el pie de los PDF de los partes de intervención.
        </Typography>
      </Box>

      {mensajeExito && <Alert severity="success" onClose={() => setMensajeExito(null)}>{mensajeExito}</Alert>}
      {error && <Alert severity="error" variant="outlined">{error}</Alert>}

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          label="Nombre del cuerpo"
          value={config.nombreCuerpo}
          onChange={(e) => setConfig({ ...config, nombreCuerpo: e.target.value })}
          size="small"
        />
        <TextField
          label="Jefe de cuerpo (Aprobó)"
          value={config.jefeDeCuerpo}
          onChange={(e) => setConfig({ ...config, jefeDeCuerpo: e.target.value })}
          size="small"
        />
        <TextField
          label="Departamento que elabora"
          value={config.departamentoElaboracion}
          onChange={(e) => setConfig({ ...config, departamentoElaboracion: e.target.value })}
          size="small"
        />
      </Box>

      <Button
        size="small"
        variant="contained"
        startIcon={<SaveRoundedIcon />}
        className="self-start!"
        disabled={guardando}
        onClick={guardar}
      >
        Guardar
      </Button>
    </Paper>
  )
}

export default ConfiguracionCuerpoCard
