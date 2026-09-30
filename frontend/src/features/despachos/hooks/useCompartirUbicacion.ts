import { useCallback, useEffect, useRef, useState } from 'react'
import { enviarUbicacion } from '../services/despachoService'
import { extraerMensajeError } from '../../../utils/http'

// Cada cuánto se manda la posición al servidor. El GPS avisa muchas
// más veces que esto; el resto de los avisos se descartan para no
// gastar datos ni llenar la tabla de posiciones.
const INTERVALO_ENVIO_MS = 10000

// Margen de error, en metros, con el que una posición sirve para
// seguir a un móvil: es lo que da un GPS real al aire libre.
const PRECISION_BUENA = 100

// Más error que esto es una ubicación sacada de la IP o de las redes
// wifi cercanas, no del GPS: puede estar a kilómetros y marcarla en el
// mapa es peor que no mostrar nada.
const PRECISION_INACEPTABLE = 2000

// Cuánto se espera a que el GPS "enganche" antes de mandar la primera
// posición. La primera lectura del navegador suele ser la aproximada
// por red y recién después llega la buena.
const ESPERA_GPS_MS = 15000

const mensajeDeError = (error: GeolocationPositionError): string => {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Bloqueaste el acceso a la ubicación. Habilitalo en el candado de la barra de direcciones y volvé a intentar.'
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'No se pudo obtener la ubicación. Revisá que el GPS del celular esté encendido.'
  }
  return 'El GPS está tardando demasiado en responder. Probá al aire libre.'
}

// Comparte la ubicación del dispositivo contra un despacho mientras la
// pantalla esté abierta. Requiere HTTPS (o localhost): los navegadores
// no dan la ubicación en sitios sin cifrar.
//
// Ojo con dónde se abre: una PC de escritorio no tiene GPS, así que el
// navegador estima la posición por la IP o las redes wifi que ve, y
// puede errarle por kilómetros. Para seguir a una movilidad hay que
// abrir esta pantalla en el celular del personal.
const useCompartirUbicacion = (despachoId: number) => {
  const [compartiendo, setCompartiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  // Margen de error de la última lectura, para mostrarlo en pantalla.
  const [precision, setPrecision] = useState<number | null>(null)
  const [ultimoEnvio, setUltimoEnvio] = useState<Date | null>(null)

  const watchId = useRef<number | null>(null)
  const enviadoEn = useRef(0)
  const iniciadoEn = useRef(0)
  const enviando = useRef(false)

  const detener = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    setCompartiendo(false)
  }, [])

  const iniciar = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Este dispositivo no permite compartir la ubicación.')
      return
    }
    if (!window.isSecureContext) {
      setError('Para compartir la ubicación la página tiene que abrirse por HTTPS.')
      return
    }
    if (watchId.current !== null) return

    setError(null)
    setAviso(null)
    setPrecision(null)
    setCompartiendo(true)
    enviadoEn.current = 0
    iniciadoEn.current = Date.now()

    watchId.current = navigator.geolocation.watchPosition(
      async (posicion) => {
        const ahora = Date.now()
        const margen = posicion.coords.accuracy
        setPrecision(margen)

        // Una posición con kilómetros de error no es la del móvil: es
        // el barrio donde está el proveedor de internet.
        if (margen > PRECISION_INACEPTABLE) {
          setAviso(
            `El navegador está dando una ubicación con ±${Math.round(margen)} m de error, así que no se manda al mapa. ` +
              'Pasa cuando se comparte desde una computadora sin GPS: abrí esta pantalla en el celular.'
          )
          return
        }

        // Los primeros segundos se le da tiempo al GPS a engancharse,
        // para que el primer punto del recorrido no sea el aproximado.
        const esperandoGps =
          enviadoEn.current === 0 &&
          margen > PRECISION_BUENA &&
          ahora - iniciadoEn.current < ESPERA_GPS_MS
        if (esperandoGps) {
          setAviso('Buscando señal de GPS...')
          return
        }

        setAviso(
          margen > PRECISION_BUENA
            ? `Ubicación aproximada: ±${Math.round(margen)} m. Si estás en la calle, en un rato debería mejorar.`
            : null
        )

        if (enviando.current || ahora - enviadoEn.current < INTERVALO_ENVIO_MS) return
        enviando.current = true
        try {
          await enviarUbicacion(despachoId, {
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
            precisionMetros: margen,
            velocidad: posicion.coords.speed,
            rumbo: posicion.coords.heading,
          })
          enviadoEn.current = ahora
          setUltimoEnvio(new Date())
          setError(null)
        } catch (err) {
          setError(extraerMensajeError(err, 'No se pudo enviar la ubicación'))
        } finally {
          enviando.current = false
        }
      },
      (errorGeo) => {
        setError(mensajeDeError(errorGeo))
        detener()
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    )
  }, [despachoId, detener])

  // Si se sale de la pantalla se corta el rastreo: no tiene sentido
  // seguir transmitiendo desde una página que ya no se está viendo.
  useEffect(() => detener, [detener])

  return { compartiendo, error, aviso, precision, ultimoEnvio, iniciar, detener }
}

export default useCompartirUbicacion
