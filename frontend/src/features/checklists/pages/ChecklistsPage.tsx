import { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import DrawRoundedIcon from '@mui/icons-material/DrawRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import useChecklistTemplates from '../hooks/useChecklistTemplates'
import useChecklistRegistros from '../hooks/useChecklistRegistros'
import ChecklistCard from '../components/ChecklistCard'
import RegistroCard from '../components/RegistroCard'
import type { ChecklistRegistroEstado } from '../types'

type TabActiva = 'realizar' | 'pendientes' | 'historial'

interface EstadoNavegacion {
  mensaje?: string
  tab?: TabActiva
}

const EmptyState = ({ icono, texto }: { icono: React.ReactElement; texto: string }) => (
  <Box className="flex flex-col items-center gap-2 py-16 text-center">
    {icono}
    <Typography variant="body2" color="text.secondary">
      {texto}
    </Typography>
  </Box>
)

const ChecklistsPage = () => {
  const location = useLocation()
  const estadoNav = (location.state as EstadoNavegacion | null) ?? {}

  const { templates, loading: cargandoTemplates, error: errorTemplates, eliminar } = useChecklistTemplates()
  const { registros, loading: cargandoRegistros, error: errorRegistros } = useChecklistRegistros()

  const [tab, setTab] = useState<TabActiva>(estadoNav.tab ?? 'realizar')
  const [mensajeExito, setMensajeExito] = useState<string | null>(estadoNav.mensaje ?? null)
  const [eliminarId, setEliminarId] = useState<number | null>(null)

  const [filtroMovilidad, setFiltroMovilidad] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<'' | ChecklistRegistroEstado>('')

  const pendientes = useMemo(
    () => registros.filter((r) => r.estado === 'PENDIENTE_FIRMA'),
    [registros]
  )

  const movilidadesConRegistros = useMemo(
    () => [...new Set(registros.map((r) => r.movilidadNombre))].sort(),
    [registros]
  )

  const historial = useMemo(
    () =>
      registros.filter(
        (r) =>
          (filtroMovilidad === '' || r.movilidadNombre === filtroMovilidad) &&
          (filtroEstado === '' || r.estado === filtroEstado)
      ),
    [registros, filtroMovilidad, filtroEstado]
  )

  const confirmarEliminar = async () => {
    if (eliminarId !== null) await eliminar(eliminarId)
    setEliminarId(null)
  }

  const cargando = tab === 'realizar' ? cargandoTemplates : cargandoRegistros
  const error = tab === 'realizar' ? errorTemplates : errorRegistros

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Checklists
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control diario del equipamiento de cada movilidad.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/checklists/nuevo"
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon />}
          className="self-start! sm:self-auto!"
        >
          Nuevo checklist
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, valor: TabActiva) => {
          setTab(valor)
          setMensajeExito(null)
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 600 } }}
      >
        <Tab value="realizar" label="Realizar" />
        <Tab
          value="pendientes"
          label={
            <Badge badgeContent={pendientes.length} color="warning" sx={{ '& .MuiBadge-badge': { right: -12 } }}>
              Pendientes de firma
            </Badge>
          }
        />
        <Tab value="historial" label="Historial" />
      </Tabs>

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

      {cargando ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <Fade in key={tab} timeout={300}>
          <Box className="flex flex-col gap-4">
            {tab === 'realizar' &&
              (templates.length === 0 ? (
                <EmptyState
                  icono={<ChecklistRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />}
                  texto='Todavía no hay checklists creados. Empezá con "Nuevo checklist".'
                />
              ) : (
                <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template) => (
                    <ChecklistCard key={template.id} template={template} onEliminar={setEliminarId} />
                  ))}
                </Box>
              ))}

            {tab === 'pendientes' &&
              (pendientes.length === 0 ? (
                <EmptyState
                  icono={<DrawRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />}
                  texto="No hay checklists pendientes de firma."
                />
              ) : (
                <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {pendientes.map((registro) => (
                    <RegistroCard key={registro.id} registro={registro} />
                  ))}
                </Box>
              ))}

            {tab === 'historial' && (
              <>
                <Box className="flex flex-col gap-3 sm:flex-row">
                  <TextField
                    select
                    label="Movilidad"
                    value={filtroMovilidad}
                    onChange={(e) => setFiltroMovilidad(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {movilidadesConRegistros.map((nombre) => (
                      <MenuItem key={nombre} value={nombre}>
                        {nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Estado"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as '' | ChecklistRegistroEstado)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="PENDIENTE_FIRMA">Pendiente de firma</MenuItem>
                    <MenuItem value="FIRMADO">Firmado</MenuItem>
                  </TextField>
                </Box>

                {historial.length === 0 ? (
                  <EmptyState
                    icono={<HistoryRoundedIcon sx={{ fontSize: 40, color: '#94A3B8' }} />}
                    texto={
                      registros.length === 0
                        ? 'Todavía no se realizó ningún checklist.'
                        : 'No hay checklists que coincidan con los filtros.'
                    }
                  />
                ) : (
                  <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {historial.map((registro) => (
                      <RegistroCard key={registro.id} registro={registro} />
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Fade>
      )}

      <Dialog open={eliminarId !== null} onClose={() => setEliminarId(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar checklist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            El checklist deja de estar disponible para realizar, pero el historial de controles ya
            hechos se conserva.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEliminarId(null)} color="inherit">
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

export default ChecklistsPage
