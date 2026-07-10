import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from '@mui/material'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import DrawRoundedIcon from '@mui/icons-material/DrawRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import useRegistroDetalle from '../hooks/useRegistroDetalle'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import ResumenChips from '../components/ResumenChips'
import { ESTILO_ITEM_ESTADO, ESTILO_REGISTRO_ESTADO, formatearDuracion, formatearFechaHora } from '../constants'
import type { ResultadoResponse } from '../types'

const RegistroDetallePage = () => {
  const { id } = useParams<{ id: string }>()
  const { registro, cargando, firmando, error, firmar } = useRegistroDetalle(id ? Number(id) : null)
  const { tienePermiso } = usePermisos()
  const puedeFirmar = tienePermiso(PERMISOS.FIRMAR_CHECKLISTS)

  const [confirmarAbierto, setConfirmarAbierto] = useState(false)
  const [firmaExitosa, setFirmaExitosa] = useState(false)

  const hayDiferencias =
    registro != null &&
    (registro.resumen.faltantes > 0 || registro.resumen.sobrantes > 0 || registro.resumen.novedades > 0)

  const [soloDiferencias, setSoloDiferencias] = useState<boolean | null>(null)
  // Por defecto, si hay diferencias se muestran solo esas: el encargado
  // revisa únicamente lo que importa.
  const mostrarSoloDiferencias = soloDiferencias ?? hayDiferencias

  const esDiferencia = (r: ResultadoResponse) =>
    r.estado !== 'CORRECTO' || Boolean(r.observacion?.trim())

  const secciones = useMemo(() => {
    if (!registro) return []
    const mapa = new Map<string, ResultadoResponse[]>()
    for (const resultado of registro.resultados) {
      const lista = mapa.get(resultado.seccionNombre) ?? []
      lista.push(resultado)
      mapa.set(resultado.seccionNombre, lista)
    }
    return [...mapa.entries()]
  }, [registro])

  const handleFirmar = async () => {
    const ok = await firmar()
    setConfirmarAbierto(false)
    if (ok) setFirmaExitosa(true)
  }

  if (cargando) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    )
  }

  if (!registro) {
    return (
      <Alert severity="error" variant="outlined">
        {error ?? 'Registro no encontrado'}
      </Alert>
    )
  }

  const estiloEstado = ESTILO_REGISTRO_ESTADO[registro.estado]
  const duracion = formatearDuracion(registro.duracionSegundos)

  const metaRow = (icono: React.ReactElement, contenido: React.ReactNode, key: string) => (
    <Box key={key} className="flex items-center gap-1.5">
      {icono}
      <Typography variant="body2" color="text.secondary">
        {contenido}
      </Typography>
    </Box>
  )

  return (
    <Box className="flex flex-col gap-4 pb-24">
      <Paper elevation={0} className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 sm:p-6">
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Box className="min-w-0">
            <Typography variant="h5" className="font-bold! leading-tight!">
              {registro.templateNombre}
            </Typography>
            <Chip
              icon={<DirectionsCarFilledRoundedIcon sx={{ color: '#0D9488!important' }} />}
              label={registro.movilidadNombre}
              size="small"
              className="mt-1.5!"
              sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
            />
          </Box>
          <Chip
            label={estiloEstado.label}
            sx={{ bgcolor: estiloEstado.bg, color: estiloEstado.color, fontWeight: 700 }}
          />
        </Box>

        <Divider />

        <Box className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {metaRow(
            <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
            formatearFechaHora(registro.fecha),
            'fecha'
          )}
          {metaRow(
            <PersonRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
            <>Responsable: {registro.realizadoPorNombre}</>,
            'responsable'
          )}
          {registro.participantes.length > 0 &&
            metaRow(
              <GroupsRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
              <>Participaron: {registro.participantes.map((p) => p.nombre).join(', ')}</>,
              'participantes'
            )}
          {duracion &&
            metaRow(
              <TimerOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
              <>Duración: {duracion}</>,
              'duracion'
            )}
          {registro.firmadoPorNombre &&
            registro.firmadoEn &&
            metaRow(
              <DrawRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />,
              <>
                Firmado por {registro.firmadoPorNombre} · {formatearFechaHora(registro.firmadoEn)}
              </>,
              'firma'
            )}
        </Box>

        <ResumenChips resumen={registro.resumen} />

        {registro.observacionGeneral && (
          <Alert severity="info" variant="outlined" icon={false}>
            <Typography variant="body2">
              <strong>Observación general:</strong> {registro.observacionGeneral}
            </Typography>
          </Alert>
        )}
      </Paper>

      {firmaExitosa && (
        <Alert severity="success" icon={<CheckCircleRoundedIcon />}>
          Checklist firmado correctamente.
        </Alert>
      )}

      {error && !firmaExitosa && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Box className="flex items-center justify-between gap-2">
        <Typography variant="subtitle1" className="font-semibold!">
          Detalle por sección
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={mostrarSoloDiferencias}
              onChange={(e) => setSoloDiferencias(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Solo diferencias</Typography>}
        />
      </Box>

      {secciones.map(([nombreSeccion, resultados]) => {
        const visibles = mostrarSoloDiferencias ? resultados.filter(esDiferencia) : resultados
        if (visibles.length === 0) return null
        return (
          <Paper key={nombreSeccion} elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
            <Typography variant="subtitle2" className="mb-2! font-semibold! uppercase tracking-wide" color="text.secondary">
              {nombreSeccion}
            </Typography>
            <Box className="flex flex-col divide-y divide-slate-100">
              {visibles.map((resultado, index) => {
                const estilo = ESTILO_ITEM_ESTADO[resultado.estado]
                return (
                  <Box key={`${resultado.itemNombre}-${index}`} className="flex flex-col gap-1 py-2.5">
                    <Box className="flex flex-wrap items-center justify-between gap-2">
                      <Typography variant="body1" className="font-medium!">
                        {resultado.itemNombre}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        {resultado.cantidadEsperada != null && resultado.cantidadEncontrada != null && (
                          <Typography variant="caption" color="text.secondary" className="tabular-nums">
                            esperados {resultado.cantidadEsperada} · encontrados {resultado.cantidadEncontrada}
                          </Typography>
                        )}
                        <Chip
                          label={estilo.label}
                          size="small"
                          sx={{ bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
                        />
                      </Box>
                    </Box>
                    {resultado.observacion && (
                      <Typography variant="body2" color="text.secondary" className="italic">
                        "{resultado.observacion}"
                      </Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Paper>
        )
      })}

      {mostrarSoloDiferencias && !hayDiferencias && registro.resumen.conObservacion === 0 && (
        <Paper elevation={0} className="rounded-2xl! flex flex-col items-center gap-2 border border-slate-200 p-8 text-center">
          <CheckCircleRoundedIcon sx={{ fontSize: 40, color: '#16A34A' }} />
          <Typography variant="body2" color="text.secondary">
            No hay diferencias: todos los elementos controlados están correctos.
          </Typography>
        </Paper>
      )}

      {registro.estado === 'PENDIENTE_FIRMA' && !puedeFirmar && (
        <Alert severity="info" variant="outlined">
          Este checklist está pendiente de firma. Solo el personal autorizado puede firmarlo.
        </Alert>
      )}

      {registro.estado === 'PENDIENTE_FIRMA' && puedeFirmar && (
        <Paper
          elevation={3}
          className="rounded-2xl! flex items-center justify-between gap-3 p-3 sm:p-4"
          sx={{ position: 'sticky', bottom: 12, zIndex: 10 }}
        >
          <Typography variant="body2" color="text.secondary" className="font-medium!">
            Revisá el resumen y firmá el control
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DrawRoundedIcon />}
            disabled={firmando}
            onClick={() => setConfirmarAbierto(true)}
          >
            Firmar checklist
          </Button>
        </Paper>
      )}

      <Dialog open={confirmarAbierto} onClose={() => setConfirmarAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Confirmar firma</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vas a firmar el checklist de <strong>{registro.movilidadNombre}</strong> realizado por{' '}
            {registro.realizadoPorNombre}. La firma queda registrada con tu nombre, fecha y hora.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setConfirmarAbierto(false)} color="inherit" disabled={firmando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DrawRoundedIcon />}
            onClick={handleFirmar}
            disabled={firmando}
          >
            {firmando ? 'Firmando...' : 'Confirmar firma'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RegistroDetallePage
