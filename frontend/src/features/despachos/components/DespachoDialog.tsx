import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import type { Movilidad } from '../../../types'
import type { NuevoDespacho, OrigenSugerido } from '../types'
import { getOrigenSugerido } from '../services/despachoService'
import BuscadorDireccion from './BuscadorDireccion'
import SelectorDestino from './SelectorDestino'

interface Props {
  open: boolean
  movilidades: Movilidad[]
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onGuardar: (despacho: NuevoDespacho) => void
}

const DespachoDialog = ({ open, movilidades, guardando, error, onCerrar, onGuardar }: Props) => {
  const [movilidadId, setMovilidadId] = useState<number | ''>('')
  const [motivo, setMotivo] = useState('')
  const [destino, setDestino] = useState('')
  // Último texto que corresponde a una dirección ya ubicada: evita
  // volver a buscarla cuando la completa el mapa o la lista.
  const [destinoElegido, setDestinoElegido] = useState<string | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  // Se incrementa al elegir una dirección de la lista, para que el mapa
  // vuele hasta ahí.
  const [claveEnfoque, setClaveEnfoque] = useState(0)
  const [origen, setOrigen] = useState<OrigenSugerido | null>(null)
  // null = sale del cuartel; con id = encadena con esa salida anterior.
  const [despachoAnteriorId, setDespachoAnteriorId] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      setMovilidadId('')
      setMotivo('')
      setDestino('')
      setDestinoElegido(null)
      setLat(null)
      setLng(null)
      setClaveEnfoque(0)
      setOrigen(null)
      setDespachoAnteriorId(null)
    }
  }, [open])

  // Al elegir la movilidad se consulta desde dónde puede salir: si la
  // vez anterior quedó en la calle, se ofrece arrancar de ahí.
  useEffect(() => {
    if (movilidadId === '') return
    let vigente = true
    getOrigenSugerido(movilidadId)
      .then((sugerido) => {
        if (!vigente) return
        setOrigen(sugerido)
        setDespachoAnteriorId(null)
      })
      .catch(() => {
        if (vigente) setOrigen(null)
      })
    return () => {
      vigente = false
    }
  }, [movilidadId])

  // Solo se puede despachar lo que está en servicio.
  const disponibles = movilidades.filter((m) => m.enServicio)
  const valido = movilidadId !== '' && motivo.trim() !== ''
  const ultimoDestino = origen?.ultimoDestino ?? null

  return (
    <Dialog open={open} onClose={guardando ? undefined : onCerrar} maxWidth="md" fullWidth>
      <DialogTitle className="font-bold!">Despachar movilidad</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          select
          label="Movilidad"
          value={movilidadId}
          onChange={(e) => setMovilidadId(Number(e.target.value))}
          required
          fullWidth
          className="mt-2!"
          helperText={
            disponibles.length === 0 ? 'No hay movilidades en servicio disponibles' : undefined
          }
          disabled={disponibles.length === 0}
        >
          {disponibles.map((movilidad) => (
            <MenuItem key={movilidad.id} value={movilidad.id}>
              {movilidad.nombre}
              {movilidad.patente ? ` · ${movilidad.patente}` : ''}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Motivo de la salida"
          placeholder="Ej: Incendio de vivienda"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
          fullWidth
        />

        {/* Solo aparece si la movilidad tiene una salida anterior con
            destino ubicado: si no, siempre sale del cuartel. */}
        {ultimoDestino && (
          <Box className="rounded-xl border border-slate-200 p-3">
            <Typography variant="subtitle2" className="font-bold!">
              ¿Desde dónde sale?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              De esto depende cómo se cuentan los kilómetros del recorrido.
            </Typography>
            <RadioGroup
              value={despachoAnteriorId === null ? 'base' : 'anterior'}
              onChange={(e) =>
                setDespachoAnteriorId(
                  e.target.value === 'base' ? null : (ultimoDestino.despachoId ?? null)
                )
              }
            >
              <FormControlLabel
                value="base"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    Del cuartel ({origen?.base.nombre})
                  </Typography>
                }
              />
              <FormControlLabel
                value="anterior"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    Sigue en la calle: sale desde {ultimoDestino.nombre}
                  </Typography>
                }
              />
            </RadioGroup>
          </Box>
        )}

        <BuscadorDireccion
          valor={destino}
          label="Destino (opcional)"
          placeholder="Ej: Maza 234"
          textoElegido={destinoElegido}
          onCambiarTexto={setDestino}
          onElegir={(resultado) => {
            setDestino(resultado.etiqueta)
            setDestinoElegido(resultado.etiqueta)
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
          // Al marcar en el mapa se completa el destino con la
          // dirección de ese punto.
          onDireccion={(direccion) => {
            setDestino(direccion.etiqueta)
            setDestinoElegido(direccion.etiqueta)
          }}
        />

        {lat == null && (
          <Alert severity="info" variant="outlined">
            Sin el destino ubicado en el mapa, esta salida no entra en el promedio de recorrido.
          </Alert>
        )}

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={guardando || !valido}
          onClick={() =>
            onGuardar({
              movilidadId: movilidadId as number,
              motivo: motivo.trim(),
              destino: destino.trim() || null,
              destinoLat: lat,
              destinoLng: lng,
              despachoAnteriorId,
            })
          }
        >
          {guardando ? 'Despachando...' : 'Despachar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DespachoDialog
