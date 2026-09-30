import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import {
  actualizarConfiguracion,
  getConfiguracion,
  type ConfiguracionCuerpo,
} from '../../partes/services/configuracionService'
import { extraerMensajeError } from '../../../utils/http'
import BuscadorDireccion from './BuscadorDireccion'
import SelectorDestino from './SelectorDestino'

interface Props {
  // Solo un administrador puede cambiar la base; el resto la ve.
  puedeEditar: boolean
  // Se avisa al cambiarla para recalcular los kilómetros a la vista.
  onGuardado?: () => void
}

// De acá salen las movilidades salvo que vengan de otra salida, y hasta
// acá vuelven: es el punto contra el que se mide el recorrido.
const BaseOperativaCard = ({ puedeEditar, onGuardado }: Props) => {
  const [config, setConfig] = useState<ConfiguracionCuerpo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [nombre, setNombre] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [claveEnfoque, setClaveEnfoque] = useState(0)
  // Nombre que ya corresponde a una dirección ubicada, para no volver
  // a buscarlo cuando lo completa el mapa o la lista.
  const [nombreElegido, setNombreElegido] = useState<string | null>(null)

  useEffect(() => {
    getConfiguracion()
      .then(setConfig)
      .catch((err) => setError(extraerMensajeError(err, 'Error al cargar el punto de partida')))
  }, [])

  const abrirEdicion = () => {
    setNombre(config?.baseNombre ?? '')
    setLat(config?.baseLat ?? null)
    setLng(config?.baseLng ?? null)
    setClaveEnfoque(0)
    setNombreElegido(null)
    setError(null)
    setEditando(true)
  }

  const guardar = async () => {
    if (!config) return
    setGuardando(true)
    setError(null)
    try {
      const actualizada = await actualizarConfiguracion({
        ...config,
        baseNombre: nombre.trim(),
        baseLat: lat,
        baseLng: lng,
      })
      setConfig(actualizada)
      setEditando(false)
      onGuardado?.()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al guardar el punto de partida'))
    } finally {
      setGuardando(false)
    }
  }

  if (!config) return null

  const sinUbicar = config.baseLat == null || config.baseLng == null

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4">
      <Box className="flex items-start justify-between gap-3">
        <Box className="flex min-w-0 items-center gap-3">
          <Box
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            sx={{ bgcolor: '#FEE2E2' }}
          >
            <HomeWorkRoundedIcon sx={{ color: '#B91C1C' }} />
          </Box>
          <Box className="min-w-0">
            <Typography variant="caption" color="text.secondary">
              Punto de partida de las movilidades
            </Typography>
            <Typography variant="subtitle1" className="truncate font-semibold!">
              {config.baseNombre || 'Sin definir'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {sinUbicar
                ? 'Sin coordenadas: no se pueden estimar los recorridos'
                : `${config.baseLat?.toFixed(5)}, ${config.baseLng?.toFixed(5)}`}
            </Typography>
          </Box>
        </Box>
        {puedeEditar && (
          <Button size="small" startIcon={<EditRoundedIcon />} onClick={abrirEdicion}>
            Cambiar
          </Button>
        )}
      </Box>

      {error && !editando && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Dialog
        open={editando}
        onClose={guardando ? undefined : () => setEditando(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="font-bold!">Punto de partida de las movilidades</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Typography variant="body2" color="text.secondary" className="mt-1!">
            Desde acá salen las movilidades y hasta acá vuelven. Los recorridos ya guardados no
            cambian: cada salida conserva el origen que tenía cuando se despachó.
          </Typography>

          <TextField
            label="Nombre del lugar"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
          />

          <BuscadorDireccion
            valor={nombre}
            label="Buscar la dirección del cuartel"
            placeholder="Ej: Bomberos Voluntarios Maipú"
            textoElegido={nombreElegido}
            onCambiarTexto={setNombre}
            onElegir={(resultado) => {
              setNombre(resultado.etiqueta)
              setNombreElegido(resultado.etiqueta)
              setLat(resultado.lat)
              setLng(resultado.lng)
              setClaveEnfoque((clave) => clave + 1)
            }}
          />

          <SelectorDestino
            lat={lat}
            lng={lng}
            claveEnfoque={claveEnfoque}
            onCambiar={(nuevaLat, nuevaLng) => {
              setLat(nuevaLat)
              setLng(nuevaLng)
            }}
            // Al marcar el cuartel en el mapa se completa su dirección.
            onDireccion={(direccion) => {
              setNombre(direccion.etiqueta)
              setNombreElegido(direccion.etiqueta)
            }}
          />

          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEditando(false)} color="inherit" disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={guardar}
            disabled={guardando || nombre.trim() === '' || lat == null || lng == null}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default BaseOperativaCard
