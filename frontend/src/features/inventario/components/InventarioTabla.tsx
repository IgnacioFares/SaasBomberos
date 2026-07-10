import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'
import type { Equipo, EquipoEstado } from '../types'
import { ESTILO_EQUIPO_ESTADO, ESTILO_VENCIMIENTO, formatearFecha } from '../constants'
import { ubicacionesDeEquipo } from '../utils'

interface Props {
  equipos: Equipo[]
  loading: boolean
}

const chipEstado = (estado: EquipoEstado, cantidad?: number) => {
  const estilo = ESTILO_EQUIPO_ESTADO[estado]
  return (
    <Chip
      key={estado}
      label={cantidad != null ? `${cantidad} ${estilo.label.toLowerCase()}` : estilo.label}
      size="small"
      sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
    />
  )
}

// Tabla profesional del inventario (desktop): ordenamiento, ocultar
// columnas, redimensionar, selección múltiple, paginación y export CSV
// vienen del DataGrid; los filtros de negocio viven en FiltrosInventario.
const InventarioTabla = ({ equipos, loading }: Props) => {
  const navigate = useNavigate()
  // La selección múltiple es opt-in: los checkboxes solo aparecen al
  // activar "Seleccionar" (pedido del usuario).
  const [seleccionActiva, setSeleccionActiva] = useState(false)

  const columnas: GridColDef<Equipo>[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1.6,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Box className="flex h-full flex-col justify-center">
          <Typography variant="body2" className="font-semibold! leading-tight!">
            {row.nombre}
          </Typography>
          {row.codigoInterno && (
            <Typography variant="caption" color="text.secondary">
              {row.codigoInterno}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'categoriaNombre',
      headerName: 'Categoría',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) =>
        row.subcategoriaNombre ? `${row.categoriaNombre} · ${row.subcategoriaNombre}` : row.categoriaNombre,
    },
    {
      field: 'cantidad',
      headerName: 'Cantidad',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <span className="tabular-nums">
          {row.cantidad ?? '—'}
          {row.unidadMedida ? ` ${row.unidadMedida}` : ''}
        </span>
      ),
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1.1,
      minWidth: 170,
      sortable: false,
      renderCell: ({ row }) => {
        const entradas = Object.entries(row.cantidadPorEstado)
        return (
          <Box className="flex h-full flex-wrap items-center gap-1 py-1">
            {entradas.length === 0 ? (
              <span className="text-slate-400">Sin stock</span>
            ) : entradas.length === 1 ? (
              chipEstado(entradas[0][0] as EquipoEstado)
            ) : (
              entradas.map(([estado, cantidad]) => chipEstado(estado as EquipoEstado, cantidad))
            )}
          </Box>
        )
      },
    },
    {
      field: 'ubicacionNombre',
      headerName: 'Ubicación',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => ubicacionesDeEquipo(row).join(', ') || '—',
    },
    {
      field: 'marca',
      headerName: 'Marca / Modelo',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => [row.marca, row.modelo].filter(Boolean).join(' ') || '—',
    },
    {
      field: 'estadoVencimiento',
      headerName: 'Vencimiento',
      width: 150,
      renderCell: ({ row }) => {
        if (row.estadoVencimiento === 'SIN_VENCIMIENTO') {
          return <span className="text-slate-400">—</span>
        }
        const estilo = ESTILO_VENCIMIENTO[row.estadoVencimiento]
        return (
          <Box className="flex h-full flex-col justify-center gap-0.5">
            <Chip
              label={estilo.label}
              size="small"
              sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700, width: 'fit-content' }}
            />
            {row.fechaVencimiento && (
              <Typography variant="caption" color="text.secondary">
                {formatearFecha(row.fechaVencimiento)}
              </Typography>
            )}
          </Box>
        )
      },
    },
  ]

  return (
    <Paper elevation={0} className="rounded-2xl! overflow-hidden border border-slate-200">
      <Box className="flex items-center justify-end border-b border-slate-100 px-2 py-1">
        <Button
          size="small"
          color={seleccionActiva ? 'primary' : 'inherit'}
          startIcon={seleccionActiva ? <CloseRoundedIcon /> : <LibraryAddCheckRoundedIcon />}
          onClick={() => setSeleccionActiva((prev) => !prev)}
          sx={{ color: seleccionActiva ? undefined : '#64748B' }}
        >
          {seleccionActiva ? 'Salir de selección' : 'Seleccionar'}
        </Button>
      </Box>
      <DataGrid
        rows={equipos}
        columns={columnas}
        loading={loading}
        rowHeight={60}
        checkboxSelection={seleccionActiva}
        disableRowSelectionOnClick
        onRowClick={({ row }) => navigate(`/inventario/${row.id}`)}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        showToolbar
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          border: 'none',
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#F8FAFC' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
        }}
      />
    </Paper>
  )
}

export default InventarioTabla
