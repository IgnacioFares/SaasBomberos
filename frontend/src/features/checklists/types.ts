export interface ChecklistItemDef {
  id?: number
  nombre: string
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
  secciones: ChecklistSeccionDef[]
}

export interface ChecklistTemplateRequest {
  nombre: string
  movilidadId: number | ''
  secciones: { nombre: string; items: { nombre: string }[] }[]
}

export interface ResultadoRequest {
  itemId: number
  ok: boolean
  observacion?: string
}

export interface ChecklistRegistroRequest {
  templateId: number
  observacionGeneral?: string
  resultados: ResultadoRequest[]
}

export interface ResultadoResponse {
  itemId: number
  itemNombre: string
  seccionNombre: string
  ok: boolean
  observacion?: string
}

export interface ChecklistRegistro {
  id: number
  templateId: number
  templateNombre: string
  movilidadNombre: string
  realizadoPorNombre: string
  fecha: string
  observacionGeneral?: string
  resultados: ResultadoResponse[]
}
