import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import { useAuthContext } from '../../auth/hooks/useAuthContext'
import usePermisos from '../../auth/hooks/usePermisos'
import useUsuariosAdmin from '../hooks/useUsuariosAdmin'
import UsuarioPermisosDialog from '../components/UsuarioPermisosDialog'
import ConfiguracionCuerpoCard from '../../partes/components/ConfiguracionCuerpoCard'
import type { UsuarioAdmin } from '../types'

const iniciales = (nombre: string, apellido: string) =>
  `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase()

// El guard vive en el componente exterior para que los fetches del
// panel (admin-only) ni siquiera se disparen sin permiso.
const AdministracionPage = () => {
  const { esAdmin } = usePermisos()
  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return <PanelAdministracion />
}

const PanelAdministracion = () => {
  const { usuario: usuarioActual } = useAuthContext()
  const {
    usuarios,
    permisosDisponibles,
    roles,
    loading,
    guardando,
    error,
    guardar,
    limpiarError,
  } = useUsuariosAdmin()

  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const etiquetaPermiso = useMemo(() => {
    const mapa = new Map(permisosDisponibles.map((p) => [p.nombre, p.etiqueta]))
    return (nombre: string) => mapa.get(nombre) ?? nombre
  }, [permisosDisponibles])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return usuarios
    return usuarios.filter((u) =>
      [`${u.nombre} ${u.apellido}`, u.email, u.rango].some((c) => c.toLowerCase().includes(texto))
    )
  }, [usuarios, busqueda])

  const handleGuardar = async (usuario: UsuarioAdmin, rolId: number, permisos: string[]) => {
    const ok = await guardar(usuario, rolId, permisos)
    if (ok) {
      setEditando(null)
      setMensajeExito(`Permisos de ${usuario.nombre} ${usuario.apellido} actualizados.`)
    }
  }

  return (
    <Box className="flex flex-col gap-5">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Administración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Otorgá o quitá permisos a las personas registradas en el sistema.
        </Typography>
      </Box>

      {mensajeExito && (
        <Alert severity="success" onClose={() => setMensajeExito(null)}>
          {mensajeExito}
        </Alert>
      )}
      {error && editando === null && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <ConfiguracionCuerpoCard />

      <TextField
        placeholder="Buscar por nombre, email o rango…"
        size="small"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 420 }}
      />

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtrados.map((usuario) => {
            const esAdminUsuario = usuario.rol.nombre === 'Administrador'
            const esYo = usuario.id === usuarioActual?.id
            return (
              <Paper
                key={usuario.id}
                elevation={0}
                className="rounded-2xl! flex flex-col gap-3 border border-slate-200 p-4 sm:p-5"
              >
                <Box className="flex items-start justify-between gap-2">
                  <Box className="flex min-w-0 items-center gap-3">
                    <Avatar
                      sx={{
                        bgcolor: esAdminUsuario ? '#9F1239' : '#0D9488',
                        width: 44,
                        height: 44,
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      {iniciales(usuario.nombre, usuario.apellido)}
                    </Avatar>
                    <Box className="min-w-0">
                      <Typography variant="subtitle1" className="truncate font-semibold! leading-tight!">
                        {usuario.nombre} {usuario.apellido}
                        {esYo && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {' '}
                            (vos)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" className="block truncate">
                        {usuario.email} · {usuario.rango}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<ShieldRoundedIcon sx={{ fontSize: 15 }} />}
                    label={usuario.rol.nombre}
                    size="small"
                    sx={
                      esAdminUsuario
                        ? { bgcolor: '#FFE4E6', color: '#9F1239', fontWeight: 700, flexShrink: 0 }
                        : { bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, flexShrink: 0 }
                    }
                  />
                </Box>

                <Box className="flex flex-wrap items-center gap-1.5">
                  {esAdminUsuario ? (
                    <Chip
                      label="Todos los permisos"
                      size="small"
                      sx={{ height: 22, bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }}
                    />
                  ) : usuario.permisosExtra.length === 0 ? (
                    <Chip
                      label="Solo lectura y checklists"
                      size="small"
                      sx={{ height: 22, bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600 }}
                    />
                  ) : (
                    usuario.permisosExtra.map((permiso) => (
                      <Chip
                        key={permiso}
                        label={etiquetaPermiso(permiso)}
                        size="small"
                        sx={{ height: 22, bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
                      />
                    ))
                  )}
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ManageAccountsRoundedIcon />}
                  className="self-start!"
                  onClick={() => {
                    limpiarError()
                    setMensajeExito(null)
                    setEditando(usuario)
                  }}
                >
                  Editar permisos
                </Button>
              </Paper>
            )
          })}
          {filtrados.length === 0 && (
            <Typography variant="body2" color="text.secondary" className="col-span-full py-8 text-center">
              No hay usuarios que coincidan con la búsqueda.
            </Typography>
          )}
        </Box>
      )}

      <UsuarioPermisosDialog
        usuario={editando}
        permisosDisponibles={permisosDisponibles}
        roles={roles}
        esUsuarioActual={editando?.id === usuarioActual?.id}
        guardando={guardando}
        error={editando !== null ? error : null}
        onCerrar={() => setEditando(null)}
        onGuardar={handleGuardar}
      />
    </Box>
  )
}

export default AdministracionPage
