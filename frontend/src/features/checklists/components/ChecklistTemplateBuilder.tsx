import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import type { ChecklistTemplate, ChecklistTemplateRequest } from '../types'
import type { Movilidad } from '../../../types'
import { getMovilidades } from '../../movilidades/services/movilidadService'

interface ItemState {
  nombre: string
  descripcion: string
  mostrarDescripcion: boolean
  requiereCantidad: boolean
  cantidadEsperada: string
  obligatorio: boolean
}

interface SeccionState {
  nombre: string
  items: ItemState[]
}

interface Props {
  onGuardar: (data: ChecklistTemplateRequest) => Promise<boolean>
  loading: boolean
  error: string | null
  // Si se pasa, el builder arranca precargado (modo edición).
  inicial?: ChecklistTemplate
  textoBoton?: string
}

const itemVacio = (): ItemState => ({
  nombre: '',
  descripcion: '',
  mostrarDescripcion: false,
  requiereCantidad: false,
  cantidadEsperada: '',
  obligatorio: true,
})

const seccionVacia = (): SeccionState => ({ nombre: '', items: [itemVacio()] })

const desdeTemplate = (template: ChecklistTemplate): SeccionState[] =>
  template.secciones.map((s) => ({
    nombre: s.nombre,
    items: s.items.map((it) => ({
      nombre: it.nombre,
      descripcion: it.descripcion ?? '',
      mostrarDescripcion: Boolean(it.descripcion),
      requiereCantidad: it.requiereCantidad,
      cantidadEsperada: it.cantidadEsperada != null ? String(it.cantidadEsperada) : '',
      obligatorio: it.obligatorio,
    })),
  }))

