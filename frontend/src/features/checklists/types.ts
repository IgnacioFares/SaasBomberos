export type ChecklistRegistroEstado = 'PENDIENTE_FIRMA' | 'FIRMADO'

export type ChecklistItemEstado =
  | 'CORRECTO'
  | 'FALTANTE'
  | 'SOBRANTE'
  | 'NOVEDAD'
  | 'NO_CONTROLADO'

export interface ChecklistItemDef {
  id?: number
  nombre: string
  descripcion?: string | null
  requiereCantidad: boolean
  cantidadEsperada?: number | null
  obligatorio: boolean
  orden?: number
}

export interface ChecklistSeccionDef {
  id?: number
  nombre: string
  orden?: number
  items: ChecklistItemDef[]
}

export interface ChecklistTemplate {
  id: number
  nombre: string
  movilidadId: number
  movilidadNombre: string
  creadoPorNombre: string
  createdAt: string
  totalItems: number
  secciones: ChecklistSeccionDef[]
}

export interface ChecklistItemRequest {
  nombre: string
  descripcion?: string
  requiereCantidad: boolean
  cantidadEsperada?: number | null
  obligatorio: boolean
}

export interface ChecklistTemplateRequest {
  nombre: string
  movilidadId: number | ''
  secciones: { nombre: string; items: ChecklistItemRequest[] }[]
}

export interface ResultadoRequest {
  itemId: number
  ok?: boolean
  cantidadEncontrada?: number
  observacion?: string
}

export interface ChecklistRegistroRequest {
  templateId: number
  observacionGeneral?: string
  duracionSegundos?: number
  participantesIds?: number[]
  resultados: ResultadoRequest[]
}

export interface Participante {
  id: number
  nombre: string
}

// Conteos que calcula el backend para mostrar el estado general de un
// registro sin recorrer sus resultados.
export interface ResumenRegistro {
  correctos: number
  faltantes: number
  sobrantes: number
  novedades: number
  noControlados: number
  conObservacion: number
}

export interface ResultadoResponse {
  itemId: number | null
  itemNombre: string
  seccionNombre: string
  cantidadEsperada?: number | null
  cantidadEncontrada?: number | null
  estado: ChecklistItemEstado
  observacion?: string | null
}

export interface ChecklistRegistro {
  id: number
  templateId: number
  templateNombre: string
  movilidadNombre: string
  realizadoPorNombre: string
  participantes: Participante[]
  estado: ChecklistRegistroEstado
  fecha: string
  duracionSegundos?: number | null
  observacionGeneral?: string | null
  firmadoPorNombre?: string | null
  firmadoEn?: string | null
  resumen: ResumenRegistro
  resultados: ResultadoResponse[]
}

// Respuesta en edición para un ítem durante la realización del checklist.
export interface RespuestaItem {
  marcado: 'ok' | 'novedad' | null
  cantidad: number | null
  observacion: string
}

export interface RegistroFiltros {
  estado?: ChecklistRegistroEstado
  movilidadId?: number
}
