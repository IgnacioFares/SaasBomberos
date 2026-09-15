import { useMemo } from 'react'
import { Box, Chip, Paper, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import StatCard from '../../../components/StatCard'
import type { Equipo, EquipoEstado } from '../types'
import { ESTILO_EQUIPO_ESTADO, ESTILO_VENCIMIENTO, formatearFecha } from '../constants'

// Colores de marca para los gráficos, validados con el validador de la
// skill de dataviz sobre superficie blanca (CVD ΔE adyacente 15.1; el
// ámbar queda sub-3:1 y se mitiga con labels visibles + separadores).
const COLOR_ESTADO_CHART: Record<Exclude<EquipoEstado, 'DADO_DE_BAJA'>, string> = {
  EN_SERVICIO: '#16A34A',
  EN_DEPOSITO: '#0284C7',
  EN_MANTENIMIENTO: '#F59E0B',
  EN_REPARACION: '#EA580C',
  FUERA_DE_SERVICIO: '#DC2626',
}
const ESTADOS_CHART = Object.keys(COLOR_ESTADO_CHART) as (keyof typeof COLOR_ESTADO_CHART)[]

const ROSA_SECUENCIAL = '#9F1239'
const TEAL_SECUENCIAL = '#0D9488'

const estiloTooltip = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
  fontSize: 13,
}

interface Props {
  equipos: Equipo[]
}

interface VencimientoItem {
  clave: string
  nombre: string
  detalle: string | null
  fecha: string
  estado: 'POR_VENCER' | 'VENCIDO'
}

