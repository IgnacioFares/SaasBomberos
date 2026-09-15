import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import BotonVolver from '../../../components/BotonVolver'
import type { Parte } from '../types'
import { TIPOS_CON_AMPLIATORIO, TIPOS_CON_SUPERFICIE_AFECTADA, TIPOS_CON_VEHICULOS } from '../constants'
import { descargarPdf, finalizarParte, getParte, reabrirParte } from '../services/partesService'
import { extraerMensajeError } from '../../../utils/http'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'

import LocalizacionBlock from '../components/blocks/LocalizacionBlock'
import SolicitanteBlock from '../components/blocks/SolicitanteBlock'
import DatosPrimordialesBlock from '../components/blocks/DatosPrimordialesBlock'
import SuperficieAfectadaBlock from '../components/blocks/SuperficieAfectadaBlock'
import PersonasDamnificadasTable from '../components/blocks/PersonasDamnificadasTable'
import EntidadesIntervinoTable from '../components/blocks/EntidadesIntervinoTable'
import VehiculosTable from '../components/blocks/VehiculosTable'

import AccidenteCampos from '../components/tipos/AccidenteCampos'
import IncendioIndustrialCampos from '../components/tipos/IncendioIndustrialCampos'
import IncendioViviendaCampos from '../components/tipos/IncendioViviendaCampos'
import CapacitacionCampos from '../components/tipos/CapacitacionCampos'
import RescateCampos from '../components/tipos/RescateCampos'
import MaterialesPeligrososCampos from '../components/tipos/MaterialesPeligrososCampos'
import ServiciosEspecialesCampos from '../components/tipos/ServiciosEspecialesCampos'
import FalsaAlarmaCampos from '../components/tipos/FalsaAlarmaCampos'

const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <Accordion defaultExpanded className="rounded-xl! border border-slate-200 shadow-none! before:content-none!">
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
      <Typography className="font-semibold!">{titulo}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
)

const noop = () => {}

const ParteDetallePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tienePermiso, esAdmin } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_PARTES)

  const [parte, setParte] = useState<Parte | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [confirmarAccion, setConfirmarAccion] = useState<'finalizar' | 'reabrir' | null>(null)

  const cargar = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setParte(await getParte(Number(id)))
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar el parte'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading || !parte) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  const handleFinalizar = async () => {
    setProcesando(true)
    setError(null)
    try {
      await finalizarParte(parte.id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al finalizar el parte'))
    } finally {
      setProcesando(false)
    }
  }

  const handleReabrir = async () => {
    setProcesando(true)
    setError(null)
    try {
      await reabrirParte(parte.id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al reabrir el parte'))
    } finally {
      setProcesando(false)
    }
  }

  const confirmarAccionPendiente = async () => {
    const accion = confirmarAccion
    setConfirmarAccion(null)
    if (accion === 'finalizar') await handleFinalizar()
    else if (accion === 'reabrir') await handleReabrir()
  }

  const handleDescargar = async () => {
    try {
      await descargarPdf(parte.id, `parte_${parte.tipoParte.toLowerCase()}_${parte.numeroParte || parte.id}.pdf`)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al descargar el PDF'))
    }
  }

  return (
    <Box className="flex flex-col gap-4">
      <BotonVolver to="/partes" texto="Partes de intervención" />
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Box>
          <Box className="flex flex-wrap items-center gap-2">
            <Typography variant="h5" className="font-bold!">{parte.tituloParte}</Typography>
            <Chip
              label={parte.estado === 'BORRADOR' ? 'Borrador' : 'Finalizado'}
              size="small"
              color={parte.estado === 'BORRADOR' ? 'warning' : 'success'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {parte.codigoFormulario} · N° {parte.numeroParte || 's/n'} · Ruba {parte.numeroRuba || 's/n'} · Creado por {parte.creadoPorNombre}
          </Typography>
        </Box>
        <Box className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={handleDescargar}>
            Descargar PDF
          </Button>
          {puedeGestionar && parte.puedeEditar && (
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => navigate(`/partes/${parte.id}/editar`)}>
              Editar
            </Button>
          )}
          {puedeGestionar && parte.estado === 'BORRADOR' && (
            <Button variant="contained" disabled={procesando} onClick={() => setConfirmarAccion('finalizar')}>
              Finalizar
            </Button>
          )}
          {esAdmin && parte.estado === 'FINALIZADO' && (
            <Button variant="outlined" color="warning" disabled={procesando} onClick={() => setConfirmarAccion('reabrir')}>
              Reabrir
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" variant="outlined">{error}</Alert>}

      {TIPOS_CON_AMPLIATORIO.includes(parte.tipoParte) && parte.ampliatorio && (
        <Seccion titulo="Ampliatorio">
          <Typography variant="body2" className="whitespace-pre-wrap">{parte.ampliatorio}</Typography>
        </Seccion>
      )}
      {parte.tipoParte === 'SERVICIOS_FALSA_ALARMA' && (
        <Seccion titulo="Detalle">
          <FalsaAlarmaCampos value={parte.datosFalsaAlarma} onChange={noop} disabled />
        </Seccion>
      )}

      <Seccion titulo="Localización y datos del solicitante">
        <Box className="flex flex-col gap-4">
          <LocalizacionBlock value={parte.localizacion} onChange={noop} disabled />
          <SolicitanteBlock value={parte.solicitante} onChange={noop} disabled />
        </Box>
      </Seccion>

      <Seccion titulo="Datos específicos">
        <Box className="flex flex-col gap-5">
          {TIPOS_CON_VEHICULOS.includes(parte.tipoParte) && (
            <VehiculosTable value={parte.vehiculos} onChange={noop} disabled />
          )}
          {TIPOS_CON_SUPERFICIE_AFECTADA.includes(parte.tipoParte) && (
            <SuperficieAfectadaBlock value={parte.superficieAfectada} onChange={noop} disabled />
          )}
          {parte.tipoParte === 'ACCIDENTE' && <AccidenteCampos value={parte.datosAccidente} onChange={noop} disabled />}
          {parte.tipoParte === 'INCENDIO_INDUSTRIAL' && (
            <IncendioIndustrialCampos value={parte.datosIncendioIndustrial} onChange={noop} disabled />
          )}
          {parte.tipoParte === 'INCENDIO_FORESTAL' && (
            <IncendioIndustrialCampos
              value={parte.datosIncendioIndustrial}
              onChange={noop}
              forestal={{ value: parte.datosIncendioForestalLugar, onChange: noop }}
              disabled
            />
          )}
          {parte.tipoParte === 'INCENDIO_VIVIENDA' && (
            <IncendioViviendaCampos value={parte.datosIncendioVivienda} onChange={noop} disabled />
          )}
          {parte.tipoParte === 'SERVICIOS_ESPECIALES_CAPACITACION' && (
            <CapacitacionCampos value={parte.datosCapacitacion} onChange={noop} disabled />
          )}
          {parte.tipoParte === 'RESCATE' && <RescateCampos value={parte.datosRescate} onChange={noop} disabled />}
          {parte.tipoParte === 'MATERIALES_PELIGROSOS' && (
            <MaterialesPeligrososCampos value={parte.datosMaterialesPeligrosos} onChange={noop} disabled />
          )}
          {parte.tipoParte === 'SERVICIOS_ESPECIALES' && (
            <ServiciosEspecialesCampos value={parte.datosServiciosEspeciales} onChange={noop} disabled />
          )}
        </Box>
      </Seccion>

      <Seccion titulo="Personas damnificadas">
        <PersonasDamnificadasTable value={parte.personasDamnificadas} onChange={noop} disabled />
      </Seccion>

      <Seccion titulo="Datos primordiales">
        <DatosPrimordialesBlock value={parte.datosPrimordiales} onChange={noop} disabled />
      </Seccion>

      <Seccion titulo="Entidades que intervino">
        <EntidadesIntervinoTable value={parte.entidadesIntervino} onChange={noop} disabled />
      </Seccion>

      <Dialog open={confirmarAccion !== null} onClose={() => setConfirmarAccion(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">
          {confirmarAccion === 'finalizar' ? 'Finalizar parte' : 'Reabrir parte'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmarAccion === 'finalizar'
              ? 'Una vez finalizado se le asigna el número de parte del mes y deja de poder editarse (salvo que un administrador lo reabra).'
              : 'El parte vuelve a borrador para poder corregirlo. Su número de parte ya asignado no cambia.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setConfirmarAccion(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={confirmarAccion === 'finalizar' ? 'primary' : 'warning'}
            onClick={confirmarAccionPendiente}
          >
            {confirmarAccion === 'finalizar' ? 'Finalizar' : 'Reabrir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ParteDetallePage
