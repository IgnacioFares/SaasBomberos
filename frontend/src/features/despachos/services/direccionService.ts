import type { ResultadoDireccion } from '../types'

// Buscador de direcciones de OpenStreetMap: gratis y sin API key, pero
// con un límite de una consulta por segundo, por eso quien lo llama
// espera a que el usuario deje de tipear (ver useBusquedaDireccion).
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_INVERSO = 'https://nominatim.openstreetmap.org/reverse'

// Cajas de búsqueda como "lon_oeste,lat_norte,lon_este,lat_sur". La de
// Maipú es generosa a propósito: el departamento no es un rectángulo,
// así que se pide de más y después se filtra por el departamento real
// que informa cada resultado.
const CAJA_MAIPU = '-68.95,-32.88,-68.45,-33.30'
const CAJA_MENDOZA = '-70.60,-31.90,-66.40,-37.60'

const PROVINCIA = 'mendoza'
const DEPARTAMENTO = 'maipu'

// Campos administrativos que devuelve Nominatim. Varían según el tipo
// de lugar: una casa puede traer "city", un paraje "town" o "village".
// A propósito no se mira la calle: existe una calle Maipú en otros
// departamentos y daría falsos positivos.
interface DireccionNominatim {
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state_district?: string
  suburb?: string
  city_district?: string
  state?: string
}

interface RespuestaNominatim {
  display_name: string
  lat: string
  lon: string
  address?: DireccionNominatim
}

const CAMPOS_ADMINISTRATIVOS: (keyof DireccionNominatim)[] = [
  'city',
  'town',
  'village',
  'municipality',
  'county',
  'state_district',
  'suburb',
  'city_district',
]

// Los datos vienen con tildes ("Maipú", "Departamento Maipú") y no
// siempre en el mismo campo, así que se compara sin acentos.
const sinAcentos = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const esDeMendoza = (resultado: RespuestaNominatim): boolean =>
  sinAcentos(resultado.address?.state ?? '') === PROVINCIA

const esDeMaipu = (resultado: RespuestaNominatim): boolean =>
  CAMPOS_ADMINISTRATIVOS.some((campo) => {
    const valor = resultado.address?.[campo]
    return valor != null && sinAcentos(valor).includes(DEPARTAMENTO)
  })

const ambitoDe = (resultado: RespuestaNominatim): ResultadoDireccion['ambito'] => {
  if (!esDeMendoza(resultado)) return 'FUERA'
  return esDeMaipu(resultado) ? 'MAIPU' : 'MENDOZA'
}

const consultar = async (
  texto: string,
  caja: string,
  signal: AbortSignal
): Promise<RespuestaNominatim[]> => {
  const parametros = new URLSearchParams({
    q: texto,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'ar',
    viewbox: caja,
    // bounded=1 descarta todo lo que caiga fuera de la caja, en vez de
    // solo priorizarlo: sin esto aparecen calles homónimas de otras
    // provincias.
    bounded: '1',
  })

  const respuesta = await fetch(`${NOMINATIM}?${parametros}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!respuesta.ok) throw new Error('El buscador de direcciones no respondió')
  return respuesta.json()
}

// "500, José Alberto Ozamis, Distrito Ciudad de Maipú, Departamento
// Maipú, Mendoza, 5515, Argentina" no entra en el campo: se corta en
// las primeras partes, que son las que identifican el lugar.
const etiquetaCorta = (nombreCompleto: string): string =>
  nombreCompleto.split(',').slice(0, 3).join(',').trim()

const mapear = (
  resultados: RespuestaNominatim[],
  ambito: ResultadoDireccion['ambito']
): ResultadoDireccion[] =>
  resultados.map((resultado) => ({
    etiqueta: etiquetaCorta(resultado.display_name),
    direccionCompleta: resultado.display_name,
    lat: Number(resultado.lat),
    lng: Number(resultado.lon),
    ambito,
  }))

// Qué hay en el punto que se marcó en el mapa ("geocodificación
// inversa"). A diferencia de la búsqueda por texto, acá el punto puede
// caer en cualquier lado, así que el ámbito se calcula sobre lo que
// devuelve OpenStreetMap y puede ser FUERA de la provincia.
export const buscarPorCoordenadas = async (
  lat: number,
  lng: number,
  signal: AbortSignal
): Promise<ResultadoDireccion | null> => {
  const parametros = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
    // Nivel "calle con altura": más detalle devuelve el edificio y
    // menos, el barrio entero.
    zoom: '18',
  })

  const respuesta = await fetch(`${NOMINATIM_INVERSO}?${parametros}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!respuesta.ok) throw new Error('El buscador de direcciones no respondió')

  const resultado: RespuestaNominatim & { error?: string } = await respuesta.json()
  // En medio del campo o del mar no hay nada que informar.
  if (!resultado || resultado.error || !resultado.display_name) return null

  return {
    etiqueta: etiquetaCorta(resultado.display_name),
    direccionCompleta: resultado.display_name,
    // Se conservan las coordenadas marcadas, no las del centro del
    // lugar encontrado: el punto exacto lo eligió quien despacha.
    lat,
    lng,
    ambito: ambitoDe(resultado),
  }
}

// Primero se busca dentro de Maipú. Si ahí no hay nada, se amplía a
// toda la provincia de Mendoza.
export const buscarDireccion = async (
  texto: string,
  signal: AbortSignal
): Promise<ResultadoDireccion[]> => {
  const cercanos = await consultar(texto, CAJA_MAIPU, signal)
  const enMaipu = cercanos.filter((r) => esDeMendoza(r) && esDeMaipu(r))
  if (enMaipu.length > 0) return mapear(enMaipu, 'MAIPU')

  const enProvincia = await consultar(texto, CAJA_MENDOZA, signal)
  return mapear(enProvincia.filter(esDeMendoza), 'MENDOZA')
}
