import type { Equipo, EquipoEstado } from './types'

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
      const coincide =
        equipo.seguimiento === 'POR_UNIDAD'
          ? (equipo.unidadesPorEstado?.[filtros.estado] ?? 0) > 0
          : equipo.estado === filtros.estado
      if (!coincide) return false
    }

    if (filtros.ubicacionId !== '') {
      const coincide =
        equipo.seguimiento === 'POR_UNIDAD'
          ? equipo.unidades.some((u) => u.ubicacionId === filtros.ubicacionId)
          : equipo.ubicacionId === filtros.ubicacionId
      if (!coincide) return false
    }

    if (filtros.vencimiento !== '' && equipo.estadoVencimiento !== filtros.vencimiento) return false

    return true
  })
}

// Resumen "3 en servicio · 1 en reparación" para equipos POR_UNIDAD.
export const resumenUnidades = (
  equipo: Equipo,
  etiquetas: Record<EquipoEstado, { label: string }>
): string =>
  Object.entries(equipo.unidadesPorEstado ?? {})
    .map(([estado, cantidad]) => `${cantidad} ${etiquetas[estado as EquipoEstado].label.toLowerCase()}`)
    .join(' · ')
