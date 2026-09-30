import type { Despacho } from './types'

// Filtro de período del registro de kilometraje. "TODOS" en mes o día
// significa "todo el año" / "todo el mes", que es como se piden los
// resúmenes para rendir cuentas (por ejemplo, todo enero).
export const TODOS = -1

export interface Periodo {
  anio: number
  // 0-11 como en Date, o TODOS.
  mes: number
  dia: number
}

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const periodoDelMesActual = (): Periodo => {
  const hoy = new Date()
  return { anio: hoy.getFullYear(), mes: hoy.getMonth(), dia: TODOS }
}

export const etiquetaPeriodo = (periodo: Periodo): string => {
  if (periodo.mes === TODOS) return `Año ${periodo.anio}`
  if (periodo.dia === TODOS) return `${MESES[periodo.mes]} de ${periodo.anio}`
  return `${periodo.dia} de ${MESES[periodo.mes]} de ${periodo.anio}`
}

// Años con salidas registradas, del más nuevo al más viejo. Siempre
// incluye el actual para que el filtro no arranque vacío.
export const aniosConSalidas = (despachos: Despacho[]): number[] => {
  const anios = new Set<number>([new Date().getFullYear()])
  despachos.forEach((d) => anios.add(new Date(d.iniciadoEn).getFullYear()))
  return [...anios].sort((a, b) => b - a)
}

export const diasDelMes = (anio: number, mes: number): number =>
  mes === TODOS ? 31 : new Date(anio, mes + 1, 0).getDate()

export const filtrarPorPeriodo = (despachos: Despacho[], periodo: Periodo): Despacho[] =>
  despachos.filter((despacho) => {
    const fecha = new Date(despacho.iniciadoEn)
    if (fecha.getFullYear() !== periodo.anio) return false
    if (periodo.mes !== TODOS && fecha.getMonth() !== periodo.mes) return false
    if (periodo.dia !== TODOS && fecha.getDate() !== periodo.dia) return false
    return true
  })

export interface ResumenKilometraje {
  salidas: number
  // Las que tienen el destino ubicado: son las únicas que suman km.
  salidasMedidas: number
  salidasSinUbicacion: number
  totalKm: number
  promedioKm: number
  promedioIdaKm: number
}

const redondear = (kilometros: number): number => Math.round(kilometros * 100) / 100

// Solo se cuentan las salidas finalizadas: una en curso todavía no
// volvió, así que su recorrido no está cerrado.
const medibles = (despachos: Despacho[]): Despacho[] =>
  despachos.filter((d) => d.estado === 'FINALIZADO' && d.recorridoKm != null)

export const resumirKilometraje = (despachos: Despacho[]): ResumenKilometraje => {
  const finalizadas = despachos.filter((d) => d.estado === 'FINALIZADO')
  const conDatos = medibles(despachos)
  const totalKm = conDatos.reduce((suma, d) => suma + (d.recorridoKm ?? 0), 0)
  const totalIdaKm = conDatos.reduce((suma, d) => suma + (d.idaKm ?? 0), 0)

  return {
    salidas: despachos.length,
    salidasMedidas: conDatos.length,
    salidasSinUbicacion: finalizadas.length - conDatos.length,
    totalKm: redondear(totalKm),
    promedioKm: conDatos.length > 0 ? redondear(totalKm / conDatos.length) : 0,
    promedioIdaKm: conDatos.length > 0 ? redondear(totalIdaKm / conDatos.length) : 0,
  }
}

export interface KilometrajeMovilidad {
  movilidadId: number
  nombre: string
  patente?: string | null
  salidas: number
  salidasMedidas: number
  totalKm: number
  promedioKm: number
}

// Kilómetros por movilidad en el período: es lo que se lleva a la
// rendición de cuentas, porque el combustible se carga por vehículo.
export const kilometrajePorMovilidad = (despachos: Despacho[]): KilometrajeMovilidad[] => {
  const porMovilidad = new Map<number, KilometrajeMovilidad>()

  despachos.forEach((despacho) => {
    const fila = porMovilidad.get(despacho.movilidadId) ?? {
      movilidadId: despacho.movilidadId,
      nombre: despacho.movilidadNombre,
      patente: despacho.movilidadPatente,
      salidas: 0,
      salidasMedidas: 0,
      totalKm: 0,
      promedioKm: 0,
    }
    fila.salidas += 1
    if (despacho.estado === 'FINALIZADO' && despacho.recorridoKm != null) {
      fila.salidasMedidas += 1
      fila.totalKm += despacho.recorridoKm
    }
    porMovilidad.set(despacho.movilidadId, fila)
  })

  return [...porMovilidad.values()]
    .map((fila) => ({
      ...fila,
      totalKm: redondear(fila.totalKm),
      promedioKm: fila.salidasMedidas > 0 ? redondear(fila.totalKm / fila.salidasMedidas) : 0,
    }))
    .sort((a, b) => b.totalKm - a.totalKm)
}
