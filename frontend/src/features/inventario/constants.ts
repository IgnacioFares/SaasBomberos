import type { EquipoEstado, EstadoVencimiento, MovimientoTipo } from './types'

interface Estilo {
  label: string
  color: string
  bg: string
}

// Paleta semántica del inventario, consistente con el resto del sistema:
// verde operativo, celeste guardado, ámbar/naranja atención, rojo problema.
export const ESTILO_EQUIPO_ESTADO: Record<EquipoEstado, Estilo> = {
  EN_SERVICIO: { label: 'En servicio', color: '#166534', bg: '#DCFCE7' },
  EN_DEPOSITO: { label: 'En depósito', color: '#075985', bg: '#E0F2FE' },
  EN_MANTENIMIENTO: { label: 'En mantenimiento', color: '#92400E', bg: '#FEF3C7' },
  EN_REPARACION: { label: 'En reparación', color: '#C2410C', bg: '#FFEDD5' },
  FUERA_DE_SERVICIO: { label: 'Fuera de servicio', color: '#991B1B', bg: '#FEE2E2' },
  DADO_DE_BAJA: { label: 'Dado de baja', color: '#64748B', bg: '#F1F5F9' },
}

export const ESTILO_VENCIMIENTO: Record<EstadoVencimiento, Estilo> = {
  SIN_VENCIMIENTO: { label: 'Sin vencimiento', color: '#64748B', bg: '#F1F5F9' },
  VIGENTE: { label: 'Vigente', color: '#166534', bg: '#DCFCE7' },
  POR_VENCER: { label: 'Por vencer', color: '#92400E', bg: '#FEF3C7' },
  VENCIDO: { label: 'Vencido', color: '#991B1B', bg: '#FEE2E2' },
}

export const ETIQUETA_MOVIMIENTO: Record<MovimientoTipo, string> = {
  ALTA: 'Alta',
  ACTUALIZACION: 'Actualización',
  CAMBIO_ESTADO: 'Cambio de estado',
  CAMBIO_UBICACION: 'Cambio de ubicación',
  OBSERVACION: 'Observación',
  BAJA: 'Baja',
}

// Estados elegibles al operar (dar de baja tiene su propio flujo).
export const ESTADOS_EQUIPO: EquipoEstado[] = [
  'EN_SERVICIO',
  'EN_DEPOSITO',
  'EN_MANTENIMIENTO',
  'EN_REPARACION',
  'FUERA_DE_SERVICIO',
  'DADO_DE_BAJA',
]

export const formatearFecha = (iso?: string | null): string =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR') : '—'

export const formatearFechaHora = (iso: string): string => {
  const fecha = new Date(iso)
  return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}
