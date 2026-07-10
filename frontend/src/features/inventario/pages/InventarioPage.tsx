import { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import useEquipos from '../hooks/useEquipos'
import useCategorias from '../hooks/useCategorias'
import useUbicaciones from '../hooks/useUbicaciones'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import FiltrosInventario from '../components/FiltrosInventario'
import InventarioTabla from '../components/InventarioTabla'
import EquipoCardList from '../components/EquipoCardList'
import PanoramaInventario from '../components/PanoramaInventario'
import CategoriasAdmin from '../components/CategoriasAdmin'
import UbicacionesAdmin from '../components/UbicacionesAdmin'
import { FILTROS_VACIOS, filtrarEquipos, type FiltrosEquipos } from '../utils'

type TabActiva = 'inventario' | 'panorama' | 'configuracion'

const InventarioPage = () => {
  const location = useLocation()
  const mensajeInicial = (location.state as { mensaje?: string } | null)?.mensaje ?? null

  const { equipos, loading, error } = useEquipos()
  const { raices } = useCategorias()
  const { ubicaciones } = useUbicaciones()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_INVENTARIO)

  const [tab, setTab] = useState<TabActiva>('inventario')
  const [mensajeExito, setMensajeExito] = useState<string | null>(mensajeInicial)
  const [filtros, setFiltros] = useState<FiltrosEquipos>(FILTROS_VACIOS)

  const theme = useTheme()
  const esDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const equiposFiltrados = useMemo(() => filtrarEquipos(equipos, filtros), [equipos, filtros])

  return (
    <Box className="flex flex-col gap-5">
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h5" className="font-bold!">
            Inventario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control de stock y equipamiento del cuartel.
          </Typography>
        </Box>
        {puedeGestionar && (
          <Button
            component={RouterLink}
            to="/inventario/nuevo"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            className="self-start! sm:self-auto!"
          >
            Nuevo equipo
          </Button>
        )}
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
        <Tab value="inventario" label="Inventario" />
        <Tab value="panorama" label="Panorama" />
        {puedeGestionar && <Tab value="configuracion" label="Configuración" />}
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

      {loading && tab !== 'configuracion' ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <Fade in key={tab} timeout={300}>
          <Box className="flex flex-col gap-4">
            {tab === 'inventario' && (
              <>
                <FiltrosInventario
                  filtros={filtros}
                  onCambiar={setFiltros}
                  categorias={raices}
                  ubicaciones={ubicaciones}
                  resultados={equiposFiltrados.length}
                />
                {esDesktop ? (
                  <InventarioTabla equipos={equiposFiltrados} loading={loading} />
                ) : (
                  <EquipoCardList equipos={equiposFiltrados} />
                )}
              </>
            )}

            {tab === 'panorama' && <PanoramaInventario equipos={equipos} />}

            {tab === 'configuracion' && (
              <Box className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <CategoriasAdmin />
                <UbicacionesAdmin />
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  )
}

export default InventarioPage
