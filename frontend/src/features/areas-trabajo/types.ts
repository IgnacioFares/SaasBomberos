export interface BomberoResumen {
  id: number
  nombreCompleto: string
}

export interface AreaTrabajo {
  id: number
  nombre: string
  descripcion?: string
  encargado: BomberoResumen | null
  integrantes: BomberoResumen[]
  activo: boolean
  creadoEn: string
  tareasPendientes: number
}

export interface AreaTrabajoRequest {
  nombre: string
  descripcion?: string
  encargadoId: number | null
  integrantesIds: number[]
}

export type TareaAreaEstado = 'PENDIENTE' | 'REALIZADA'

export interface TareaArea {
  id: number
  areaId: number
  areaNombre: string
  titulo: string
  descripcion?: string
  asignados: BomberoResumen[]
  fechaLimite: string
  fechaCreacion: string
  creadaPorNombre: string
  estado: TareaAreaEstado
  completadaPorNombre?: string | null
  completadaEn?: string | null
}

export interface TareaAreaRequest {
  titulo: string
  descripcion?: string
  asignadosIds: number[]
  fechaLimite: string
}
