import { useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import type { Equipo, EquipoRequest, EquipoSeguimiento, EquipoEstado } from '../types'
import { ESTADOS_EQUIPO, ESTILO_EQUIPO_ESTADO } from '../constants'
import useCategorias from '../hooks/useCategorias'
import useUbicaciones from '../hooks/useUbicaciones'

interface Props {
  onGuardar: (data: EquipoRequest) => Promise<boolean>
  loading: boolean
  error: string | null
  // Si se pasa, el formulario arranca precargado (modo edición): el
  // tipo de seguimiento queda bloqueado y las unidades se gestionan
  // desde el detalle del equipo.
  inicial?: Equipo
  textoBoton?: string
}

const EquipoForm = ({ onGuardar, loading, error, inicial, textoBoton }: Props) => {
  const { raices, subcategoriasDe } = useCategorias()
  const { ubicaciones } = useUbicaciones()

  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [codigoInterno, setCodigoInterno] = useState(inicial?.codigoInterno ?? '')
  const [categoriaId, setCategoriaId] = useState<number | ''>(inicial?.categoriaId ?? '')
  const [subcategoriaId, setSubcategoriaId] = useState<number | ''>(inicial?.subcategoriaId ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [seguimiento, setSeguimiento] = useState<EquipoSeguimiento>(inicial?.seguimiento ?? 'POR_CANTIDAD')
  const [cantidad, setCantidad] = useState(inicial?.cantidad != null ? String(inicial.cantidad) : '')
  const [cantidadUnidades, setCantidadUnidades] = useState('1')
  const [unidadMedida, setUnidadMedida] = useState(inicial?.unidadMedida ?? '')
  const [estado, setEstado] = useState<EquipoEstado>(inicial?.estado ?? 'EN_DEPOSITO')
  const [ubicacionId, setUbicacionId] = useState<number | ''>(inicial?.ubicacionId ?? '')
  const [marca, setMarca] = useState(inicial?.marca ?? '')
  const [modelo, setModelo] = useState(inicial?.modelo ?? '')
  const [numeroSerie, setNumeroSerie] = useState(inicial?.numeroSerie ?? '')
  const [fechaCompra, setFechaCompra] = useState(inicial?.fechaCompra ?? '')
  const [fechaVencimiento, setFechaVencimiento] = useState(inicial?.fechaVencimiento ?? '')
  const [observaciones, setObservaciones] = useState(inicial?.observaciones ?? '')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  const esEdicion = Boolean(inicial)
  const porUnidad = seguimiento === 'POR_UNIDAD'
  const subcategorias = subcategoriasDe(categoriaId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorLocal(null)

    if (!nombre.trim() || categoriaId === '') {
      setErrorLocal('Completá el nombre del equipo y elegí una categoría.')
      return
    }
    if (!porUnidad && !esEdicion) {
      const cantidadNum = Number(cantidad)
      if (cantidad === '' || !Number.isInteger(cantidadNum) || cantidadNum < 0) {
        setErrorLocal('Indicá una cantidad válida (0 o más).')
        return
      }
    }
    if (porUnidad && !esEdicion) {
      const unidadesNum = Number(cantidadUnidades)
      if (!Number.isInteger(unidadesNum) || unidadesNum < 1) {
        setErrorLocal('Indicá cuántas unidades se dan de alta (mínimo 1).')
        return
      }
    }

    const ok = await onGuardar({
      nombre: nombre.trim(),
      codigoInterno: codigoInterno.trim() || undefined,
      categoriaId,
      subcategoriaId: subcategoriaId === '' ? null : subcategoriaId,
      descripcion: descripcion.trim() || undefined,
      marca: marca.trim() || undefined,
      modelo: modelo.trim() || undefined,
      numeroSerie: numeroSerie.trim() || undefined,
      seguimiento,
      cantidad: !porUnidad && !esEdicion ? Number(cantidad) : undefined,
      cantidadUnidades: porUnidad && !esEdicion ? Number(cantidadUnidades) : undefined,
      unidadMedida: unidadMedida.trim() || undefined,
      estado: esEdicion ? undefined : estado,
      ubicacionId: esEdicion ? undefined : ubicacionId === '' ? null : ubicacionId,
      fechaCompra: fechaCompra || null,
      fechaVencimiento: fechaVencimiento || null,
      observaciones: observaciones.trim() || undefined,
    })

    if (ok && !esEdicion) {
      setNombre('')
      setCodigoInterno('')
      setDescripcion('')
      setCantidad('')
      setCantidadUnidades('1')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Datos principales */}
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre del equipo"
          placeholder="Ej: Casco estructural HEROS Titan"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Código interno (opcional)"
          placeholder="Ej: EPP-CAS-01"
          value={codigoInterno}
          onChange={(e) => setCodigoInterno(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Categoría"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(Number(e.target.value))
            setSubcategoriaId('')
          }}
          required
          fullWidth
        >
          {raices.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Subcategoría (opcional)"
          value={subcategoriaId}
          onChange={(e) => setSubcategoriaId(e.target.value === '' ? '' : Number(e.target.value))}
          fullWidth
          disabled={subcategorias.length === 0}
          helperText={subcategorias.length === 0 && categoriaId !== '' ? 'Esta categoría no tiene subcategorías' : undefined}
        >
          <MenuItem value="">— Sin subcategoría —</MenuItem>
          {subcategorias.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TextField
        label="Descripción (opcional)"
        placeholder="Detalle breve del equipamiento"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        fullWidth
        multiline
        maxRows={3}
      />

      {/* Seguimiento: define cómo se gestiona el stock */}
      <Box className="flex flex-col gap-2">
        <Typography variant="subtitle2" color="text.secondary">
          ¿Cómo se gestiona este equipamiento?
        </Typography>
        <Tooltip title={esEdicion ? 'El tipo de seguimiento no puede cambiarse después del alta' : ''}>
          <ToggleButtonGroup
            value={seguimiento}
            exclusive
            onChange={(_, valor: EquipoSeguimiento | null) => valor && setSeguimiento(valor)}
            disabled={esEdicion}
            color="primary"
            className="flex-wrap"
          >
            <ToggleButton value="POR_CANTIDAD" sx={{ textTransform: 'none', px: 2 }}>
              <Inventory2RoundedIcon fontSize="small" className="mr-1.5" />
              Por cantidad
            </ToggleButton>
            <ToggleButton value="POR_UNIDAD" sx={{ textTransform: 'none', px: 2 }}>
              <QrCode2RoundedIcon fontSize="small" className="mr-1.5" />
              Unidades individuales
            </ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {porUnidad
            ? 'Cada unidad se rastrea por separado, con su propio estado, ubicación, serie y vencimiento (ideal para ERA, cascos, desfibriladores).'
            : 'Se cuenta en bloque, con un único estado y ubicación (ideal para mangueras, acoples, insumos).'}
        </Typography>
      </Box>

      {esEdicion ? (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!porUnidad && (
            <TextField
              label="Unidad de medida (opcional)"
              placeholder="unidades, tramos, metros, pares…"
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              fullWidth
            />
          )}
          <Typography variant="caption" color="text.secondary" className="self-center">
            {porUnidad
              ? 'Las unidades (estados, ubicaciones, series) se gestionan desde el detalle del equipo.'
              : 'El stock (cantidades, ubicaciones y estados) se gestiona desde el detalle del equipo.'}
          </Typography>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {porUnidad ? (
            <TextField
              label="Cantidad de unidades a dar de alta"
              type="number"
              value={cantidadUnidades}
              onChange={(e) => setCantidadUnidades(e.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
              helperText="Se numeran automáticamente (N°1, N°2, …)"
            />
          ) : (
            <>
              <TextField
                label="Cantidad inicial"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                fullWidth
                slotProps={{ htmlInput: { min: 0 } }}
                helperText="Después se puede repartir entre ubicaciones desde el detalle"
              />
              <TextField
                label="Unidad de medida (opcional)"
                placeholder="unidades, tramos, metros, pares…"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                fullWidth
              />
            </>
          )}
          <TextField
            select
            label={porUnidad ? 'Estado inicial de las unidades' : 'Estado inicial'}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EquipoEstado)}
            fullWidth
          >
            {ESTADOS_EQUIPO.filter((e) => e !== 'DADO_DE_BAJA').map((valor) => (
              <MenuItem key={valor} value={valor}>
                {ESTILO_EQUIPO_ESTADO[valor].label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={porUnidad ? 'Ubicación inicial de las unidades' : 'Ubicación inicial'}
            value={ubicacionId}
            onChange={(e) => setUbicacionId(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          >
            <MenuItem value="">— Sin ubicación —</MenuItem>
            {ubicaciones.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* Secciones opcionales: solo se abren si hacen falta */}
      <Box className="flex flex-col">
        <Accordion
          elevation={0}
          disableGutters
          defaultExpanded={Boolean(inicial?.marca || inicial?.modelo || inicial?.numeroSerie)}
          className="rounded-xl! border border-slate-200 before:hidden"
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle2">Marca, modelo y serie</Typography>
          </AccordionSummary>
          <AccordionDetails className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} fullWidth size="small" />
            <TextField label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} fullWidth size="small" />
            <TextField
              label="Número de serie"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              fullWidth
              size="small"
              helperText={porUnidad ? 'La serie de cada unidad se carga en el detalle' : undefined}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion
          elevation={0}
          disableGutters
          defaultExpanded={Boolean(inicial?.fechaCompra || inicial?.fechaVencimiento)}
          className="mt-2! rounded-xl! border border-slate-200 before:hidden"
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle2">Compra y vencimiento</Typography>
          </AccordionSummary>
          <AccordionDetails className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Fecha de compra"
              type="date"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fecha de vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="El sistema alerta 30 días antes"
            />
          </AccordionDetails>
        </Accordion>

        <Accordion
          elevation={0}
          disableGutters
          defaultExpanded={Boolean(inicial?.observaciones)}
          className="mt-2! rounded-xl! border border-slate-200 before:hidden"
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography variant="subtitle2">Observaciones</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              placeholder="Notas sobre este equipamiento…"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              size="small"
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {(errorLocal || error) && (
        <Alert severity="error" variant="outlined">
          {errorLocal || error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<SaveRoundedIcon />}
        disabled={loading}
        className="self-start!"
      >
        {loading ? 'Guardando...' : (textoBoton ?? 'Registrar equipo')}
      </Button>
    </Box>
  )
}

export default EquipoForm
