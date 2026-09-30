export type DespachoEstado = 'EN_CURSO' | 'FINALIZADO'

export interface Despacho {
  id: number
  movilidadId: number
  movilidadNombre: string
  movilidadPatente?: string | null
  motivo: string
  destino?: string | null
  destinoLat?: number | null
  destinoLng?: number | null
  // Desde dónde salió: el cuartel, o el destino de la salida anterior
  // si la movilidad fue de un servicio a otro sin volver.
  origenNombre?: string | null
  origenLat?: number | null
  origenLng?: number | null
  despachoAnteriorId?: number | null
  estado: DespachoEstado
  despachadoPor?: string | null
  iniciadoEn: string
  finalizadoEn?: string | null
  // Cuánta gente está transmitiendo su ubicación ahora mismo.
  enVivo: number
  // Kilómetros estimados en línea recta: ida, vuelta al cuartel y
  // total. Vienen en null si el destino no está ubicado en el mapa.
  idaKm?: number | null
  vueltaKm?: number | null
  recorridoKm?: number | null
}

export interface NuevoDespacho {
  movilidadId: number
  motivo: string
  destino?: string | null
  destinoLat?: number | null
  destinoLng?: number | null
  // Salida anterior de la misma movilidad, cuando sale de un servicio
  // directo a otro sin pasar por el cuartel.
  despachoAnteriorId?: number | null
}

export interface PuntoRecorrido {
  latitud: number
  longitud: number
  registradoEn: string
}

export interface ParticipanteSeguimiento {
  usuarioId: number
  nombreCompleto: string
  latitud: number
  longitud: number
  precisionMetros?: number | null
  velocidad?: number | null
  rumbo?: number | null
  ultimaSenal: string
  enVivo: boolean
  recorrido: PuntoRecorrido[]
}

export interface Seguimiento {
  despacho: Despacho
  participantes: ParticipanteSeguimiento[]
}

// Una dirección encontrada al escribir el destino o al marcarlo en el
// mapa. "ambito" dice si cayó dentro de Maipú, en el resto de Mendoza,
// o directamente fuera de la provincia (solo puede pasar marcando a
// mano: la búsqueda por texto nunca sale de Mendoza).
export interface ResultadoDireccion {
  etiqueta: string
  direccionCompleta: string
  lat: number
  lng: number
  ambito: 'MAIPU' | 'MENDOZA' | 'FUERA'
}

// Un ping de GPS tal como lo entrega el navegador.
export interface PosicionPing {
  latitud: number
  longitud: number
  precisionMetros?: number | null
  velocidad?: number | null
  rumbo?: number | null
}

export interface PuntoOrigen {
  despachoId: number | null
  nombre: string
  lat: number | null
  lng: number | null
}

// Desde dónde puede partir una movilidad: el cuartel o, si viene de
// otra salida, el destino de aquella.
export interface OrigenSugerido {
  base: PuntoOrigen
  ultimoDestino: PuntoOrigen | null
}
