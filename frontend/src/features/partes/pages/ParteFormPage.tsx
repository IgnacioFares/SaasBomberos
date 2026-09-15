import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import BotonVolver from '../../../components/BotonVolver'
import type { ParteFormData, TipoParte } from '../types'
import { aRequestBody, crearFormularioVacio, TIPOS_CON_AMPLIATORIO, TIPOS_CON_SUPERFICIE_AFECTADA, TIPOS_CON_VEHICULOS, tituloDeTipo } from '../constants'
import { crearParte, actualizarParte, finalizarParte, getParte } from '../services/partesService'
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

const Seccion = ({ titulo, children, defaultExpanded = true }: { titulo: string; children: React.ReactNode; defaultExpanded?: boolean }) => (
  <Accordion defaultExpanded={defaultExpanded} className="rounded-xl! border border-slate-200 shadow-none! before:content-none!">
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
      <Typography className="font-semibold!">{titulo}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
)

const ParteFormPage = () => {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>()
  const navigate = useNavigate()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_PARTES)

  const esEdicion = !!id
  const [form, setForm] = useState<ParteFormData | null>(null)
  const [parteId, setParteId] = useState<number | null>(id ? Number(id) : null)
  const [numeroParte, setNumeroParte] = useState<number | null>(null)
  const [soloLectura, setSoloLectura] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        if (esEdicion && id) {
          const parte = await getParte(Number(id))
          setForm(parte)
          setParteId(parte.id)
          setNumeroParte(parte.numeroParte)
          setSoloLectura(!parte.puedeEditar)
        } else if (tipo) {
          setForm(crearFormularioVacio(tipo as TipoParte))
        } else {
          navigate('/partes/nuevo', { replace: true })
        }
      } catch (err) {
        setError(extraerMensajeError(err, 'Error al cargar el parte'))
      } finally {
        setLoading(false)
      }
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tipo])

  if (loading || !form) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  const actualizarCampo = <K extends keyof ParteFormData>(campo: K, valor: ParteFormData[K]) =>
    setForm((prev) => (prev ? { ...prev, [campo]: valor } : prev))

  const guardar = async (finalizar: boolean) => {
    if (!form.fechaHecho) {
      setError('La fecha del hecho es obligatoria')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      // `form` puede venir de getParte() (trae id, estado, numeroParte, etc.
      // además de los campos del formulario); se manda solo lo que espera
      // ParteRequest en el backend.
      const payload = aRequestBody(form)
      const guardado = parteId ? await actualizarParte(parteId, payload) : await crearParte(payload)
      setParteId(guardado.id)
      if (finalizar) {
        await finalizarParte(guardado.id)
        setMensajeExito('Parte finalizado.')
        navigate(`/partes/${guardado.id}`)
        return
      }
      setForm(guardado)
      setNumeroParte(guardado.numeroParte)
      setMensajeExito('Borrador guardado.')
      if (!esEdicion) {
        navigate(`/partes/${guardado.id}/editar`, { replace: true })
      }
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al guardar el parte'))
    } finally {
      setGuardando(false)
    }
  }

  const disabled = soloLectura || !puedeGestionar

  return (
    <Box className="flex flex-col gap-4">
      <BotonVolver to={esEdicion && parteId ? `/partes/${parteId}` : '/partes'} texto="Partes de intervención" />
      <Box>
        <Typography variant="h5" className="font-bold!">{tituloDeTipo(form.tipoParte)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {esEdicion ? `Editando parte ${numeroParte != null ? numeroParte : `#${parteId} (sin número asignado)`}` : 'Nuevo parte'}
        </Typography>
      </Box>

      {soloLectura && (
        <Alert severity="info">Este parte está finalizado; no se puede editar. Un administrador puede reabrirlo desde el detalle.</Alert>
      )}
      {!puedeGestionar && (
        <Alert severity="warning">No tenés el permiso para crear o editar partes de intervención.</Alert>
      )}
      {error && <Alert severity="error" variant="outlined">{error}</Alert>}
      {mensajeExito && <Alert severity="success" onClose={() => setMensajeExito(null)}>{mensajeExito}</Alert>}

      <Seccion titulo="Datos generales">
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="N° Parte"
            value={numeroParte != null ? numeroParte : 'Se asigna al finalizar'}
            disabled
          />
          <TextField label="N° Ruba" value={form.numeroRuba} onChange={(e) => actualizarCampo('numeroRuba', e.target.value)} disabled={disabled} />
          <TextField
            label="Fecha del hecho"
            type="date"
            value={form.fechaHecho}
            onChange={(e) => actualizarCampo('fechaHecho', e.target.value)}
            disabled={disabled}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label="Cuerpo participante" value={form.cuerpoParticipante} onChange={(e) => actualizarCampo('cuerpoParticipante', e.target.value)} disabled={disabled} />
        </Box>
      </Seccion>

      {form.tipoParte === 'SERVICIOS_FALSA_ALARMA' ? (
        <Seccion titulo="Detalle">
          <FalsaAlarmaCampos value={form.datosFalsaAlarma} onChange={(v) => actualizarCampo('datosFalsaAlarma', v)} disabled={disabled} />
        </Seccion>
      ) : TIPOS_CON_AMPLIATORIO.includes(form.tipoParte) ? (
        <Seccion titulo="Ampliatorio">
          <TextField
            value={form.ampliatorio}
            onChange={(e) => actualizarCampo('ampliatorio', e.target.value)}
            disabled={disabled}
            fullWidth
            multiline
            minRows={3}
            placeholder="Descripción libre de lo sucedido"
          />
        </Seccion>
      ) : null}

      <Seccion titulo="Localización y datos del solicitante">
        <Box className="flex flex-col gap-4">
          <LocalizacionBlock value={form.localizacion} onChange={(v) => actualizarCampo('localizacion', v)} disabled={disabled} />
          <SolicitanteBlock value={form.solicitante} onChange={(v) => actualizarCampo('solicitante', v)} disabled={disabled} />
        </Box>
      </Seccion>

      <Seccion titulo="Datos específicos">
        <Box className="flex flex-col gap-5">
          {TIPOS_CON_VEHICULOS.includes(form.tipoParte) && (
            <Box>
              <Typography variant="subtitle2" className="mb-2! font-semibold!">
                {form.tipoParte === 'ACCIDENTE' ? 'Vehículos intervinientes' : 'Vehículos afectados'}
              </Typography>
              <VehiculosTable value={form.vehiculos} onChange={(v) => actualizarCampo('vehiculos', v)} disabled={disabled} />
            </Box>
          )}

          {TIPOS_CON_SUPERFICIE_AFECTADA.includes(form.tipoParte) && (
            <Box>
              <Typography variant="subtitle2" className="mb-2! font-semibold!">Datos de la superficie afectada</Typography>
              <SuperficieAfectadaBlock value={form.superficieAfectada} onChange={(v) => actualizarCampo('superficieAfectada', v)} disabled={disabled} />
            </Box>
          )}

          {form.tipoParte === 'ACCIDENTE' && (
            <AccidenteCampos value={form.datosAccidente} onChange={(v) => actualizarCampo('datosAccidente', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'INCENDIO_INDUSTRIAL' && (
            <IncendioIndustrialCampos value={form.datosIncendioIndustrial} onChange={(v) => actualizarCampo('datosIncendioIndustrial', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'INCENDIO_FORESTAL' && (
            <IncendioIndustrialCampos
              value={form.datosIncendioIndustrial}
              onChange={(v) => actualizarCampo('datosIncendioIndustrial', v)}
              forestal={{ value: form.datosIncendioForestalLugar, onChange: (v) => actualizarCampo('datosIncendioForestalLugar', v) }}
              disabled={disabled}
            />
          )}
          {form.tipoParte === 'INCENDIO_VIVIENDA' && (
            <IncendioViviendaCampos value={form.datosIncendioVivienda} onChange={(v) => actualizarCampo('datosIncendioVivienda', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'SERVICIOS_ESPECIALES_CAPACITACION' && (
            <CapacitacionCampos value={form.datosCapacitacion} onChange={(v) => actualizarCampo('datosCapacitacion', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'RESCATE' && (
            <RescateCampos value={form.datosRescate} onChange={(v) => actualizarCampo('datosRescate', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'MATERIALES_PELIGROSOS' && (
            <MaterialesPeligrososCampos value={form.datosMaterialesPeligrosos} onChange={(v) => actualizarCampo('datosMaterialesPeligrosos', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'SERVICIOS_ESPECIALES' && (
            <ServiciosEspecialesCampos value={form.datosServiciosEspeciales} onChange={(v) => actualizarCampo('datosServiciosEspeciales', v)} disabled={disabled} />
          )}
          {form.tipoParte === 'INCENDIO_VEHICULAR' && (
            <Typography variant="caption" color="text.secondary">
              Este tipo de parte no tiene campos adicionales más allá de los vehículos y la superficie afectada de arriba.
            </Typography>
          )}
        </Box>
      </Seccion>

      <Seccion titulo="Personas damnificadas">
        <PersonasDamnificadasTable value={form.personasDamnificadas} onChange={(v) => actualizarCampo('personasDamnificadas', v)} disabled={disabled} />
      </Seccion>

      <Seccion titulo="Datos primordiales">
        <DatosPrimordialesBlock value={form.datosPrimordiales} onChange={(v) => actualizarCampo('datosPrimordiales', v)} disabled={disabled} />
      </Seccion>

      <Seccion titulo="Entidades que intervino">
        <EntidadesIntervinoTable value={form.entidadesIntervino} onChange={(v) => actualizarCampo('entidadesIntervino', v)} disabled={disabled} />
      </Seccion>

      {!disabled && (
        <Box className="flex flex-col gap-2 pb-6 sm:flex-row sm:justify-end">
          <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="outlined" color="primary" disabled={guardando} onClick={() => guardar(false)}>
            Guardar borrador
          </Button>
          <Button variant="contained" color="primary" disabled={guardando} onClick={() => guardar(true)}>
            Finalizar
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ParteFormPage
