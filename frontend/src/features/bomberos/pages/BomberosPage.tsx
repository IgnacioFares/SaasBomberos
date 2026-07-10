import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import useBomberos from '../hooks/useBomberos'
import usePermisos, { PERMISOS } from '../../auth/hooks/usePermisos'
import BomberoTable from '../components/BomberoTable'
import BomberoDetalleDialog from '../components/BomberoDetalleDialog'
import { RANGOS } from '../constants'
import type { Bombero } from '../../../types'

// El personal se crea únicamente al registrarse una cuenta (no hay
// alta manual): esta pantalla es de consulta, con filtros por nombre
// y jerarquía.
const BomberosPage = () => {
  const { bomberos, loading, error, eliminar } = useBomberos()
  const { tienePermiso } = usePermisos()
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR_PERSONAL)

  const [busqueda, setBusqueda] = useState('')
  const [rango, setRango] = useState('')
  const [detalle, setDetalle] = useState<Bombero | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return bomberos.filter((b) => {
      if (rango && b.rango !== rango) return false
      if (!texto) return true
      return [`${b.nombre} ${b.apellido}`, b.dni, b.email ?? ''].some((campo) =>
        campo.toLowerCase().includes(texto)
      )
    })
  }, [bomberos, busqueda, rango])

  return (
    <Box className="flex flex-col gap-5">
      <Box>
        <Typography variant="h5" className="font-bold!">
          Personal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bomberos del cuartel con sus datos de contacto, médicos y de emergencia.
        </Typography>
      </Box>

      <Box className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TextField
          placeholder="Buscar por nombre, DNI o email…"
          size="small"
          fullWidth
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
          sx={{ maxWidth: { sm: 380 } }}
        />
        <TextField
          select
          label="Jerarquía"
          size="small"
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {RANGOS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary" className="shrink-0">
          {filtrados.length} {filtrados.length === 1 ? 'persona' : 'personas'}
        </Typography>
      </Box>

      {error && bomberos.length === 0 && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {loading && bomberos.length === 0 ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <BomberoTable
          bomberos={filtrados}
          onEliminar={eliminar}
          onVer={setDetalle}
          puedeGestionar={puedeGestionar}
        />
      )}

      <BomberoDetalleDialog bombero={detalle} onCerrar={() => setDetalle(null)} />
    </Box>
  )
}

export default BomberosPage
