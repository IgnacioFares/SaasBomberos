import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ParticipanteSeguimiento } from '../types'
import {
  CENTRO_POR_DEFECTO,
  ZOOM_POR_DEFECTO,
  colorDeParticipante,
  iniciales,
  textoUltimaSenal,
} from '../utils'

interface Props {
  participantes: ParticipanteSeguimiento[]
  destinoLat?: number | null
  destinoLng?: number | null
  destinoTexto?: string | null
  // Cada vez que cambia, el mapa vuelve a encuadrar todo lo que hay.
  // Así el encuadre automático no pelea con el usuario mientras
  // arrastra el mapa: solo ocurre cuando él lo pide.
  claveEncuadre: number
  altura?: number | string
}

const iconoParticipante = (participante: ParticipanteSeguimiento) => {
  const color = colorDeParticipante(participante.usuarioId)
  const opacidad = participante.enVivo ? 1 : 0.45
  return L.divIcon({
    className: '',
    html: `<div style="
        width:34px;height:34px;border-radius:9999px;
        background:${color};opacity:${opacidad};
        border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:700;font-size:12px;font-family:system-ui,sans-serif;"
      >${iniciales(participante.nombreCompleto)}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

const iconoDestino = L.divIcon({
  className: '',
  html: `<div style="
      width:28px;height:28px;border-radius:9999px;
      background:#B91C1C;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:14px;font-family:system-ui,sans-serif;"
    >&#9873;</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

// Encuadra el mapa sobre todo lo que hay para ver. Lo hace una sola vez
// cuando aparecen las primeras posiciones y después solo cuando el
// usuario aprieta "Centrar": si reencuadrara en cada refresco no se
// podría arrastrar el mapa sin que volviera a saltar.
const Encuadrar = ({ puntos, clave }: { puntos: [number, number][]; clave: number }) => {
  const mapa = useMap()
  const yaEncuadro = useRef(false)
  const ultimaClave = useRef(0)

  useEffect(() => {
    if (puntos.length === 0) return
    // Se encuadra en el primer refresco con posiciones y cada vez que
    // el usuario aprieta "Centrar"; en los demás refrescos no se toca
    // la vista para no interrumpir a quien está mirando el mapa.
    if (yaEncuadro.current && clave === ultimaClave.current) return
    yaEncuadro.current = true
    ultimaClave.current = clave

    if (puntos.length === 1) {
      mapa.setView(puntos[0], 16)
    } else {
      mapa.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 17 })
    }
  }, [puntos, clave, mapa])

  return null
}

const MapaSeguimiento = ({
  participantes,
  destinoLat,
  destinoLng,
  destinoTexto,
  claveEncuadre,
  altura = 520,
}: Props) => {
  const puntosParaEncuadrar = useMemo(() => {
    const puntos: [number, number][] = participantes.map((p) => [p.latitud, p.longitud])
    if (destinoLat != null && destinoLng != null) puntos.push([destinoLat, destinoLng])
    return puntos
  }, [participantes, destinoLat, destinoLng])

  return (
    <MapContainer
      center={puntosParaEncuadrar[0] ?? CENTRO_POR_DEFECTO}
      zoom={puntosParaEncuadrar.length > 0 ? 15 : ZOOM_POR_DEFECTO}
      scrollWheelZoom
      style={{ height: altura, width: '100%', borderRadius: 16, zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Encuadrar puntos={puntosParaEncuadrar} clave={claveEncuadre} />

      {destinoLat != null && destinoLng != null && (
        <Marker position={[destinoLat, destinoLng]} icon={iconoDestino}>
          <Popup>{destinoTexto || 'Destino'}</Popup>
        </Marker>
      )}

      {participantes.map((participante) => {
        const color = colorDeParticipante(participante.usuarioId)
        const recorrido: [number, number][] = participante.recorrido.map((p) => [p.latitud, p.longitud])
        return (
          <Fragment key={participante.usuarioId}>
            {recorrido.length > 1 && (
              <Polyline
                positions={recorrido}
                pathOptions={{ color, weight: 4, opacity: participante.enVivo ? 0.75 : 0.35 }}
              />
            )}
            {participante.precisionMetros != null && participante.enVivo && (
              <Circle
                center={[participante.latitud, participante.longitud]}
                radius={participante.precisionMetros}
                pathOptions={{ color, weight: 1, fillOpacity: 0.12 }}
              />
            )}
            <Marker
              position={[participante.latitud, participante.longitud]}
              icon={iconoParticipante(participante)}
            >
              <Popup>
                <strong>{participante.nombreCompleto}</strong>
                <br />
                {textoUltimaSenal(participante)}
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </MapContainer>
  )
}

export default MapaSeguimiento
