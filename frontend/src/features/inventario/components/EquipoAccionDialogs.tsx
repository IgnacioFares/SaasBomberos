import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'
import type { EquipoEstado, EquipoUnidad, UbicacionEquipo } from '../types'
import { ESTADOS_EQUIPO, ESTILO_EQUIPO_ESTADO, formatearFecha } from '../constants'

// Dialogs de acciones rápidas sobre un equipo o una unidad puntual.
// El sufijo del título aclara sobre qué unidad se opera.

export type AccionEquipo =
  | { tipo: 'estado'; unidad?: EquipoUnidad }
  | { tipo: 'ubicacion'; unidad?: EquipoUnidad }
  | { tipo: 'observacion'; unidad?: EquipoUnidad }
  | { tipo: 'editar-unidad'; unidad: EquipoUnidad }

interface BaseProps {
  accion: AccionEquipo | null
  guardando: boolean
  onCerrar: () => void
}

const sufijoUnidad = (accion: AccionEquipo | null) =>
  accion?.unidad ? ` — Unidad N°${accion.unidad.numero}` : ''

export const CambiarEstadoDialog = ({
  accion,
  guardando,
  onCerrar,
  estadoActual,
  onConfirmar,
}: BaseProps & {
  estadoActual: EquipoEstado
  onConfirmar: (estado: EquipoEstado, nota: string) => void
}) => {
  const abierto = accion?.tipo === 'estado'
  const [estado, setEstado] = useState<EquipoEstado>(estadoActual)
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (abierto) {
      setEstado(accion?.unidad?.estado ?? estadoActual)
      setNota('')
    }
  }, [abierto, accion, estadoActual])

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Cambiar estado{sufijoUnidad(accion)}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          select
          label="Nuevo estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EquipoEstado)}
          fullWidth
          className="mt-2!"
        >
          {ESTADOS_EQUIPO.map((valor) => (
            <MenuItem key={valor} value={valor}>
              {ESTILO_EQUIPO_ESTADO[valor].label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nota (opcional)"
          placeholder='Ej: "Visor rajado, enviado a taller"'
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          fullWidth
          multiline
          maxRows={3}
        />
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => onConfirmar(estado, nota)} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const CambiarUbicacionDialog = ({
  accion,
  guardando,
  onCerrar,
  ubicaciones,
  onConfirmar,
}: BaseProps & {
  ubicaciones: UbicacionEquipo[]
  onConfirmar: (ubicacionId: number, nota: string) => void
}) => {
  const abierto = accion?.tipo === 'ubicacion'
  const [ubicacionId, setUbicacionId] = useState<number | ''>('')
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (abierto) {
      setUbicacionId('')
      setNota('')
    }
  }, [abierto])

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Cambiar ubicación{sufijoUnidad(accion)}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          select
          label="Nueva ubicación"
          value={ubicacionId}
          onChange={(e) => setUbicacionId(Number(e.target.value))}
          fullWidth
          className="mt-2!"
        >
          {ubicaciones.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nota (opcional)"
          placeholder='Ej: "Prestado al Móvil 2 por incendio forestal"'
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          fullWidth
          multiline
          maxRows={3}
        />
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => ubicacionId !== '' && onConfirmar(ubicacionId, nota)}
          disabled={guardando || ubicacionId === ''}
        >
          {guardando ? 'Guardando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const ObservacionDialog = ({
  accion,
  guardando,
  onCerrar,
  onConfirmar,
}: BaseProps & { onConfirmar: (observacion: string) => void }) => {
  const abierto = accion?.tipo === 'observacion'
  const [texto, setTexto] = useState('')

  useEffect(() => {
    if (abierto) setTexto(accion?.unidad?.observacion ?? '')
  }, [abierto, accion])

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Observación{sufijoUnidad(accion)}</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Escribí la observación…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          className="mt-2!"
          autoFocus
        />
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirmar(texto)}
          disabled={guardando || !texto.trim()}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const EditarUnidadDialog = ({
  accion,
  guardando,
  onCerrar,
  onConfirmar,
}: BaseProps & {
  onConfirmar: (numeroSerie: string, fechaVencimiento: string) => void
}) => {
  const abierto = accion?.tipo === 'editar-unidad'
  const [numeroSerie, setNumeroSerie] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')

  useEffect(() => {
    if (abierto && accion?.unidad) {
      setNumeroSerie(accion.unidad.numeroSerie ?? '')
      setFechaVencimiento(accion.unidad.fechaVencimiento ?? '')
    }
  }, [abierto, accion])

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Editar unidad{sufijoUnidad(accion)}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          label="Número de serie"
          value={numeroSerie}
          onChange={(e) => setNumeroSerie(e.target.value)}
          fullWidth
          className="mt-2!"
        />
        <TextField
          label="Fecha de vencimiento"
          type="date"
          value={fechaVencimiento}
          onChange={(e) => setFechaVencimiento(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          helperText={
            accion?.unidad?.fechaVencimiento
              ? `Actual: ${formatearFecha(accion.unidad.fechaVencimiento)}`
              : 'Sin vencimiento cargado'
          }
        />
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirmar(numeroSerie, fechaVencimiento)}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
