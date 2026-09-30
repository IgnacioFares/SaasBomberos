import type { Despacho, ParticipanteSeguimiento } from './types'

// Dónde se para el mapa cuando todavía no hay nada que mostrar: el
// cuartel está en Maipú, Mendoza.
export const CENTRO_POR_DEFECTO: [number, number] = [-32.9847, -68.7847]
export const ZOOM_POR_DEFECTO = 13

// Paleta para distinguir a cada persona en el mapa. El color sale del
// id del usuario, así que siempre es el mismo para la misma persona.
const COLORES = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D', '#DC2626']

export const colorDeParticipante = (usuarioId: number): string => COLORES[usuarioId % COLORES.length]

export const iniciales = (nombreCompleto: string): string =>
  nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

export const formatearFechaHora = (iso: string): string => {
  const fecha = new Date(iso)
  return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}

export const formatearHora = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

// "hace 2 min", que para seguir un móvil dice más que la hora exacta.
export const haceCuanto = (iso: string): string => {
  const segundos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (segundos < 60) return 'hace instantes'
  const minutos = Math.round(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  return formatearFechaHora(iso)
}

// Cuánto lleva abierto un despacho (o cuánto duró, si ya se cerró).
export const duracion = (desdeIso: string, hastaIso?: string | null): string => {
  const hasta = hastaIso ? new Date(hastaIso).getTime() : Date.now()
  const minutos = Math.max(0, Math.round((hasta - new Date(desdeIso).getTime()) / 60000))
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  return `${horas} h ${minutos % 60} min`
}

export const textoUltimaSenal = (participante: ParticipanteSeguimiento): string => {
  const estado = participante.enVivo
    ? `En vivo · ${haceCuanto(participante.ultimaSenal)}`
    : `Sin señal · última a las ${formatearHora(participante.ultimaSenal)}`
  // El margen de error del GPS: con ±10 m el punto es confiable, con
  // ±1000 m la persona puede estar en cualquier lado del círculo.
  return participante.precisionMetros != null
    ? `${estado} · ±${Math.round(participante.precisionMetros)} m`
    : estado
}

// Cómo se lee el recorrido de una salida. Cuando la movilidad encadenó
// con otra salida no hay tramo de vuelta que mostrar: volvió al cuartel
// recién al final de la siguiente.
export const textoRecorrido = (despacho: Despacho): string => {
  if (despacho.recorridoKm == null) return 'Recorrido sin medir (destino no ubicado en el mapa)'
  if (despacho.vueltaKm === 0) return `${despacho.idaKm} km de ida, sigue en la calle`
  return `${despacho.recorridoKm} km ida y vuelta (${despacho.idaKm} km de ida)`
}

export const velocidadKmH = (velocidad?: number | null): string | null =>
  velocidad != null && velocidad >= 0 ? `${Math.round(velocidad * 3.6)} km/h` : null
