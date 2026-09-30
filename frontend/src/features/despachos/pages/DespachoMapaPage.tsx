import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import LocationOffRoundedIcon from '@mui/icons-material/LocationOffRounded'
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded'
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import BotonVolver from '../../../components/BotonVolver'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import useSeguimiento from '../hooks/useSeguimiento'
import useCompartirUbicacion from '../hooks/useCompartirUbicacion'
import MapaSeguimiento from '../components/MapaSeguimiento'
import { finalizarDespacho } from '../services/despachoService'
import { extraerMensajeError } from '../../../utils/http'
import { colorDeParticipante, duracion, formatearHora, haceCuanto, iniciales, velocidadKmH } from '../utils'

const DespachoMapaPage = () => {
  const { id } = useParams()
  const despachoId = Number(id)
  const navigate = useNavigate()
  const { tienePermiso } = usePermisos()
  const puedeDespachar = tienePermiso(PERMISOS.DESPACHAR_MOVILIDADES)

  const { seguimiento, loading, error, recargar } = useSeguimiento(
    Number.isNaN(despachoId) ? null : despachoId
  )
  const {
    compartiendo,
    error: errorUbicacion,
    aviso: avisoUbicacion,
    precision,
    ultimoEnvio,
    iniciar,
    detener,
  } = useCompartirUbicacion(despachoId)

  const [claveEncuadre, setClaveEncuadre] = useState(0)
  const [finalizando, setFinalizando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const despacho = seguimiento?.despacho
  const participantes = seguimiento?.participantes ?? []
  const enCurso = despacho?.estado === 'EN_CURSO'

  const confirmarFinalizar = async () => {
    try {
      await finalizarDespacho(despachoId)
      detener()
      setFinalizando(false)
      await recargar()
    } catch (err) {
      setErrorAccion(extraerMensajeError(err, 'Error al finalizar el despacho'))
      setFinalizando(false)
    }
  }

  if (loading && !seguimiento) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!despacho) {
    return (
      <Box className="flex flex-col gap-4">
        <BotonVolver to="/despachos" texto="Despachos" />
        <Alert severity="error" variant="outlined">
          {error ?? 'No se encontró el despacho'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box className="flex flex-col gap-4">
      <BotonVolver to="/despachos" texto="Despachos" />

      <Box className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Box className="min-w-0">
          <Box className="flex flex-wrap items-center gap-2">
            <Typography variant="h5" className="font-bold!">
              {despacho.movilidadNombre}
            </Typography>
            <Chip
              label={enCurso ? 'En curso' : 'Finalizado'}
              size="small"
              sx={{
                bgcolor: enCurso ? '#FEE2E2' : '#E2E8F0',
                color: enCurso ? '#B91C1C' : '#475569',
                fontWeight: 700,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {despacho.motivo}
            {despacho.destino ? ` · ${despacho.destino}` : ''} ·{' '}
            {enCurso
              ? `hace ${duracion(despacho.iniciadoEn)}`
              : `duró ${duracion(despacho.iniciadoEn, despacho.finalizadoEn)}`}
          </Typography>
        </Box>

        <Box className="flex flex-wrap items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<CenterFocusStrongRoundedIcon />}
            onClick={() => setClaveEncuadre((clave) => clave + 1)}
          >
            Centrar
          </Button>

          {enCurso && (
            <Button
              variant={compartiendo ? 'outlined' : 'contained'}
              color={compartiendo ? 'inherit' : 'primary'}
              size="small"
              startIcon={compartiendo ? <LocationOffRoundedIcon /> : <MyLocationRoundedIcon />}
              onClick={compartiendo ? detener : iniciar}
            >
              {compartiendo ? 'Dejar de compartir' : 'Compartir mi ubicación'}
            </Button>
          )}

          {puedeDespachar && enCurso && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<StopCircleRoundedIcon />}
              onClick={() => setFinalizando(true)}
            >
              Finalizar
            </Button>
          )}
        </Box>
      </Box>

      {compartiendo && (
        <Alert severity="success" icon={<MyLocationRoundedIcon fontSize="inherit" />}>
          Estás compartiendo tu ubicación. Dejá esta pantalla abierta para que se siga viendo en el
          mapa.
          {precision != null && ` Precisión actual: ±${Math.round(precision)} m.`}
          {ultimoEnvio && ` Última señal enviada a las ${formatearHora(ultimoEnvio.toISOString())}.`}
        </Alert>
      )}
      {compartiendo && avisoUbicacion && (
        <Alert severity="info" variant="outlined">
          {avisoUbicacion}
        </Alert>
      )}
      {errorUbicacion && (
        <Alert severity="warning" variant="outlined">
          {errorUbicacion}
        </Alert>
      )}
      {(error || errorAccion) && (
        <Alert severity="error" variant="outlined" onClose={() => setErrorAccion(null)}>
          {errorAccion ?? error}
        </Alert>
      )}

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Box className="lg:col-span-2">
          <MapaSeguimiento
            participantes={participantes}
            destinoLat={despacho.destinoLat}
            destinoLng={despacho.destinoLng}
            destinoTexto={despacho.destino}
            claveEncuadre={claveEncuadre}
          />
        </Box>

        <Paper
          elevation={0}
          className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4"
        >
          <Typography variant="subtitle2" className="font-bold!">
            Personal en el despacho
          </Typography>

          {participantes.length === 0 ? (
            <Box className="flex flex-col items-center gap-2 py-8 text-center">
              <MyLocationRoundedIcon sx={{ fontSize: 36, color: '#94A3B8' }} />
              <Typography variant="body2" color="text.secondary">
                Nadie está compartiendo su ubicación todavía. Quien salga con la movilidad tiene que
                abrir esta pantalla y tocar "Compartir mi ubicación".
              </Typography>
            </Box>
          ) : (
            <Box className="flex flex-col gap-2">
              {participantes.map((participante) => {
                const color = colorDeParticipante(participante.usuarioId)
                const velocidad = velocidadKmH(participante.velocidad)
                return (
                  <Box
                    key={participante.usuarioId}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
                    sx={{ opacity: participante.enVivo ? 1 : 0.6 }}
                  >
                    <Box
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      sx={{ bgcolor: color }}
                    >
                      {iniciales(participante.nombreCompleto)}
                    </Box>
                    <Box className="min-w-0 flex-1">
                      <Typography variant="body2" className="truncate font-semibold!">
                        {participante.nombreCompleto}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {participante.enVivo
                          ? `En vivo · ${haceCuanto(participante.ultimaSenal)}`
                          : `Sin señal desde las ${formatearHora(participante.ultimaSenal)}`}
                        {velocidad ? ` · ${velocidad}` : ''}
                        {/* El margen de error dice cuánto confiar en el
                            punto: ±10 m es GPS, ±1000 m es la IP. */}
                        {participante.precisionMetros != null &&
                          ` · ±${Math.round(participante.precisionMetros)} m`}
                      </Typography>
                    </Box>
                    {participante.enVivo && (
                      <Box className="h-2.5 w-2.5 shrink-0 rounded-full" sx={{ bgcolor: '#16A34A' }} />
                    )}
                  </Box>
                )
              })}
            </Box>
          )}

          {despacho.destinoLat != null && despacho.destinoLng != null && (
            <Box className="flex items-center gap-2 border-t border-slate-200 pt-3">
              <PlaceRoundedIcon fontSize="small" sx={{ color: '#B91C1C' }} />
              <Typography variant="caption" color="text.secondary">
                Destino marcado en el mapa
                {despacho.destino ? `: ${despacho.destino}` : ''}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={finalizando} onClose={() => setFinalizando(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Finalizar despacho</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{despacho.movilidadNombre}" vuelve a quedar disponible y el personal deja de compartir
            su ubicación. El recorrido queda guardado en el historial.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setFinalizando(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarFinalizar}>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {!enCurso && (
        <Typography variant="caption" color="text.secondary">
          Este despacho ya terminó: el mapa muestra el recorrido tal como quedó.{' '}
          <Button size="small" onClick={() => navigate('/despachos')}>
            Volver a despachos
          </Button>
        </Typography>
      )}
    </Box>
  )
}

export default DespachoMapaPage
