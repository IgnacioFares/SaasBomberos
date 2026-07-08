import { useNavigate } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import useChecklistTemplates from '../hooks/useChecklistTemplates'
import ChecklistTemplateBuilder from '../components/ChecklistTemplateBuilder'
import type { ChecklistTemplateRequest } from '../types'

const NuevoChecklistPage = () => {
  const { agregar, loading, error } = useChecklistTemplates()
  const navigate = useNavigate()

  const handleGuardar = async (data: ChecklistTemplateRequest) => {
    const ok = await agregar(data)
    if (ok) {
      navigate('/checklists', {
        replace: true,
        state: { mensaje: `Checklist "${data.nombre}" creado correctamente.` },
      })
    }
    return ok
  }

  return (
    <Box className="flex flex-col gap-6">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Nuevo checklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Definí las secciones e ítems que van a controlarse en esta movilidad, con cantidades
          esperadas para los elementos que se cuentan.
        </Typography>
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-6">
        <ChecklistTemplateBuilder onGuardar={handleGuardar} loading={loading} error={error} />
      </Paper>
    </Box>
  )
}

export default NuevoChecklistPage
