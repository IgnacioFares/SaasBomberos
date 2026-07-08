import type { ChecklistItemEstado, ChecklistRegistroEstado, RespuestaItem } from './types'

export const respuestaVacia = (): RespuestaItem => ({
  marcado: null,
  cantidad: null,
  observacion: '',
})

interface EstiloEstado {
  label: string
  color: string
  bg: string
}

// Paleta semántica del módulo: verde correcto, ámbar faltante, celeste
// sobrante, rojo novedad, gris sin controlar.
export const ESTILO_ITEM_ESTADO: Record<ChecklistItemEstado, EstiloEstado> = {
  CORRECTO: { label: 'Correcto', color: '#166534', bg: '#DCFCE7' },
  FALTANTE: { label: 'Faltante', color: '#92400E', bg: '#FEF3C7' },
  SOBRANTE: { label: 'Sobrante', color: '#075985', bg: '#E0F2FE' },
  NOVEDAD: { label: 'Novedad', color: '#991B1B', bg: '#FEE2E2' },
  NO_CONTROLADO: { label: 'Sin controlar', color: '#64748B', bg: '#F1F5F9' },
}

export const ESTILO_REGISTRO_ESTADO: Record<ChecklistRegistroEstado, EstiloEstado> = {
  PENDIENTE_FIRMA: { label: 'Pendiente de firma', color: '#92400E', bg: '#FEF3C7' },
  FIRMADO: { label: 'Firmado', color: '#166534', bg: '#DCFCE7' },
}

export const formatearDuracion = (segundos?: number | null): string | null => {
  if (segundos == null || segundos < 0) return null
  if (segundos < 60) return `${segundos} s`
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) {
    const resto = segundos % 60
    return resto > 0 ? `${minutos} min ${resto} s` : `${minutos} min`
  }
  const horas = Math.floor(minutos / 60)
  return `${horas} h ${minutos % 60} min`
}

export const formatearFechaHora = (iso: string): string => {
  const fecha = new Date(iso)
  return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}
