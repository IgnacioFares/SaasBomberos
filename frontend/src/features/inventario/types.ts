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

// Línea de stock de un equipo POR_CANTIDAD: cuántos hay en una
// ubicación y estado dados. El total es la suma de las líneas.
export interface EquipoStockLinea {
  id: number
  ubicacionId?: number | null
  ubicacionNombre?: string | null
  estado: EquipoEstado
  cantidad: number
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
  // Conteo por estado en ambos modos (stock o unidades).
  cantidadPorEstado: Partial<Record<EquipoEstado, number>>
  stock: EquipoStockLinea[]
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

export interface MoverStockRequest {
  stockId: number
  cantidad: number
  ubicacionDestinoId?: number | null
  estadoDestino?: EquipoEstado
  nota?: string
}

export interface AjustarStockRequest {
  stockId?: number
  ubicacionId?: number | null
  estado?: EquipoEstado
  cantidad: number
  nota?: string
}

export interface AgregarUnidadesRequest {
  cantidad: number
  estado?: EquipoEstado
  ubicacionId?: number | null
  nota?: string
}

// Acción en curso sobre un equipo, una unidad puntual o una línea de
// stock; discrimina qué dialog se muestra en el detalle.
export type AccionEquipo =
  | { tipo: 'estado'; unidad?: EquipoUnidad }
  | { tipo: 'ubicacion'; unidad?: EquipoUnidad }
  | { tipo: 'observacion'; unidad?: EquipoUnidad }
  | { tipo: 'editar-unidad'; unidad: EquipoUnidad }
  | { tipo: 'mover-stock'; linea: EquipoStockLinea }
  | { tipo: 'ajustar-stock'; linea?: EquipoStockLinea }
  | { tipo: 'agregar-unidades' }

export interface EquipoMovimiento {
  id: number
  tipo: MovimientoTipo
  detalle: string
  unidadNumero?: number | null
  realizadoPorNombre: string
  fecha: string
}
