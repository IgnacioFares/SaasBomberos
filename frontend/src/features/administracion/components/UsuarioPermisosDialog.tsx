import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import type { PermisoInfo, RolInfo, UsuarioAdmin } from '../types'

interface Props {
  usuario: UsuarioAdmin | null
  permisosDisponibles: PermisoInfo[]
  roles: RolInfo[]
  esUsuarioActual: boolean
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onGuardar: (usuario: UsuarioAdmin, rolId: number, permisos: string[]) => void
}

// Edición de rol y permisos de un usuario. Si el rol elegido es
// Administrador, los switches se muestran activos y bloqueados: el
// admin tiene todos los permisos implícitamente.
const UsuarioPermisosDialog = ({
  usuario,
  permisosDisponibles,
  roles,
  esUsuarioActual,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: Props) => {
  const [rolId, setRolId] = useState<number | ''>('')
  const [permisos, setPermisos] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (usuario) {
      setRolId(usuario.rol.id)
      setPermisos(new Set(usuario.permisosExtra))
    }
  }, [usuario])

  if (!usuario) return null

  const rolElegido = roles.find((r) => r.id === rolId)
  const esAdminElegido = rolElegido?.nombre === 'Administrador'

  const togglePermiso = (nombre: string) =>
    setPermisos((prev) => {
      const siguiente = new Set(prev)
      if (siguiente.has(nombre)) siguiente.delete(nombre)
      else siguiente.add(nombre)
      return siguiente
    })

  return (
    <Dialog open onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold!">
        Permisos de {usuario.nombre} {usuario.apellido}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <TextField
          select
          label="Rol"
          value={rolId}
          onChange={(e) => setRolId(Number(e.target.value))}
          fullWidth
          className="mt-2!"
          disabled={esUsuarioActual}
          helperText={
            esUsuarioActual
              ? 'No podés cambiar tu propio rol'
              : 'El Administrador tiene todos los permisos y accede a este panel'
          }
        >
          {roles.map((rol) => (
            <MenuItem key={rol.id} value={rol.id}>
              {rol.nombre}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        {esAdminElegido && (
          <Alert severity="info" icon={<ShieldRoundedIcon fontSize="small" />}>
            El rol Administrador tiene todos los permisos; no hace falta otorgarlos uno por uno.
          </Alert>
        )}

        <Box className="flex flex-col gap-1">
          {permisosDisponibles.map((permiso) => (
            <Box
              key={permiso.nombre}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <Box className="min-w-0">
                <Typography variant="body2" className="font-semibold!">
                  {permiso.etiqueta}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {permiso.descripcion}
                </Typography>
              </Box>
              <Switch
                checked={esAdminElegido || permisos.has(permiso.nombre)}
                disabled={esAdminElegido || guardando}
                onChange={() => togglePermiso(permiso.nombre)}
                slotProps={{ input: { 'aria-label': permiso.etiqueta } }}
              />
            </Box>
          ))}
        </Box>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions className="px-6! pb-4!">
        <Button onClick={onCerrar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={guardando || rolId === ''}
          onClick={() => rolId !== '' && onGuardar(usuario, rolId, [...permisos])}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UsuarioPermisosDialog
