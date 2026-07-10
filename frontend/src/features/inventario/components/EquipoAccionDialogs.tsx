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
import type {
  AccionEquipo,
  AgregarUnidadesRequest,
  AjustarStockRequest,
  EquipoEstado,
  EquipoStockLinea,
  MoverStockRequest,
  UbicacionEquipo,
} from '../types'
import { ESTADOS_EQUIPO, ESTILO_EQUIPO_ESTADO, formatearFecha } from '../constants'
import { unidadDeAccion } from '../utils'

// Dialogs de acciones rápidas sobre un equipo, una unidad puntual o
// una línea de stock. El sufijo del título aclara sobre qué se opera.

export type { AccionEquipo }

interface BaseProps {
  accion: AccionEquipo | null
  guardando: boolean
  onCerrar: () => void
}

const sufijoUnidad = (accion: AccionEquipo | null) => {
  const unidad = unidadDeAccion(accion)
  return unidad ? ` — Unidad N°${unidad.numero}` : ''
}

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
      setEstado(unidadDeAccion(accion)?.estado ?? estadoActual)
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
    if (abierto) setTexto(unidadDeAccion(accion)?.observacion ?? '')
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

const descripcionLinea = (linea: EquipoStockLinea) =>
  `${linea.ubicacionNombre ?? 'Sin ubicación'} · ${ESTILO_EQUIPO_ESTADO[linea.estado].label} · ${linea.cantidad} disponibles`