// Cada elemento cuenta por su cantidad: un lote de 12 tramos aporta 12,
// cada unidad individual aporta 1. Las bajas no cuentan como stock.
const PanoramaInventario = ({ equipos }: Props) => {
  const datos = useMemo(() => {
    const porEstado: Record<string, number> = {}
    const porCategoria: Record<string, number> = {}
    const porUbicacion: Record<string, number> = {}
    const vencimientos: VencimientoItem[] = []
    let total = 0

    const sumar = (estado: EquipoEstado, categoria: string, ubicacion: string | null, cantidad: number) => {
      if (estado === 'DADO_DE_BAJA' || cantidad <= 0) return
      total += cantidad
      porEstado[estado] = (porEstado[estado] ?? 0) + cantidad
      porCategoria[categoria] = (porCategoria[categoria] ?? 0) + cantidad
      const nombreUbicacion = ubicacion ?? 'Sin ubicación'
      porUbicacion[nombreUbicacion] = (porUbicacion[nombreUbicacion] ?? 0) + cantidad
    }

    for (const equipo of equipos) {
      if (equipo.seguimiento === 'POR_UNIDAD') {
        for (const unidad of equipo.unidades) {
          sumar(unidad.estado, equipo.categoriaNombre, unidad.ubicacionNombre ?? null, 1)
          if (unidad.fechaVencimiento && unidad.estadoVencimiento !== 'VIGENTE' && unidad.estadoVencimiento !== 'SIN_VENCIMIENTO') {
            vencimientos.push({
              clave: `u-${unidad.id}`,
              nombre: equipo.nombre,
              detalle: `Unidad N°${unidad.numero}`,
              fecha: unidad.fechaVencimiento,
              estado: unidad.estadoVencimiento,
            })
          }
        }
      } else {
        for (const linea of equipo.stock) {
          sumar(linea.estado, equipo.categoriaNombre, linea.ubicacionNombre ?? null, linea.cantidad)
        }
      }
      if (
        equipo.fechaVencimiento &&
        (equipo.seguimiento === 'POR_CANTIDAD' || equipo.unidades.every((u) => !u.fechaVencimiento))
      ) {
        const estadoPropio =
          new Date(`${equipo.fechaVencimiento}T00:00:00`) < new Date()
            ? ('VENCIDO' as const)
            : ('POR_VENCER' as const)
        if (equipo.estadoVencimiento === 'POR_VENCER' || equipo.estadoVencimiento === 'VENCIDO') {
          vencimientos.push({
            clave: `e-${equipo.id}`,
            nombre: equipo.nombre,
            detalle: null,
            fecha: equipo.fechaVencimiento,
            estado: estadoPropio,
          })
        }
      }
    }

    const aFilas = (registro: Record<string, number>) =>
      Object.entries(registro)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)

    return {
      total,
      porEstado,
      categorias: aFilas(porCategoria),
      ubicaciones: aFilas(porUbicacion),
      vencimientos: vencimientos.sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 8),
      porVencer: equipos.filter((e) => e.estadoVencimiento === 'POR_VENCER').length,
      vencidos: equipos.filter((e) => e.estadoVencimiento === 'VENCIDO').length,
    }
  }, [equipos])

  const filaEstado = [{ nombre: 'estados', ...datos.porEstado }]

  const graficoBarras = (
    titulo: string,
    filas: { nombre: string; cantidad: number }[],
    color: string
  ) => (
    <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
      <Typography variant="subtitle1" className="mb-3! font-semibold!">
        {titulo}
      </Typography>
      <ResponsiveContainer width="100%" height={Math.max(200, filas.length * 36 + 30)}>
        <BarChart data={filas} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#E2E8F0" strokeWidth={1} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nombre"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={estiloTooltip} formatter={(v) => [v, 'Elementos']} />
          <Bar dataKey="cantidad" fill={color} barSize={14} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="cantidad" position="right" style={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )

  return (
    <Box className="flex flex-col gap-4">
      {/* Indicadores */}
      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icono={Inventory2RoundedIcon} etiqueta="Total de elementos" valor={datos.total} color="blue" />
        <StatCard icono={CheckCircleRoundedIcon} etiqueta="En servicio" valor={datos.porEstado.EN_SERVICIO ?? 0} color="green" />
        <StatCard icono={BuildRoundedIcon} etiqueta="En mantenimiento" valor={datos.porEstado.EN_MANTENIMIENTO ?? 0} color="amber" />
        <StatCard icono={HandymanRoundedIcon} etiqueta="En reparación" valor={datos.porEstado.EN_REPARACION ?? 0} color="orange" />
        <StatCard icono={BlockRoundedIcon} etiqueta="Fuera de servicio" valor={datos.porEstado.FUERA_DE_SERVICIO ?? 0} color="red" />
        <StatCard icono={EventRoundedIcon} etiqueta="Próximos a vencer" valor={datos.porVencer} color="amber" />
        <StatCard icono={EventBusyRoundedIcon} etiqueta="Vencidos" valor={datos.vencidos} color="red" />
      </Box>

      {/* Distribución por estado: barra apilada única (parte-del-todo) */}
      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
        <Typography variant="subtitle1" className="font-semibold!">
          Elementos por estado
        </Typography>
        <ResponsiveContainer width="100%" height={64}>
          <BarChart data={filaEstado} layout="vertical" margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="nombre" hide />
            <Tooltip
              cursor={false}
              contentStyle={estiloTooltip}
              formatter={(valor, clave) => [valor, ESTILO_EQUIPO_ESTADO[clave as EquipoEstado].label]}
            />
            {ESTADOS_CHART.map((estado) => (
              <Bar
                key={estado}
                dataKey={estado}
                stackId="estados"
                fill={COLOR_ESTADO_CHART[estado]}
                stroke="#FFFFFF"
                strokeWidth={2}
                barSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Leyenda con conteos visibles (relief del ámbar sub-3:1) */}
        <Box className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {ESTADOS_CHART.filter((estado) => (datos.porEstado[estado] ?? 0) > 0).map((estado) => (
            <Box key={estado} className="flex items-center gap-1.5">
              <Box className="h-2.5 w-2.5 rounded-sm" sx={{ bgcolor: COLOR_ESTADO_CHART[estado] }} />
              <Typography variant="caption" className="text-slate-600!">
                {ESTILO_EQUIPO_ESTADO[estado].label}:{' '}
                <strong className="tabular-nums">{datos.porEstado[estado]}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {graficoBarras('Elementos por categoría', datos.categorias, ROSA_SECUENCIAL)}
        {graficoBarras('Elementos por ubicación', datos.ubicaciones, TEAL_SECUENCIAL)}
      </Box>

      {/* Próximos vencimientos */}
      <Paper elevation={0} className="rounded-2xl! border border-slate-200 p-4 sm:p-5">
        <Typography variant="subtitle1" className="mb-2! font-semibold!">
          Próximos vencimientos
        </Typography>
        {datos.vencimientos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="py-4 text-center">
            No hay elementos vencidos ni próximos a vencer. Todo al día.
          </Typography>
        ) : (
          <Box className="flex flex-col divide-y divide-slate-100">
            {datos.vencimientos.map((item) => {
              const estilo = ESTILO_VENCIMIENTO[item.estado]
              return (
                <Box key={item.clave} className="flex items-center justify-between gap-2 py-2">
                  <Box className="min-w-0">
                    <Typography variant="body2" className="truncate font-medium!">
                      {item.nombre}
                      {item.detalle && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}
                          · {item.detalle}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box className="flex shrink-0 items-center gap-2">
                    <Typography variant="caption" color="text.secondary" className="tabular-nums">
                      {formatearFecha(item.fecha)}
                    </Typography>
                    <Chip
                      label={estilo.label}
                      size="small"
                      sx={{ height: 22, bgcolor: estilo.bg, color: estilo.color, fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default PanoramaInventario
