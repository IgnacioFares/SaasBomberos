export type EquipoEstado =
  | 'EN_SERVICIO'
  | 'EN_DEPOSITO'
  | 'EN_MANTENIMIENTO'
  | 'EN_REPARACION'
  | 'FUERA_DE_SERVICIO'
  | 'DADO_DE_BAJA'

export type EquipoSeguimiento = 'POR_CANTIDAD' | 'POR_UNIDAD'

export type EstadoVencimiento = 'SIN_VENCIMIENTO' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDO'

export type MovimientoTipo =
  | 'ALTA'
  | 'ACTUALIZACION'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_UBICACION'
  | 'OBSERVACION'
  | 'BAJA'

export interface CategoriaEquipo {
  id: number
  nombre: string
  padreId: number | null
}

export interface UbicacionEquipo {
  id: number
  nombre: string
}

export interface EquipoUnidad {
  id: number
  numero: number
  numeroSerie?: string | null
  estado: EquipoEstado
  ubicacionId?: number | null
  ubicacionNombre?: string | null
  fechaVencimiento?: string | null
  estadoVencimiento: EstadoVencimiento
  observacion?: string | null
}

export interface Equipo {
  id: number
  nombre: string
  codigoInterno?: string | null
  categoriaId: number
  categoriaNombre: string
  subcategoriaId?: number | null
  subcategoriaNombre?: string | null
  descripcion?: string | null
  marca?: string | null
  modelo?: string | null
  numeroSerie?: string | null
  seguimiento: EquipoSeguimiento
  cantidad: number | null
  unidadMedida?: string | null
  estado: EquipoEstado
  ubicacionId?: number | null
  ubicacionNombre?: string | null
  fechaCompra?: string | null
  fechaVencimiento?: string | null
  estadoVencimiento: EstadoVencimiento
  observaciones?: string | null
  unidadesPorEstado?: Partial<Record<EquipoEstado, number>> | null
  unidades: EquipoUnidad[]
  createdAt: string
}

export interface EquipoRequest {
  nombre: string
  codigoInterno?: string
  categoriaId: number
  subcategoriaId?: number | null
  descripcion?: string
  marca?: string
  modelo?: string
  numeroSerie?: string
  seguimiento: EquipoSeguimiento
  cantidad?: number
  cantidadUnidades?: number
  unidadMedida?: string
  estado?: EquipoEstado
  ubicacionId?: number | null
  fechaCompra?: string | null
  fechaVencimiento?: string | null
  observaciones?: string
}

export interface CambioEstadoRequest {
  estado: EquipoEstado
  unidadId?: number
  nota?: string
}

export interface CambioUbicacionRequest {
  ubicacionId: number
  unidadId?: number
  nota?: string
}

export interface ObservacionRequest {
  observacion: string
  unidadId?: number
}

export interface UnidadUpdateRequest {
  numeroSerie?: string | null
  fechaVencimiento?: string | null
}

export interface EquipoMovimiento {
  id: number
  tipo: MovimientoTipo
  detalle: string
  unidadNumero?: number | null
  realizadoPorNombre: string
  fecha: string
}
