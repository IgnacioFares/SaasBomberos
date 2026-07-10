import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
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
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import useEquipoDetalle from '../hooks/useEquipoDetalle'
import useUbicaciones from '../hooks/useUbicaciones'
import MovimientosTimeline from '../components/MovimientosTimeline'
import {
  AgregarUnidadesDialog,
  AjustarStockDialog,
  CambiarEstadoDialog,
  CambiarUbicacionDialog,
  EditarUnidadDialog,
  MoverStockDialog,
  ObservacionDialog,
  type AccionEquipo,
} from '../components/EquipoAccionDialogs'
import { ESTILO_EQUIPO_ESTADO, ESTILO_VENCIMIENTO, formatearFecha } from '../constants'
import { unidadDeAccion } from '../utils'
import type { EquipoUnidad } from '../types'

const EquipoDetallePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const mensajeInicial = (location.state as { mensaje?: string } | null)?.mensaje ?? null

  const {
    equipo,
    movimientos,
    cargando,
    guardando,
    error,
    cambiarEstado,
    cambiarUbicacion,
    agregarObservacion,
    moverStock,
    ajustarStock,
    agregarUnidades,
    actualizarUnidad,
    eliminar,
  } = useEquipoDetalle(id ? Number(id) : null)
  const { ubicaciones } = useUbicaciones()

  const [mensajeExito, setMensajeExito] = useState<string | null>(mensajeInicial)
  const [accion, setAccion] = useState<AccionEquipo | null>(null)
  const [confirmarBaja, setConfirmarBaja] = useState(false)
  const [menuUnidad, setMenuUnidad] = useState<{ anchor: HTMLElement; unidad: EquipoUnidad } | null>(null)

  const cerrarAccion = () => setAccion(null)

  const alTerminar = (ok: boolean, mensaje: string) => {
    if (ok) {
      setAccion(null)
      setMensajeExito(mensaje)
    }
  }

  if (cargando) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!equipo) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Equipo no encontrado'}
      </Alert>
    )
  }

  const porUnidad = equipo.seguimiento === 'POR_UNIDAD'
  const estiloVencimiento = ESTILO_VENCIMIENTO[equipo.estadoVencimiento]

  const dato = (etiqueta: string, valor?: React.ReactNode) =>
    valor != null && valor !== '' ? (
      <Box key={etiqueta}>
        <Typography variant="caption" color="text.secondary">
          {etiqueta}
        </Typography>
        <Typography variant="body2" className="font-medium!">
          {valor}
        </Typography>
      </Box>
    ) : null

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex items-center gap-2">
        <IconButton onClick={() => navigate('/inventario')} aria-label="Volver al inventario">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Inventario / {equipo.categoriaNombre}
        </Typography>
      </Box>

      {mensajeExito && (
        <Alert severity="success" onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {/* Encabezado */}
      <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 sm:p-6">
        <Box className="flex flex-wrap items-start justify-between gap-3">
          <Box className="min-w-0">
            <Typography variant="h5" className="font-bold! leading-tight!">
              {equipo.nombre}
            </Typography>
            <Box className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {equipo.codigoInterno && (
                <Chip
                  icon={<QrCode2RoundedIcon />}
                  label={equipo.codigoInterno}
                  size="small"
                  sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }}
                />
              )}
              <Chip
                icon={<CategoryRoundedIcon sx={{ fontSize: 16 }} />}
                label={
                  equipo.subcategoriaNombre
                    ? `${equipo.categoriaNombre} · ${equipo.subcategoriaNombre}`
                    : equipo.categoriaNombre
                }
                size="small"
                sx={{ bgcolor: '#EFF4FF', color: '#1E3A8A', fontWeight: 600 }}
              />
              {equipo.estadoVencimiento !== 'SIN_VENCIMIENTO' && (
                <Chip
                  icon={<EventRoundedIcon sx={{ fontSize: 16 }} />}
                  label={estiloVencimiento.label}
                  size="small"
                  sx={{ bgcolor: estiloVencimiento.bg, color: estiloVencimiento.color, fontWeight: 700 }}
                />
              )}
            </Box>
          </Box>
          <Box className="flex shrink-0 items-center gap-1">
            <Button
              component={RouterLink}
              to={`/inventario/${equipo.id}/editar`}
              variant="outlined"
              size="small"
              startIcon={<EditRoundedIcon />}
            >
              Editar
            </Button>
            <Tooltip title="Eliminar del inventario">
              <IconButton color="error" onClick={() => setConfirmarBaja(true)} aria-label="Eliminar equipo">
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {equipo.descripcion && (
          <Typography variant="body2" color="text.secondary">
            {equipo.descripcion}
          </Typography>
        )}

        <Divider />

        <Box className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {dato(
            'Cantidad',
            equipo.cantidad != null
              ? `${equipo.cantidad}${equipo.unidadMedida ? ` ${equipo.unidadMedida}` : ''}`
              : null
          )}
          {dato('Marca', equipo.marca)}
          {dato('Modelo', equipo.modelo)}
          {dato('N° de serie', equipo.numeroSerie)}
          {dato('Fecha de compra', equipo.fechaCompra ? formatearFecha(equipo.fechaCompra) : null)}
          {dato('Vencimiento', equipo.fechaVencimiento ? formatearFecha(equipo.fechaVencimiento) : null)}
        </Box>

        {equipo.observaciones && (
          <Alert severity="info" variant="outlined" icon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}>
            {equipo.observaciones}
          </Alert>
        )}

        <Box className="flex flex-wrap gap-2">
          <Button
            size="small"
            variant="outlined"
            startIcon={<ChatBubbleOutlineRoundedIcon />}
            onClick={() => setAccion({ tipo: 'observacion' })}
          >
            Agregar observación
          </Button>
        </Box>
      </Paper>

      {/* Stock por ubicación (POR_CANTIDAD): el total se reparte entre
          ubicaciones/estados y se opera con Mover / Ajustar. */}
      {!porUnidad && (
        <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
          <Box className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Typography variant="subtitle1" className="font-semibold!">
              Stock por ubicación (total: {equipo.cantidad ?? 0}
              {equipo.unidadMedida ? ` ${equipo.unidadMedida}` : ''})
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAccion({ tipo: 'ajustar-stock' })}
            >
              Agregar stock
            </Button>
          </Box>
          {equipo.stock.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-4 text-center">
              Sin stock cargado. Usá "Agregar stock" para sumar existencias.
            </Typography>
          ) : (
            <Box className="flex flex-col divide-y divide-slate-100">
              {equipo.stock.map((linea) => {
                const estiloLinea = ESTILO_EQUIPO_ESTADO[linea.estado]
                return (
                  <Box key={linea.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Box className="flex min-w-0 flex-wrap items-center gap-2">
                      <Typography variant="h6" className="font-bold! tabular-nums">
                        {linea.cantidad}
                      </Typography>
                      <Chip
                        icon={<PlaceRoundedIcon sx={{ fontSize: 14 }} />}
                        label={linea.ubicacionNombre ?? 'Sin ubicación'}
                        size="small"
                        sx={{ height: 24, bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
                      />
                      <Chip
                        label={estiloLinea.label}
                        size="small"
                        sx={{ height: 24, bgcolor: estiloLinea.bg, color: estiloLinea.color, fontWeight: 700 }}
                      />
                    </Box>
                    <Box className="flex shrink-0 items-center gap-1">
                      <Button
                        size="small"
                        startIcon={<SwapHorizRoundedIcon />}
                        onClick={() => setAccion({ tipo: 'mover-stock', linea })}
                      >
                        Mover
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        sx={{ color: '#64748B' }}
                        startIcon={<EditRoundedIcon />}
                        onClick={() => setAccion({ tipo: 'ajustar-stock', linea })}
                      >
                        Ajustar
                      </Button>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </Paper>
      )}

      {/* Unidades individuales */}
      {porUnidad && (
        <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
          <Box className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Typography variant="subtitle1" className="font-semibold!">
              Unidades ({equipo.unidades.length})
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => setAccion({ tipo: 'agregar-unidades' })}
            >
              Agregar unidades
            </Button>
          </Box>
          <Box className="flex flex-col divide-y divide-slate-100">
            {equipo.unidades.map((unidad) => {
              const estiloUnidad = ESTILO_EQUIPO_ESTADO[unidad.estado]
              const estiloVencUnidad = ESTILO_VENCIMIENTO[unidad.estadoVencimiento]
              return (
                <Box key={unidad.id} className="flex items-center justify-between gap-2 py-2.5">
                  <Box className="min-w-0">
                    <Box className="flex flex-wrap items-center gap-1.5">
                      <Typography variant="body2" className="font-semibold!">
                        N°{unidad.numero}
                      </Typography>
                      {unidad.numeroSerie && (
                        <Typography variant="caption" color="text.secondary">
                          Serie: {unidad.numeroSerie}
                        </Typography>
                      )}
                      <Chip
                        label={estiloUnidad.label}
                        size="small"
                        sx={{ height: 22, bgcolor: estiloUnidad.bg, color: estiloUnidad.color, fontWeight: 700 }}
                      />
                      {unidad.ubicacionNombre && (
                        <Chip
                          icon={<PlaceRoundedIcon sx={{ fontSize: 14 }} />}
                          label={unidad.ubicacionNombre}
                          size="small"
                          sx={{ height: 22, bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
                        />
                      )}
                      {unidad.estadoVencimiento !== 'SIN_VENCIMIENTO' && (
                        <Chip
                          label={`${estiloVencUnidad.label}${unidad.fechaVencimiento ? ` · ${formatearFecha(unidad.fechaVencimiento)}` : ''}`}
                          size="small"
                          sx={{ height: 22, bgcolor: estiloVencUnidad.bg, color: estiloVencUnidad.color, fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    {unidad.observacion && (
                      <Typography variant="caption" color="text.secondary" className="mt-0.5! block italic">
                        "{unidad.observacion}"
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    aria-label={`Acciones unidad ${unidad.numero}`}
                    onClick={(e) => setMenuUnidad({ anchor: e.currentTarget, unidad })}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            })}
          </Box>
        </Paper>
      )}

      {/* Historial */}
      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
        <Box className="mb-3 flex items-center gap-2">
          <HistoryRoundedIcon sx={{ color: '#1E3A8A' }} />
          <Typography variant="subtitle1" className="font-semibold!">
            Historial de movimientos
          </Typography>
        </Box>
        <MovimientosTimeline movimientos={movimientos} />
      </Paper>

      {/* Menú por unidad */}
      <Menu
        anchorEl={menuUnidad?.anchor}
        open={menuUnidad !== null}
        onClose={() => setMenuUnidad(null)}
      >
        {(
          [
            { tipo: 'estado', icono: <SwapHorizRoundedIcon fontSize="small" />, label: 'Cambiar estado' },
            { tipo: 'ubicacion', icono: <PlaceRoundedIcon fontSize="small" />, label: 'Cambiar ubicación' },
            { tipo: 'observacion', icono: <ChatBubbleOutlineRoundedIcon fontSize="small" />, label: 'Observación' },
            { tipo: 'editar-unidad', icono: <EditRoundedIcon fontSize="small" />, label: 'Serie y vencimiento' },
          ] as const
        ).map((item) => (
          <MenuItem
            key={item.tipo}
            onClick={() => {
              if (menuUnidad) setAccion({ tipo: item.tipo, unidad: menuUnidad.unidad })
              setMenuUnidad(null)
            }}
          >
            <ListItemIcon>{item.icono}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Dialogs de acciones */}
      <CambiarEstadoDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        estadoActual={equipo.estado}
        onConfirmar={async (estado, nota) =>
          alTerminar(
            await cambiarEstado({ estado, unidadId: unidadDeAccion(accion)?.id, nota: nota || undefined }),
            'Estado actualizado.'
          )
        }
      />
      <CambiarUbicacionDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        ubicaciones={ubicaciones}
        onConfirmar={async (ubicacionId, nota) =>
          alTerminar(
            await cambiarUbicacion({ ubicacionId, unidadId: unidadDeAccion(accion)?.id, nota: nota || undefined }),
            'Ubicación actualizada.'
          )
        }
      />
      <ObservacionDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        onConfirmar={async (observacion) =>
          alTerminar(
            await agregarObservacion({ observacion, unidadId: unidadDeAccion(accion)?.id }),
            'Observación guardada.'
          )
        }
      />
      <MoverStockDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        ubicaciones={ubicaciones}
        onConfirmar={async (data) => alTerminar(await moverStock(data), 'Stock movido.')}
      />
      <AjustarStockDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        ubicaciones={ubicaciones}
        onConfirmar={async (data) => alTerminar(await ajustarStock(data), 'Stock actualizado.')}
      />
      <AgregarUnidadesDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        ubicaciones={ubicaciones}
        onConfirmar={async (data) => alTerminar(await agregarUnidades(data), 'Unidades agregadas.')}
      />
      <EditarUnidadDialog
        accion={accion}
        guardando={guardando}
        onCerrar={cerrarAccion}
        onConfirmar={async (numeroSerie, fechaVencimiento) => {
          if (accion?.tipo !== 'editar-unidad') return
          alTerminar(
            await actualizarUnidad(accion.unidad.id, {
              numeroSerie: numeroSerie.trim() || null,
              fechaVencimiento: fechaVencimiento || null,
            }),
            'Unidad actualizada.'
          )
        }}
      />

      {/* Confirmación de baja */}
      <Dialog open={confirmarBaja} onClose={() => setConfirmarBaja(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar del inventario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{equipo.nombre}" se da de baja del inventario. Su historial de movimientos se
            conserva.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setConfirmarBaja(false)} color="inherit" disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={guardando}
            onClick={async () => {
              const ok = await eliminar()
              setConfirmarBaja(false)
              if (ok) {
                navigate('/inventario', {
                  replace: true,
                  state: { mensaje: `"${equipo.nombre}" fue dado de baja del inventario.` },
                })
              }
            }}
          >
            {guardando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EquipoDetallePage
