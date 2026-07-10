import type { AccionEquipo, Equipo, EquipoEstado, EquipoUnidad } from './types'

// Unidad sobre la que opera una acción, si la acción es de unidad.
export const unidadDeAccion = (accion: AccionEquipo | null): EquipoUnidad | undefined =>
  accion && 'unidad' in accion ? accion.unidad : undefined

export interface FiltrosEquipos {
  busqueda: string
  categoriaId: number | ''
  estado: EquipoEstado | ''
  ubicacionId: number | ''
  vencimiento: '' | 'POR_VENCER' | 'VENCIDO'
}

export const FILTROS_VACIOS: FiltrosEquipos = {
  busqueda: '',
  categoriaId: '',
  estado: '',
  ubicacionId: '',
  vencimiento: '',
}

export const cantidadFiltrosActivos = (filtros: FiltrosEquipos): number =>
  [filtros.categoriaId, filtros.estado, filtros.ubicacionId, filtros.vencimiento].filter(
    (v) => v !== ''
  ).length

// Todos los filtros se combinan (AND). Para equipos POR_UNIDAD, estado y
// ubicación matchean si ALGUNA unidad cumple (así "En reparación" muestra
// el casco que tiene una unidad en el taller).
export const filtrarEquipos = (equipos: Equipo[], filtros: FiltrosEquipos): Equipo[] => {
  const texto = filtros.busqueda.trim().toLowerCase()

  return equipos.filter((equipo) => {
    if (texto) {
      const campos = [equipo.nombre, equipo.codigoInterno, equipo.marca, equipo.modelo]
      if (!campos.some((c) => c?.toLowerCase().includes(texto))) return false
    }

    if (filtros.categoriaId !== '' && equipo.categoriaId !== filtros.categoriaId) return false

    if (filtros.estado !== '') {
      if ((equipo.cantidadPorEstado[filtros.estado] ?? 0) <= 0) return false
    }

    if (filtros.ubicacionId !== '') {
      const coincide =
        equipo.seguimiento === 'POR_UNIDAD'
          ? equipo.unidades.some((u) => u.ubicacionId === filtros.ubicacionId)
          : equipo.stock.some((l) => l.ubicacionId === filtros.ubicacionId)
      if (!coincide) return false
    }

    if (filtros.vencimiento !== '' && equipo.estadoVencimiento !== filtros.vencimiento) return false

    return true
  })
}

// Ubicaciones únicas donde hay stock o unidades de un equipo.
export const ubicacionesDeEquipo = (equipo: Equipo): string[] => {
  const nombres =
    equipo.seguimiento === 'POR_UNIDAD'
      ? equipo.unidades.map((u) => u.ubicacionNombre)
      : equipo.stock.map((l) => l.ubicacionNombre)
  return [...new Set(nombres.filter((n): n is string => Boolean(n)))]
}
