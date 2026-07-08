import { useEffect, useState } from 'react'
import type { ChecklistTemplate, ChecklistTemplateRequest } from '../types'
import { getTemplates, createTemplate, deleteTemplate } from '../services/checklistService'
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

  return { templates, loading, error, agregar, eliminar }
}

export default useChecklistTemplates
