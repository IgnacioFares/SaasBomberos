import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import { getTemplate, createRegistro } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'
import type { ChecklistTemplate, ResultadoRequest } from '../types'

type ResultadosPorItem = Record<number, { ok: boolean; observacion: string }>

const RealizarChecklistPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [resultados, setResultados] = useState<ResultadosPorItem>({})
  const [observacionGeneral, setObservacionGeneral] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getTemplate(Number(id))
      .then((t) => {
        setTemplate(t)
        const inicial: ResultadosPorItem = {}
        t.secciones.forEach((s) => s.items.forEach((it) => {
          if (it.id) inicial[it.id] = { ok: true, observacion: '' }
        }))
        setResultados(inicial)
      })
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar el checklist')))
      .finally(() => setCargando(false))
  }, [id])

  const marcarOk = (itemId: number, ok: boolean) => {
    setResultados((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ok } }))
  }

  const cambiarObservacion = (itemId: number, observacion: string) => {
    setResultados((prev) => ({ ...prev, [itemId]: { ...prev[itemId], observacion } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return
    setGuardando(true)
    setError(null)

    const payload: ResultadoRequest[] = Object.entries(resultados).map(([itemId, r]) => ({
      itemId: Number(itemId),
      ok: r.ok,
      observacion: r.observacion || undefined,
    }))

    try {
      await createRegistro({
        templateId: template.id,
        observacionGeneral: observacionGeneral || undefined,
        resultados: payload,
      })
      navigate('/checklists', {
        replace: true,
        state: { mensaje: `Checklist "${template.nombre}" registrado correctamente.` },
      })
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar el checklist'))
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

  if (!template) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Checklist no encontrado'}
      </Alert>
    )
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box>
        <Typography variant="h5" className="font-bold!">
          {template.nombre}
        </Typography>
        <Chip
          icon={<DirectionsCarFilledRoundedIcon sx={{ color: '#0D9488!important' }} />}
          label={template.movilidadNombre}
          size="small"
          className="mt-2!"
          sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
        />
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {template.secciones.map((seccion) => (
          <Paper key={seccion.id} elevation={0} className="rounded-2xl! border border-slate-200 p-6">
            <Typography variant="subtitle1" className="mb-3! font-semibold!">
              {seccion.nombre}
            </Typography>
            <Divider className="mb-3!" />
            <Box className="flex flex-col gap-3">
              {seccion.items.map((item) => {
                const resultado = item.id ? resultados[item.id] : undefined
                return (
                  <Box key={item.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <FormControlLabel
                      className="min-w-[240px]!"
                      control={
                        <Checkbox
                          checked={resultado?.ok ?? true}
                          onChange={(e) => item.id && marcarOk(item.id, e.target.checked)}
                          color="success"
                        />
                      }
                      label={item.nombre}
                    />
                    <TextField
                      placeholder="Observación (opcional)"
                      size="small"
                      fullWidth
                      value={resultado?.observacion ?? ''}
                      onChange={(e) => item.id && cambiarObservacion(item.id, e.target.value)}
                    />
                  </Box>
                )
              })}
            </Box>
          </Paper>
        ))}

        <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-6">
          <TextField
            label="Observación general"
            placeholder="Notas adicionales sobre este control..."
            multiline
            minRows={2}
            fullWidth
            value={observacionGeneral}
            onChange={(e) => setObservacionGeneral(e.target.value)}
          />
        </Paper>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveRoundedIcon />}
          disabled={guardando}
          className="self-start!"
        >
          {guardando ? 'Guardando...' : 'Guardar checklist'}
        </Button>
      </Box>
    </Box>
  )
}

export default RealizarChecklistPage
