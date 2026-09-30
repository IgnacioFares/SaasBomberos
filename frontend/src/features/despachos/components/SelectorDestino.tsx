import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import type { ResultadoDireccion } from '../types'
import { buscarPorCoordenadas } from '../services/direccionService'
import { CENTRO_POR_DEFECTO, ZOOM_POR_DEFECTO } from '../utils'

interface Props {
  lat: number | null
  lng: number | null
  // Cambia cuando el destino viene de la búsqueda por dirección: ahí el
  // mapa vuela hasta el punto. Con un clic en el mapa no cambia, para
  // no hacerle zoom encima al usuario mientras marca a mano.
  claveEnfoque: number
  onCambiar: (lat: number | null, lng: number | null) => void
  // Qué hay en el punto que se marcó, para completar el campo de texto.
  onDireccion?: (direccion: ResultadoDireccion) => void
}

// Zoom al que queda el mapa después de buscar una dirección: se ve la
// cuadra y las calles que la cruzan.
const ZOOM_DIRECCION = 17

const VolarA = ({ lat, lng, clave }: { lat: number | null; lng: number | null; clave: number }) => {
  const mapa = useMap()
  const ultimaClave = useRef(0)

  useEffect(() => {
    if (clave === ultimaClave.current || lat == null || lng == null) return
    ultimaClave.current = clave
    mapa.flyTo([lat, lng], ZOOM_DIRECCION)
  }, [lat, lng, clave, mapa])

  return null
}

const iconoDestino = L.divIcon({
  className: '',
  html: `<div style="
      width:26px;height:26px;border-radius:9999px;
      background:#B91C1C;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.4);"
    ></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

const CapturarClick = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (evento) => onClick(evento.latlng.lat, evento.latlng.lng),
  })
  return null
}

// Mini mapa para marcar adónde va la movilidad. Es opcional: muchas
// salidas arrancan sin dirección exacta.
const SelectorDestino = ({ lat, lng, claveEnfoque, onCambiar, onDireccion }: Props) => {
  const [buscando, setBuscando] = useState(false)
  const [direccion, setDireccion] = useState<ResultadoDireccion | null>(null)
  // Cancela la consulta anterior si se vuelve a marcar enseguida, para
  // que una respuesta vieja no pise a la nueva.
  const consultaEnCurso = useRef<AbortController | null>(null)

  const limpiar = () => {
    consultaEnCurso.current?.abort()
    setDireccion(null)
    setBuscando(false)
    onCambiar(null, null)
  }

  const marcar = useCallback(
    async (nuevaLat: number, nuevaLng: number) => {
      onCambiar(nuevaLat, nuevaLng)

      consultaEnCurso.current?.abort()
      const controlador = new AbortController()
      consultaEnCurso.current = controlador
      setBuscando(true)
      setDireccion(null)

      try {
        const encontrada = await buscarPorCoordenadas(nuevaLat, nuevaLng, controlador.signal)
        if (controlador.signal.aborted) return
        setDireccion(encontrada)
        if (encontrada) onDireccion?.(encontrada)
      } catch {
        // Si no se pudo consultar, el punto igual queda marcado: la
        // dirección en texto es una ayuda, no un requisito.
        if (!controlador.signal.aborted) setDireccion(null)
      } finally {
        if (!controlador.signal.aborted) setBuscando(false)
      }
    },
    [onCambiar, onDireccion]
  )

  // Si se cierra el diálogo con una consulta en vuelo, se corta.
  useEffect(() => () => consultaEnCurso.current?.abort(), [])

  const marcado = lat != null && lng != null

  return (
    <Box className="flex flex-col gap-2">
      <Box className="flex items-center justify-between gap-2">
        <Box className="flex min-w-0 items-center gap-2">
          {buscando && <CircularProgress size={14} />}
          <Typography variant="body2" color="text.secondary" className="truncate">
            {!marcado
              ? 'Tocá el mapa para marcar el destino (opcional)'
              : buscando
                ? 'Buscando la dirección del punto marcado...'
                : direccion
                  ? direccion.direccionCompleta
                  : `Destino marcado en ${lat.toFixed(5)}, ${lng.toFixed(5)}`}
          </Typography>
        </Box>
        {marcado && (
          <Button size="small" color="inherit" onClick={limpiar}>
            Quitar marca
          </Button>
        )}
      </Box>

      {direccion?.ambito === 'FUERA' && (
        <Alert severity="warning" variant="outlined">
          Ese punto está fuera de Mendoza. Si no es lo que querías, volvé a marcarlo.
        </Alert>
      )}

      <MapContainer
        center={marcado ? [lat, lng] : CENTRO_POR_DEFECTO}
        zoom={ZOOM_POR_DEFECTO}
        // Con la ruedita se acerca hasta ver la cuadra: marcar el destino
        // a ojo desde lejos no sirve de mucho.
        scrollWheelZoom
        maxZoom={19}
        style={{ height: 360, width: '100%', borderRadius: 12, zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <CapturarClick onClick={marcar} />
        <VolarA lat={lat} lng={lng} clave={claveEnfoque} />
        {marcado && <Marker position={[lat, lng]} icon={iconoDestino} />}
      </MapContainer>
    </Box>
  )
}

export default SelectorDestino