export const MoverStockDialog = ({
  accion,
  guardando,
  onCerrar,
  ubicaciones,
  onConfirmar,
}: BaseProps & {
  ubicaciones: UbicacionEquipo[]
  onConfirmar: (data: MoverStockRequest) => void
}) => {
  const abierto = accion?.tipo === 'mover-stock'
  const linea = accion?.tipo === 'mover-stock' ? accion.linea : null
  const [cantidad, setCantidad] = useState('1')
  const [ubicacionDestinoId, setUbicacionDestinoId] = useState<number | ''>('')
  const [estadoDestino, setEstadoDestino] = useState<EquipoEstado>('EN_SERVICIO')
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (abierto && linea) {
      setCantidad('1')
      setUbicacionDestinoId('')
      setEstadoDestino(linea.estado)
      setNota('')
    }
  }, [abierto, linea])

  if (!linea) return null
  const cantidadNum = Number(cantidad)
  const valida = Number.isInteger(cantidadNum) && cantidadNum >= 1 && cantidadNum <= linea.cantidad

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Mover stock</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField label="Desde" value={descripcionLinea(linea)} fullWidth disabled className="mt-2!" />
        <TextField
          label="Cantidad a mover"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { min: 1, max: linea.cantidad } }}
          error={cantidad !== '' && !valida}
          helperText={`Máximo: ${linea.cantidad}`}
        />
        <TextField
          select
          label="Hacia la ubicación"
          value={ubicacionDestinoId}
          onChange={(e) => setUbicacionDestinoId(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
        >
          <MenuItem value="">— Mantener ubicación (solo cambiar estado) —</MenuItem>
          {ubicaciones.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado en el destino"
          value={estadoDestino}
          onChange={(e) => setEstadoDestino(e.target.value as EquipoEstado)}
          fullWidth
        >
          {ESTADOS_EQUIPO.map((valor) => (
            <MenuItem key={valor} value={valor}>
              {ESTILO_EQUIPO_ESTADO[valor].label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nota (opcional)"
          placeholder='Ej: "Equipando el Móvil 1"'
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
          disabled={guardando || !valida}
          onClick={() =>
            onConfirmar({
              stockId: linea.id,
              cantidad: cantidadNum,
              ubicacionDestinoId: ubicacionDestinoId === '' ? null : ubicacionDestinoId,
              estadoDestino,
              nota: nota.trim() || undefined,
            })
          }
        >
          {guardando ? 'Moviendo...' : 'Mover'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const AjustarStockDialog = ({
  accion,
  guardando,
  onCerrar,
  ubicaciones,
  onConfirmar,
}: BaseProps & {
  ubicaciones: UbicacionEquipo[]
  onConfirmar: (data: AjustarStockRequest) => void
}) => {
  const abierto = accion?.tipo === 'ajustar-stock'
  const linea = accion?.tipo === 'ajustar-stock' ? (accion.linea ?? null) : null
  const esAjuste = linea !== null

  const [cantidad, setCantidad] = useState('')
  const [ubicacionId, setUbicacionId] = useState<number | ''>('')
  const [estado, setEstado] = useState<EquipoEstado>('EN_DEPOSITO')
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (abierto) {
      setCantidad(linea ? String(linea.cantidad) : '')
      setUbicacionId('')
      setEstado('EN_DEPOSITO')
      setNota('')
    }
  }, [abierto, linea])

  const cantidadNum = Number(cantidad)
  const valida =
    cantidad !== '' && Number.isInteger(cantidadNum) && (esAjuste ? cantidadNum >= 0 : cantidadNum >= 1)

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">{esAjuste ? 'Ajustar stock' : 'Agregar stock'}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        {esAjuste ? (
          <TextField label="Línea" value={descripcionLinea(linea)} fullWidth disabled className="mt-2!" />
        ) : (
          <>
            <TextField
              select
              label="Ubicación"
              value={ubicacionId}
              onChange={(e) => setUbicacionId(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
              className="mt-2!"
            >
              <MenuItem value="">— Sin ubicación —</MenuItem>
              {ubicaciones.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EquipoEstado)}
              fullWidth
            >
              {ESTADOS_EQUIPO.map((valor) => (
                <MenuItem key={valor} value={valor}>
                  {ESTILO_EQUIPO_ESTADO[valor].label}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
        <TextField
          label={esAjuste ? 'Nueva cantidad' : 'Cantidad a agregar'}
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          fullWidth
          slotProps={{ htmlInput: { min: esAjuste ? 0 : 1 } }}
          helperText={esAjuste ? 'Con 0 la línea se elimina' : undefined}
        />
        <TextField
          label="Nota (opcional)"
          placeholder='Ej: "Recuento físico" o "Compra nueva"'
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
          disabled={guardando || !valida}
          onClick={() =>
            onConfirmar({
              stockId: linea?.id,
              ubicacionId: esAjuste ? undefined : ubicacionId === '' ? null : ubicacionId,
              estado: esAjuste ? undefined : estado,
              cantidad: cantidadNum,
              nota: nota.trim() || undefined,
            })
          }
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const AgregarUnidadesDialog = ({
  accion,
  guardando,
  onCerrar,
  ubicaciones,
  onConfirmar,
}: BaseProps & {
  ubicaciones: UbicacionEquipo[]
  onConfirmar: (data: AgregarUnidadesRequest) => void
}) => {
  const abierto = accion?.tipo === 'agregar-unidades'
  const [cantidad, setCantidad] = useState('1')
  const [estado, setEstado] = useState<EquipoEstado>('EN_DEPOSITO')
  const [ubicacionId, setUbicacionId] = useState<number | ''>('')
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (abierto) {
      setCantidad('1')
      setEstado('EN_DEPOSITO')
      setUbicacionId('')
      setNota('')
    }
  }, [abierto])

  const cantidadNum = Number(cantidad)
  const valida = Number.isInteger(cantidadNum) && cantidadNum >= 1

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold!">Agregar unidades</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          label="Cantidad de unidades"
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          fullWidth
          className="mt-2!"
          slotProps={{ htmlInput: { min: 1 } }}
          helperText="Se numeran a continuación de la última"
        />
        <TextField
          select
          label="Estado inicial"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EquipoEstado)}
          fullWidth
        >
          {ESTADOS_EQUIPO.filter((e) => e !== 'DADO_DE_BAJA').map((valor) => (
            <MenuItem key={valor} value={valor}>
              {ESTILO_EQUIPO_ESTADO[valor].label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ubicación inicial"
          value={ubicacionId}
          onChange={(e) => setUbicacionId(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
        >
          <MenuItem value="">— Sin ubicación —</MenuItem>
          {ubicaciones.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nota (opcional)"
          placeholder='Ej: "Compra 2026"'
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
          disabled={guardando || !valida}
          onClick={() =>
            onConfirmar({
              cantidad: cantidadNum,
              estado,
              ubicacionId: ubicacionId === '' ? null : ubicacionId,
              nota: nota.trim() || undefined,
            })
          }
        >
          {guardando ? 'Agregando...' : 'Agregar'}
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
    const unidad = unidadDeAccion(accion)
    if (abierto && unidad) {
      setNumeroSerie(unidad.numeroSerie ?? '')
      setFechaVencimiento(unidad.fechaVencimiento ?? '')
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
            unidadDeAccion(accion)?.fechaVencimiento
              ? `Actual: ${formatearFecha(unidadDeAccion(accion)?.fechaVencimiento)}`
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
