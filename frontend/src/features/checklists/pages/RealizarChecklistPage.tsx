import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { getTemplate, createRegistro } from '../services/checklistService'
import { extraerMensajeError } from '../../../utils/http'
import type { ChecklistTemplate, ResultadoRequest, ResumenRegistro, RespuestaItem } from '../types'
import { respuestaVacia } from '../constants'
import ItemControlRow from '../components/ItemControlRow'
import FinalizarChecklistDialog from '../components/FinalizarChecklistDialog'

type Respuestas = Record<number, RespuestaItem>

const RealizarChecklistPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [respuestas, setRespuestas] = useState<Respuestas>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  // Para medir cuánto tarda el control (se envía como duracionSegundos).
  // Se setea al terminar de cargar la plantilla, en el useEffect.
  const inicioRef = useRef<number>(0)

  useEffect(() => {
    if (!id) return
    getTemplate(Number(id))
      .then((t) => {
        setTemplate(t)
        const inicial: Respuestas = {}
        t.secciones.forEach((s) =>
          s.items.forEach((it) => {
            if (it.id) inicial[it.id] = respuestaVacia()
          })
        )
        setRespuestas(inicial)
        inicioRef.current = Date.now()
      })
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar el checklist')))
      .finally(() => setCargando(false))
  }, [id])

  const cambiarRespuesta = (itemId: number, cambios: Partial<RespuestaItem>) =>
    setRespuestas((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...cambios } }))

  const marcarSeccionOk = (seccionIndex: number) => {
    if (!template) return
    setRespuestas((prev) => {
      const siguiente = { ...prev }
      template.secciones[seccionIndex].items.forEach((it) => {
        // Solo los que siguen sin responder: no pisa novedades ya cargadas.
        if (it.id && siguiente[it.id]?.marcado === null) {
          siguiente[it.id] = {
            marcado: 'ok',
            cantidad: it.requiereCantidad ? (it.cantidadEsperada ?? 0) : null,
            observacion: '',
          }
        }
      })
      return siguiente
    })
  }

  const items = useMemo(
    () => (template ? template.secciones.flatMap((s) => s.items).filter((it) => it.id) : []),
    [template]
  )

  const respondidos = items.filter((it) => respuestas[it.id!]?.marcado !== null).length
  const obligatoriosPendientes = items.filter(
    (it) => it.obligatorio && respuestas[it.id!]?.marcado === null
  ).length
  const progreso = items.length > 0 ? (respondidos / items.length) * 100 : 0

  const resumen: ResumenRegistro = useMemo(() => {
    const r = { correctos: 0, faltantes: 0, sobrantes: 0, novedades: 0, noControlados: 0, conObservacion: 0 }
    for (const it of items) {
      const respuesta = respuestas[it.id!]
      if (!respuesta || respuesta.marcado === null) {
        r.noControlados++
        continue
      }
      if (respuesta.observacion.trim()) r.conObservacion++
      if (respuesta.marcado === 'ok') {
        r.correctos++
      } else if (it.requiereCantidad) {
        const diferencia = (respuesta.cantidad ?? 0) - (it.cantidadEsperada ?? 0)
        if (diferencia < 0) r.faltantes++
        else if (diferencia > 0) r.sobrantes++
        else r.correctos++
      } else {
        r.novedades++
      }
    }
    return r
  }, [items, respuestas])

  const handleConfirmar = async (participantesIds: number[], observacionGeneral: string) => {
    if (!template) return
    setGuardando(true)
    setError(null)

    const resultados: ResultadoRequest[] = []
    for (const it of items) {
      const respuesta = respuestas[it.id!]
      if (!respuesta || respuesta.marcado === null) continue
      const observacion = respuesta.observacion.trim() || undefined
      if (respuesta.marcado === 'ok') {
        resultados.push({ itemId: it.id!, ok: true })
      } else if (it.requiereCantidad) {
        resultados.push({ itemId: it.id!, cantidadEncontrada: respuesta.cantidad ?? 0, observacion })
      } else {
        resultados.push({ itemId: it.id!, ok: false, observacion })
      }
    }

    try {
      await createRegistro({
        templateId: template.id,
        observacionGeneral: observacionGeneral.trim() || undefined,
        duracionSegundos: Math.round((Date.now() - inicioRef.current) / 1000),
        participantesIds,
        resultados,
      })
      navigate('/checklists', {
        replace: true,
        state: {
          mensaje: `Checklist de ${template.movilidadNombre} enviado: quedó pendiente de firma.`,
          tab: 'pendientes',
        },
      })
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar el checklist'))
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!template) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Checklist no encontrado'}
      </Alert>
    )
  }

  return (
    <Box className="flex flex-col gap-4 pb-24">
      <Paper
        elevation={0}
        className="rounded-2xl! border border-slate-200 p-4 sm:p-5"
        sx={{ position: 'sticky', top: { xs: 64, sm: 8 }, zIndex: 10 }}
      >
        <Box className="flex flex-wrap items-center justify-between gap-2">
          <Box className="min-w-0">
            <Typography variant="h6" className="truncate font-bold! leading-tight!">
              {template.nombre}
            </Typography>
            <Chip
              icon={<DirectionsCarFilledRoundedIcon sx={{ color: '#0D9488!important' }} />}
              label={template.movilidadNombre}
              size="small"
              className="mt-1!"
              sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" className="tabular-nums">
            {respondidos}/{items.length} controlados
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progreso}
          className="mt-3! rounded-full"
          sx={{
            height: 8,
            bgcolor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 9999,
              background: 'linear-gradient(90deg, #1E3A8A, #0D9488)',
            },
          }}
        />
      </Paper>

      {template.secciones.map((seccion, seccionIndex) => {
        const pendientesSeccion = seccion.items.filter(
          (it) => it.id && respuestas[it.id]?.marcado === null
        ).length
        return (
          <Paper key={seccion.id ?? seccionIndex} elevation={0} className="rounded-2xl! border border-slate-200 p-3 sm:p-5">
            <Box className="mb-3 flex items-center justify-between gap-2">
              <Typography variant="subtitle1" className="font-semibold!">
                {seccion.nombre}
              </Typography>
              <Button
                size="small"
                startIcon={<DoneAllRoundedIcon />}
                onClick={() => marcarSeccionOk(seccionIndex)}
                disabled={pendientesSeccion === 0}
                sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Todo correcto
              </Button>
            </Box>
            <Box className="flex flex-col gap-2">
              {seccion.items.map(
                (item) =>
                  item.id && (
                    <ItemControlRow
                      key={item.id}
                      item={item}
                      respuesta={respuestas[item.id] ?? respuestaVacia()}
                      onCambiar={(cambios) => cambiarRespuesta(item.id!, cambios)}
                    />
                  )
              )}
            </Box>
          </Paper>
        )
      })}

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        className="rounded-2xl! flex items-center justify-between gap-3 p-3 sm:p-4"
        sx={{ position: 'sticky', bottom: 12, zIndex: 10 }}
      >
        <Typography variant="body2" color={obligatoriosPendientes > 0 ? 'text.secondary' : 'success.main'} className="font-medium!">
          {obligatoriosPendientes > 0
            ? `Faltan ${obligatoriosPendientes} ${obligatoriosPendientes === 1 ? 'ítem obligatorio' : 'ítems obligatorios'}`
            : 'Todo listo para enviar'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          disabled={obligatoriosPendientes > 0}
          onClick={() => setDialogAbierto(true)}
        >
          Continuar
        </Button>
      </Paper>

      <FinalizarChecklistDialog
        open={dialogAbierto}
        resumen={resumen}
        guardando={guardando}
        error={error}
        onCerrar={() => setDialogAbierto(false)}
        onConfirmar={handleConfirmar}
      />
    </Box>
  )
}

export default RealizarChecklistPage
