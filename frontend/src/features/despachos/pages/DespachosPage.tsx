import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import useDespachos from '../hooks/useDespachos'
import useMovilidades from '../../movilidades/hooks/useMovilidades'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import DespachoCard from '../components/DespachoCard'
import DespachoDialog from '../components/DespachoDialog'
import BaseOperativaCard from '../components/BaseOperativaCard'
import FiltroPeriodo from '../components/FiltroPeriodo'
import ResumenKilometraje from '../components/ResumenKilometraje'
import TablaSalidas from '../components/TablaSalidas'
import {
  aniosConSalidas,
  etiquetaPeriodo,
  filtrarPorPeriodo,
  kilometrajePorMovilidad,
  periodoDelMesActual,
  resumirKilometraje,
} from '../kilometraje'
import type { Despacho, NuevoDespacho } from '../types'

const DespachosPage = () => {
  const { despachos, loading, error, setError, despachar, finalizar, eliminar } = useDespachos()
  const { movilidades } = useMovilidades()
  const { esAdmin, tienePermiso } = usePermisos()
  const navigate = useNavigate()

  const puedeDespachar = tienePermiso(PERMISOS.DESPACHAR_MOVILIDADES)

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [finalizando, setFinalizando] = useState<Despacho | null>(null)
  const [eliminando, setEliminando] = useState<Despacho | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState(periodoDelMesActual)

  // Las salidas en curso se muestran siempre, sin importar el período:
  // son lo urgente, no parte del registro histórico.
  const enCurso = despachos.filter((d) => d.estado === 'EN_CURSO')
  const transmitiendo = enCurso.reduce((total, d) => total + d.enVivo, 0)

  const anios = useMemo(() => aniosConSalidas(despachos), [despachos])
  const delPeriodo = useMemo(() => filtrarPorPeriodo(despachos, periodo), [despachos, periodo])
  const resumen = useMemo(() => resumirKilometraje(delPeriodo), [delPeriodo])
  const porMovilidad = useMemo(() => kilometrajePorMovilidad(delPeriodo), [delPeriodo])
  const etiqueta = etiquetaPeriodo(periodo)

  const handleDespachar = async (nuevo: NuevoDespacho) => {
    setGuardando(true)
    const creado = await despachar(nuevo)
    setGuardando(false)
    if (creado) {
      setDialogAbierto(false)
      // Se entra directo al mapa: es lo que se quiere mirar apenas sale
      // la movilidad.
      navigate(`/despachos/${creado.id}`)
    }
  }

  const confirmarFinalizar = async () => {
    if (finalizando) {
      const ok = await finalizar(finalizando.id)
      if (ok) setMensajeExito(`Despacho de "${finalizando.movilidadNombre}" finalizado.`)
    }
    setFinalizando(null)
  }

  const confirmarEliminar = async () => {
    if (eliminando) {
      const ok = await eliminar(eliminando.id)
      if (ok) setMensajeExito('Despacho eliminado del historial.')
    }
    setEliminando(null)
  }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Despachos y rastreo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro de salidas y kilometraje de la flota, con la ubicación en vivo del personal.
          </Typography>
        </Box>
        {puedeDespachar && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            className="self-start! sm:self-auto!"
            onClick={() => {
              setError(null)
              setDialogAbierto(true)
            }}
          >
            Despachar movilidad
          </Button>
        )}
      </Box>

      {mensajeExito && (
        <Alert severity="success" onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}
      {error && !dialogAbierto && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {/* En curso: lo que está pasando ahora, con acceso directo al mapa. */}
      {enCurso.length > 0 && (
        <Box className="flex flex-col gap-3">
          <Box className="flex flex-wrap items-center gap-2">
            <Typography variant="subtitle2" className="font-bold!">
              En curso
            </Typography>
            <Chip
              label={`${enCurso.length} en la calle`}
              size="small"
              sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }}
            />
            <Chip
              label={`${transmitiendo} transmitiendo ubicación`}
              size="small"
              sx={{
                bgcolor: transmitiendo > 0 ? '#DCFCE7' : '#F1F5F9',
                color: transmitiendo > 0 ? '#15803D' : '#64748B',
                fontWeight: 700,
              }}
            />
          </Box>
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enCurso.map((despacho) => (
              <DespachoCard
                key={despacho.id}
                despacho={despacho}
                puedeDespachar={puedeDespachar}
                onAbrirMapa={(d) => navigate(`/despachos/${d.id}`)}
                onFinalizar={setFinalizando}
                onEliminar={setEliminando}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Box className="lg:col-span-2">
          <FiltroPeriodo periodo={periodo} anios={anios} onCambiar={setPeriodo} />
        </Box>
        <BaseOperativaCard puedeEditar={esAdmin} />
      </Box>

      <ResumenKilometraje
        resumen={resumen}
        porMovilidad={porMovilidad}
        etiquetaPeriodo={etiqueta}
      />

      <Box className="flex flex-col gap-3">
        <Typography variant="subtitle2" className="font-bold!">
          Salidas de {etiqueta.toLowerCase()}
        </Typography>

        {loading && despachos.length === 0 ? (
          <Box className="flex justify-center py-16">
            <CircularProgress />
          </Box>
        ) : delPeriodo.length === 0 ? (
          <Box className="flex flex-col items-center gap-2 py-16 text-center">
            <MyLocationRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
            <Typography variant="body2" color="text.secondary">
              No hay salidas registradas en este período.
            </Typography>
          </Box>
        ) : (
          <>
            {/* La tabla se lee mal en un celular: ahí van las tarjetas. */}
            <Box className="hidden sm:block">
              <TablaSalidas
                despachos={delPeriodo}
                loading={loading}
                puedeDespachar={puedeDespachar}
                onFinalizar={setFinalizando}
                onEliminar={setEliminando}
              />
            </Box>
            <Box className="grid grid-cols-1 gap-4 sm:hidden">
              {delPeriodo.map((despacho) => (
                <DespachoCard
                  key={despacho.id}
                  despacho={despacho}
                  puedeDespachar={puedeDespachar}
                  onAbrirMapa={(d) => navigate(`/despachos/${d.id}`)}
                  onFinalizar={setFinalizando}
                  onEliminar={setEliminando}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      <DespachoDialog
        open={dialogAbierto}
        movilidades={movilidades}
        guardando={guardando}
        error={dialogAbierto ? error : null}
        onCerrar={() => setDialogAbierto(false)}
        onGuardar={handleDespachar}
      />

      <Dialog open={finalizando !== null} onClose={() => setFinalizando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Finalizar despacho</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{finalizando?.movilidadNombre}" vuelve a quedar disponible y el personal deja de
            compartir su ubicación. Recién ahí la salida suma al kilometraje del período.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setFinalizando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmarFinalizar}>
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={eliminando !== null} onClose={() => setEliminando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar despacho</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se borra la salida de "{eliminando?.movilidadNombre}" junto con su recorrido, y sus
            kilómetros dejan de contar en el período. Esto no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEliminando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DespachosPage
