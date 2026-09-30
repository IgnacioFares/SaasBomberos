import { useNavigate } from 'react-router-dom'
import { Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { Despacho } from '../types'
import { duracion, formatearFechaHora } from '../utils'

interface Props {
  despachos: Despacho[]
  loading: boolean
  // Sin "despachar_movilidades" la tabla es solo de consulta.
  puedeDespachar: boolean
  onFinalizar: (despacho: Despacho) => void
  onEliminar: (despacho: Despacho) => void
}

// Listado de salidas con su recorrido. El botón de exportar del
// DataGrid baja esto mismo en CSV, que es lo que se adjunta a la
// rendición de cuentas.
const TablaSalidas = ({ despachos, loading, puedeDespachar, onFinalizar, onEliminar }: Props) => {
  const navigate = useNavigate()

  const columnas: GridColDef<Despacho>[] = [
    {
      field: 'iniciadoEn',
      headerName: 'Salida',
      flex: 1.2,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box className="flex h-full flex-col justify-center">
          <Typography variant="body2" className="leading-tight!">
            {formatearFechaHora(row.iniciadoEn)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {duracion(row.iniciadoEn, row.finalizadoEn)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'movilidadNombre',
      headerName: 'Movilidad',
      flex: 1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Box className="flex h-full flex-col justify-center">
          <Typography variant="body2" className="font-semibold! leading-tight!">
            {row.movilidadNombre}
          </Typography>
          {row.movilidadPatente && (
            <Typography variant="caption" color="text.secondary">
              {row.movilidadPatente}
            </Typography>
          )}
        </Box>
      ),
    },
    { field: 'motivo', headerName: 'Motivo', flex: 1.2, minWidth: 160 },
    {
      field: 'destino',
      headerName: 'Destino',
      flex: 1.6,
      minWidth: 200,
      valueGetter: (_, row) => row.destino ?? '—',
      renderCell: ({ row }) => (
        <Box className="flex h-full flex-col justify-center">
          <Typography variant="body2" className="truncate leading-tight!">
            {row.destino ?? '—'}
          </Typography>
          {row.despachoAnteriorId != null && (
            <Typography variant="caption" color="text.secondary" className="truncate">
              Salió desde {row.origenNombre}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'idaKm',
      headerName: 'Ida (km)',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_, row) => row.idaKm ?? null,
      renderCell: ({ row }) => (
        <span className="tabular-nums">{row.idaKm != null ? row.idaKm : '—'}</span>
      ),
    },
    {
      field: 'recorridoKm',
      headerName: 'Recorrido (km)',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_, row) => row.recorridoKm ?? null,
      renderCell: ({ row }) => {
        if (row.recorridoKm == null) {
          return (
            <Tooltip title="El destino no está ubicado en el mapa, así que no se puede medir">
              <span className="text-slate-400">Sin medir</span>
            </Tooltip>
          )
        }
        // Una salida encadenada no tiene vuelta al cuartel: ese tramo
        // lo aporta la salida siguiente.
        return (
          <Box className="flex h-full items-center justify-end gap-1">
            <span className="tabular-nums font-semibold">{row.recorridoKm}</span>
            {row.vueltaKm === 0 && (
              <Tooltip title="Solo la ida: siguió a otro servicio sin volver al cuartel">
                <span className="text-xs text-amber-600">*</span>
              </Tooltip>
            )}
          </Box>
        )
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: ({ row }) => {
        const enCurso = row.estado === 'EN_CURSO'
        return (
          <Chip
            label={enCurso ? 'En curso' : 'Finalizado'}
            size="small"
            sx={{
              height: 22,
              bgcolor: enCurso ? '#FEE2E2' : '#E2E8F0',
              color: enCurso ? '#B91C1C' : '#475569',
              fontWeight: 700,
            }}
          />
        )
      },
    },
    {
      field: 'acciones',
      headerName: '',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        if (!puedeDespachar) return null
        return (
          <Box className="flex h-full items-center">
            {row.estado === 'EN_CURSO' ? (
              <Tooltip title="Finalizar despacho">
                <IconButton
                  size="small"
                  onClick={(evento) => {
                    evento.stopPropagation()
                    onFinalizar(row)
                  }}
                >
                  <StopCircleRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Eliminar del historial">
                <IconButton
                  size="small"
                  onClick={(evento) => {
                    evento.stopPropagation()
                    onEliminar(row)
                  }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      },
    },
  ]

  return (
    <Paper elevation={0} className="rounded-2xl! overflow-hidden border border-slate-200">
      <DataGrid
        rows={despachos}
        columns={columnas}
        loading={loading}
        rowHeight={58}
        disableRowSelectionOnClick
        onRowClick={({ row }) => navigate(`/despachos/${row.id}`)}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
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

export default TablaSalidas
