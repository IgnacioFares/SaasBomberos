import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material'
import useChecklistTemplates from '../hooks/useChecklistTemplates'
import ChecklistTemplateBuilder from '../components/ChecklistTemplateBuilder'
import { getTemplate } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'
import type { ChecklistTemplate, ChecklistTemplateRequest } from '../types'

const EditarChecklistPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { editar, loading, error } = useChecklistTemplates()

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getTemplate(Number(id))
      .then(setTemplate)
      .catch((err) => setErrorCarga(extraerMensajeError(err, 'No se pudo cargar el checklist')))
      .finally(() => setCargando(false))
  }, [id])

  const handleGuardar = async (data: ChecklistTemplateRequest) => {
    if (!template) return false
    const ok = await editar(template.id, data)
    if (ok) {
      navigate('/checklists', {
        replace: true,
        state: { mensaje: `Checklist "${data.nombre}" actualizado correctamente.` },
      })
    }
    return ok
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
        {errorCarga ?? 'Checklist no encontrado'}
      </Alert>
    )
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Editar checklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los cambios no afectan a los checklists ya realizados: el historial guarda una copia de
          cada control.
        </Typography>
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-6">
        <ChecklistTemplateBuilder
          onGuardar={handleGuardar}
          loading={loading}
          error={error}
          inicial={template}
          textoBoton="Guardar cambios"
        />
      </Paper>
    </Box>
  )
}

export default EditarChecklistPage
