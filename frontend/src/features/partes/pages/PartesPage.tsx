import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useNavigate } from 'react-router-dom'
import usePartes from '../hooks/usePartes'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import { TIPOS_PARTE } from '../constants'
import { descargarPdf } from '../services/partesService'
import { extraerMensajeError } from '../../../utils/http'

const PartesPage = () => {
  const { partes, loading, error } = usePartes()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_PARTES)
  const navigate = useNavigate()

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroNumero, setFiltroNumero] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  const partesFiltrados = useMemo(() => {
    return partes.filter((p) => {
      if (filtroTipo && p.tipoParte !== filtroTipo) return false
      if (filtroNumero && !`${p.numeroParte ?? ''} ${p.numeroRuba ?? ''}`.toLowerCase().includes(filtroNumero.toLowerCase())) return false
      if (filtroUsuario && !p.creadoPorNombre.toLowerCase().includes(filtroUsuario.toLowerCase())) return false
      if (filtroDesde && (!p.fechaHecho || p.fechaHecho < filtroDesde)) return false
      if (filtroHasta && (!p.fechaHecho || p.fechaHecho > filtroHasta)) return false
      return true
    })
  }, [partes, filtroTipo, filtroNumero, filtroUsuario, filtroDesde, filtroHasta])

  const handleDescargar = async (id: number, tipo: string, numero: number | null) => {
    setErrorDescarga(null)
    try {
      await descargarPdf(id, `parte_${tipo.toLowerCase()}_${numero || id}.pdf`)
    } catch (err) {
      setErrorDescarga(extraerMensajeError(err, 'Error al descargar el PDF'))
    }
  }

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">Partes de intervención</Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de partes cargados, con filtros por tipo, fecha, número y usuario.
          </Typography>
        </Box>
        {puedeGestionar && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            className="self-start! sm:self-auto!"
            onClick={() => navigate('/partes/nuevo')}
          >
            Nuevo parte
          </Button>
        )}
      </Box>

      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4!">
        <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <TextField select label="Tipo" size="small" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {TIPOS_PARTE.map(({ tipo, titulo }) => (
              <MenuItem key={tipo} value={tipo}>{titulo}</MenuItem>
            ))}
          </TextField>
          <TextField label="N° Parte / Ruba" size="small" value={filtroNumero} onChange={(e) => setFiltroNumero(e.target.value)} />
          <TextField label="Usuario creador" size="small" value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} />
          <TextField label="Desde" type="date" size="small" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Hasta" type="date" size="small" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </Paper>

      {error && <Alert severity="error" variant="outlined">{error}</Alert>}
      {errorDescarga && <Alert severity="error" variant="outlined" onClose={() => setErrorDescarga(null)}>{errorDescarga}</Alert>}

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : partesFiltrados.length === 0 ? (
        <Box className="flex flex-col items-center gap-2 py-16 text-center">
          <DescriptionRoundedIcon sx={{ fontSize: 44, color: '#94A3B8' }} />
          <Typography variant="body2" color="text.secondary">No hay partes que coincidan con los filtros.</Typography>
        </Box>
      ) : (
        <Box className="flex flex-col gap-2">
          {partesFiltrados.map((p) => (
            <Paper
              key={p.id}
              elevation={0}
              className="flex flex-col gap-2 rounded-xl! border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Box className="flex min-w-0 flex-col gap-0.5">
                <Box className="flex flex-wrap items-center gap-2">
                  <Typography variant="body1" className="font-semibold!">{p.tituloParte}</Typography>
                  <Chip
                    label={p.estado === 'BORRADOR' ? 'Borrador' : 'Finalizado'}
                    size="small"
                    color={p.estado === 'BORRADOR' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  N° {p.numeroParte || 's/n'} · Ruba {p.numeroRuba || 's/n'} · {p.fechaHecho || 'sin fecha'} · {p.creadoPorNombre}
                </Typography>
              </Box>
              <Box className="flex shrink-0 items-center gap-1">
                <Tooltip title="Ver">
                  <IconButton size="small" onClick={() => navigate(`/partes/${p.id}`)}>
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Descargar PDF">
                  <IconButton size="small" onClick={() => handleDescargar(p.id, p.tipoParte, p.numeroParte)}>
                    <DownloadRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default PartesPage
