import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Chip,
  Drawer,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import type { CategoriaEquipo, EquipoEstado, UbicacionEquipo } from '../types'
import { ESTADOS_EQUIPO, ESTILO_EQUIPO_ESTADO, ESTILO_VENCIMIENTO } from '../constants'
import { FILTROS_VACIOS, cantidadFiltrosActivos, type FiltrosEquipos } from '../utils'

interface Props {
  filtros: FiltrosEquipos
  onCambiar: (filtros: FiltrosEquipos) => void
  categorias: CategoriaEquipo[]
  ubicaciones: UbicacionEquipo[]
  resultados: number
}

// Búsqueda siempre visible + filtros combinables: fila de selects en
// desktop, Drawer inferior en móvil. Los filtros activos se muestran
// como chips removibles en ambos casos.
const FiltrosInventario = ({ filtros, onCambiar, categorias, ubicaciones, resultados }: Props) => {
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const activos = cantidadFiltrosActivos(filtros)

  const set = (cambios: Partial<FiltrosEquipos>) => onCambiar({ ...filtros, ...cambios })

  const selects = (size: 'small' | 'medium') => (
    <>
      <TextField
        select
        label="Categoría"
        size={size}
        value={filtros.categoriaId}
        onChange={(e) => set({ categoriaId: e.target.value === '' ? '' : Number(e.target.value) })}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Todas</MenuItem>
        {categorias.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Estado"
        size={size}
        value={filtros.estado}
        onChange={(e) => set({ estado: e.target.value as EquipoEstado | '' })}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS_EQUIPO.map((estado) => (
          <MenuItem key={estado} value={estado}>
            {ESTILO_EQUIPO_ESTADO[estado].label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Ubicación"
        size={size}
        value={filtros.ubicacionId}
        onChange={(e) => set({ ubicacionId: e.target.value === '' ? '' : Number(e.target.value) })}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">Todas</MenuItem>
        {ubicaciones.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Vencimiento"
        size={size}
        value={filtros.vencimiento}
        onChange={(e) => set({ vencimiento: e.target.value as FiltrosEquipos['vencimiento'] })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="POR_VENCER">Próximos a vencer</MenuItem>
        <MenuItem value="VENCIDO">Vencidos</MenuItem>
      </TextField>
    </>
  )

  const chipsActivos = (
    <Box className="flex flex-wrap items-center gap-1.5 empty:hidden">
      {filtros.categoriaId !== '' && (
        <Chip
          label={categorias.find((c) => c.id === filtros.categoriaId)?.nombre}
          size="small"
          onDelete={() => set({ categoriaId: '' })}
          sx={{ bgcolor: '#FFE4E6', color: '#9F1239', fontWeight: 600 }}
        />
      )}
      {filtros.estado !== '' && (
        <Chip
          label={ESTILO_EQUIPO_ESTADO[filtros.estado].label}
          size="small"
          onDelete={() => set({ estado: '' })}
          sx={{
            bgcolor: ESTILO_EQUIPO_ESTADO[filtros.estado].bg,
            color: ESTILO_EQUIPO_ESTADO[filtros.estado].color,
            fontWeight: 600,
          }}
        />
      )}
      {filtros.ubicacionId !== '' && (
        <Chip
          label={ubicaciones.find((u) => u.id === filtros.ubicacionId)?.nombre}
          size="small"
          onDelete={() => set({ ubicacionId: '' })}
          sx={{ bgcolor: '#ECFDF9', color: '#0F766E', fontWeight: 600 }}
        />
      )}
      {filtros.vencimiento !== '' && (
        <Chip
          label={ESTILO_VENCIMIENTO[filtros.vencimiento].label}
          size="small"
          onDelete={() => set({ vencimiento: '' })}
          sx={{
            bgcolor: ESTILO_VENCIMIENTO[filtros.vencimiento].bg,
            color: ESTILO_VENCIMIENTO[filtros.vencimiento].color,
            fontWeight: 600,
          }}
        />
      )}
      {activos > 1 && (
        <Button size="small" startIcon={<ClearRoundedIcon />} onClick={() => set({ ...FILTROS_VACIOS, busqueda: filtros.busqueda })}>
          Limpiar todo
        </Button>
      )}
    </Box>
  )

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex items-center gap-2">
        <TextField
          placeholder="Buscar por nombre, código, marca o modelo…"
          size="small"
          fullWidth
          value={filtros.busqueda}
          onChange={(e) => set({ busqueda: e.target.value })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        {/* Móvil: los filtros viven en un drawer inferior */}
        <Badge badgeContent={activos} color="primary" className="md:hidden!">
          <Button
            variant="outlined"
            startIcon={<FilterListRoundedIcon />}
            onClick={() => setDrawerAbierto(true)}
            className="shrink-0"
          >
            Filtros
          </Button>
        </Badge>
      </Box>

      {/* Desktop: fila de selects */}
      <Box className="hidden flex-wrap items-center gap-2 md:flex">{selects('small')}</Box>

      {chipsActivos}

      <Typography variant="caption" color="text.secondary">
        {resultados} {resultados === 1 ? 'equipo' : 'equipos'}
      </Typography>

      <Drawer
        anchor="bottom"
        open={drawerAbierto}
        onClose={() => setDrawerAbierto(false)}
        slotProps={{ paper: { className: 'rounded-t-2xl! p-5' } }}
      >
        <Typography variant="subtitle1" className="mb-4! font-semibold!">
          Filtrar inventario
        </Typography>
        <Box className="flex flex-col gap-3 [&>*]:w-full">{selects('medium')}</Box>
        <Box className="mt-4 flex gap-2">
          <Button
            fullWidth
            color="inherit"
            onClick={() => set({ ...FILTROS_VACIOS, busqueda: filtros.busqueda })}
          >
            Limpiar
          </Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerAbierto(false)}>
            Ver {resultados} resultados
          </Button>
        </Box>
      </Drawer>
    </Box>
  )
}

export default FiltrosInventario