const ChecklistTemplateBuilder = ({ onGuardar, loading, error, inicial, textoBoton }: Props) => {
  const [movilidades, setMovilidades] = useState<Movilidad[]>([])
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [movilidadId, setMovilidadId] = useState<number | ''>(inicial?.movilidadId ?? '')
  const [secciones, setSecciones] = useState<SeccionState[]>(
    inicial ? desdeTemplate(inicial) : [seccionVacia()]
  )
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  useEffect(() => {
    getMovilidades().then(setMovilidades).catch(() => setMovilidades([]))
  }, [])

  const cambiarSeccion = (index: number, cambios: Partial<SeccionState>) =>
    setSecciones((prev) => prev.map((s, i) => (i === index ? { ...s, ...cambios } : s)))

  const agregarSeccion = () => setSecciones((prev) => [...prev, seccionVacia()])

  const eliminarSeccion = (index: number) =>
    setSecciones((prev) => prev.filter((_, i) => i !== index))

  const agregarItem = (seccionIndex: number) =>
    setSecciones((prev) =>
      prev.map((s, i) => (i === seccionIndex ? { ...s, items: [...s.items, itemVacio()] } : s))
    )

  const eliminarItem = (seccionIndex: number, itemIndex: number) =>
    setSecciones((prev) =>
      prev.map((s, i) =>
        i === seccionIndex ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) } : s
      )
    )

  const cambiarItem = (seccionIndex: number, itemIndex: number, cambios: Partial<ItemState>) =>
    setSecciones((prev) =>
      prev.map((s, i) =>
        i === seccionIndex
          ? { ...s, items: s.items.map((it, j) => (j === itemIndex ? { ...it, ...cambios } : it)) }
          : s
      )
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorLocal(null)

    if (!nombre.trim() || movilidadId === '') {
      setErrorLocal('Completá el nombre del checklist y elegí una movilidad.')
      return
    }

    const seccionesLimpias: ChecklistTemplateRequest['secciones'] = []
    for (const seccion of secciones) {
      const nombreSeccion = seccion.nombre.trim()
      const items = seccion.items.filter((it) => it.nombre.trim())
      if (!nombreSeccion || items.length === 0) continue

      const itemsLimpios = []
      for (const it of items) {
        if (it.requiereCantidad) {
          const cantidad = Number(it.cantidadEsperada)
          if (it.cantidadEsperada === '' || !Number.isInteger(cantidad) || cantidad < 0) {
            setErrorLocal(`Indicá la cantidad esperada de "${it.nombre.trim()}" (${nombreSeccion}).`)
            return
          }
        }
        itemsLimpios.push({
          nombre: it.nombre.trim(),
          descripcion: it.descripcion.trim() || undefined,
          requiereCantidad: it.requiereCantidad,
          cantidadEsperada: it.requiereCantidad ? Number(it.cantidadEsperada) : undefined,
          obligatorio: it.obligatorio,
        })
      }
      seccionesLimpias.push({ nombre: nombreSeccion, items: itemsLimpios })
    }

    if (seccionesLimpias.length === 0) {
      setErrorLocal('Agregá al menos una sección con al menos un ítem.')
      return
    }

    const ok = await onGuardar({ nombre: nombre.trim(), movilidadId, secciones: seccionesLimpias })
    if (ok && !inicial) {
      setNombre('')
      setMovilidadId('')
      setSecciones([seccionVacia()])
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre del checklist"
          placeholder="Check del Móvil 2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          fullWidth
        />
        <TextField
          select
          label="Movilidad"
          value={movilidadId}
          onChange={(e) => setMovilidadId(Number(e.target.value))}
          required
          fullWidth
        >
          {movilidades.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box className="flex flex-col gap-4">
        {secciones.map((seccion, seccionIndex) => (
          <Paper
            key={seccionIndex}
            elevation={0}
            className="rounded-xl! flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3 sm:p-4"
          >
            <Box className="flex items-center gap-2">
              <TextField
                label={`Encabezado de sección ${seccionIndex + 1}`}
                placeholder="Parte del conductor"
                value={seccion.nombre}
                onChange={(e) => cambiarSeccion(seccionIndex, { nombre: e.target.value })}
                size="small"
                fullWidth
              />
              <Tooltip title="Eliminar sección">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => eliminarSeccion(seccionIndex)}
                    disabled={secciones.length === 1}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box className="flex flex-col gap-2">
              {seccion.items.map((item, itemIndex) => (
                <Paper
                  key={itemIndex}
                  elevation={0}
                  className="rounded-lg! flex flex-col gap-2 border border-slate-200 bg-white p-3"
                >
                  <Box className="flex items-center gap-2">
                    <TextField
                      placeholder="Ítem (ej: Máscaras de respiración)"
                      value={item.nombre}
                      onChange={(e) => cambiarItem(seccionIndex, itemIndex, { nombre: e.target.value })}
                      size="small"
                      fullWidth
                    />
                    <Tooltip title="Agregar aclaración">
                      <IconButton
                        size="small"
                        color={item.mostrarDescripcion ? 'primary' : 'default'}
                        onClick={() =>
                          cambiarItem(seccionIndex, itemIndex, {
                            mostrarDescripcion: !item.mostrarDescripcion,
                          })
                        }
                      >
                        <NotesRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar ítem">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => eliminarItem(seccionIndex, itemIndex)}
                          disabled={seccion.items.length === 1}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  <Collapse in={item.mostrarDescripcion} unmountOnExit>
                    <TextField
                      placeholder="Aclaración opcional (ej: verificar presión)"
                      value={item.descripcion}
                      onChange={(e) =>
                        cambiarItem(seccionIndex, itemIndex, { descripcion: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  </Collapse>

                  <Box className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={item.requiereCantidad}
                          onChange={(e) =>
                            cambiarItem(seccionIndex, itemIndex, {
                              requiereCantidad: e.target.checked,
                            })
                          }
                        />
                      }
                      label={<Typography variant="body2">Requiere cantidad</Typography>}
                    />
                    <Collapse in={item.requiereCantidad} orientation="horizontal" unmountOnExit>
                      <TextField
                        label="Cantidad esperada"
                        type="number"
                        value={item.cantidadEsperada}
                        onChange={(e) =>
                          cambiarItem(seccionIndex, itemIndex, { cantidadEsperada: e.target.value })
                        }
                        size="small"
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ width: 150 }}
                      />
                    </Collapse>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={item.obligatorio}
                          onChange={(e) =>
                            cambiarItem(seccionIndex, itemIndex, { obligatorio: e.target.checked })
                          }
                        />
                      }
                      label={<Typography variant="body2">Obligatorio</Typography>}
                    />
                  </Box>
                </Paper>
              ))}

              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => agregarItem(seccionIndex)}
                className="self-start!"
              >
                Agregar ítem
              </Button>
            </Box>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={agregarSeccion}
          className="self-start!"
        >
          Agregar sección
        </Button>
      </Box>

      {(errorLocal || error) && (
        <Alert severity="error" variant="outlined">
          {errorLocal || error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary">
        Los encabezados y los ítems son texto libre. Activá "Requiere cantidad" en los elementos que
        se cuentan (máscaras, mangueras, etc.); los ítems no obligatorios pueden quedar sin
        controlar al realizar el checklist.
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={<SaveRoundedIcon />}
        disabled={loading}
        className="self-start!"
      >
        {loading ? 'Guardando...' : (textoBoton ?? 'Crear checklist')}
      </Button>
    </Box>
  )
}

export default ChecklistTemplateBuilder
