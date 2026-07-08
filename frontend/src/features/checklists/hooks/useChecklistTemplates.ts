import { useEffect, useState } from 'react'
import type { ChecklistTemplate, ChecklistTemplateRequest } from '../types'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'

const useChecklistTemplates = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const datos = await getTemplates()
      setTemplates(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar los checklists'))
    } finally {
      setLoading(false)
    }
  }

  const agregar = async (data: ChecklistTemplateRequest) => {
    setError(null)
    try {
      await createTemplate(data)
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al crear el checklist'))
      return false
    }
  }

  const editar = async (id: number, data: ChecklistTemplateRequest) => {
    setError(null)
    try {
      await updateTemplate(id, data)
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al actualizar el checklist'))
      return false
    }
  }

  const eliminar = async (id: number) => {
    setError(null)
    try {
      await deleteTemplate(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al eliminar el checklist'))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return { templates, loading, error, agregar, editar, eliminar }
}

export default useChecklistTemplates
