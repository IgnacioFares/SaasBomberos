import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import type { ChecklistTemplateRequest } from '../types'
import type { Movilidad } from '../../../types'
import { getMovilidades } from '../../movilidades/services/movilidadService'

interface SeccionState {
  nombre: string
  items: { nombre: string }[]
}

interface Props {
  onGuardar: (data: ChecklistTemplateRequest) => Promise<boolean>
  loading: boolean
  error: string | null
}

const seccionVacia = (): SeccionState => ({ nombre: '', items: [{ nombre: '' }] })

const ChecklistTemplateBuilder = ({ onGuardar, loading, error }: Props) => {
  const [movilidades, setMovilidades] = useState<Movilidad[]>([])
  const [nombre, setNombre] = useState('')
  const [movilidadId, setMovilidadId] = useState<number | ''>('')
  const [secciones, setSecciones] = useState<SeccionState[]>([seccionVacia()])
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  useEffect(() => {
    getMovilidades().then(setMovilidades).catch(() => setMovilidades([]))
  }, [])

  const cambiarNombreSeccion = (index: number, valor: string) => {
    setSecciones((prev) => prev.map((s, i) => (i === index ? { ...s, nombre: valor } : s)))
  }

  const agregarSeccion = () => setSecciones((prev) => [...prev, seccionVacia()])

  const eliminarSeccion = (index: number) =>
    setSecciones((prev) => prev.filter((_, i) => i !== index))

  const agregarItem = (seccionIndex: number) =>
    setSecciones((prev) =>
      prev.map((s, i) => (i === seccionIndex ? { ...s, items: [...s.items, { nombre: '' }] } : s))
    )

  const eliminarItem = (seccionIndex: number, itemIndex: number) =>
    setSecciones((prev) =>
      prev.map((s, i) =>
        i === seccionIndex ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) } : s
      )
    )

  const cambiarNombreItem = (seccionIndex: number, itemIndex: number, valor: string) =>
    setSecciones((prev) =>
      prev.map((s, i) =>
        i === seccionIndex
          ? { ...s, items: s.items.map((it, j) => (j === itemIndex ? { nombre: valor } : it)) }
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
    const seccionesLimpias = secciones
      .map((s) => ({ nombre: s.nombre.trim(), items: s.items.map((it) => ({ nombre: it.nombre.trim() })).filter((it) => it.nombre) }))
      .filter((s) => s.nombre && s.items.length > 0)

    if (seccionesLimpias.length === 0) {
      setErrorLocal('Agregá al menos una sección con al menos un ítem.')
      return
    }

    const ok = await onGuardar({ nombre: nombre.trim(), movilidadId, secciones: seccionesLimpias })
    if (ok) {
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
            className="rounded-xl! flex flex-col gap-3 border border-slate-200 bg-slate-50 p-4"
          >
            <Box className="flex items-center gap-2">
              <TextField
                label={`Encabezado de sección ${seccionIndex + 1}`}
                placeholder="Parte del conductor"
                value={seccion.nombre}
                onChange={(e) => cambiarNombreSeccion(seccionIndex, e.target.value)}
                size="small"
                fullWidth
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => eliminarSeccion(seccionIndex)}
                disabled={secciones.length === 1}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box className="flex flex-col gap-2 pl-2">
              {seccion.items.map((item, itemIndex) => (
                <Box key={itemIndex} className="flex items-center gap-2">
                  <TextField
                    placeholder="Ítem (ej: Alcohol)"
                    value={item.nombre}
                    onChange={(e) => cambiarNombreItem(seccionIndex, itemIndex, e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <IconButton
                    size="small"
                    onClick={() => eliminarItem(seccionIndex, itemIndex)}
                    disabled={seccion.items.length === 1}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
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
        Definí las secciones y los ítems como quieras: cada encabezado y cada ítem son texto libre.
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        startIcon={<SaveRoundedIcon />}
        disabled={loading}
        className="self-start!"
      >
        {loading ? 'Guardando...' : 'Crear checklist'}
      </Button>
    </Box>
  )
}

export default ChecklistTemplateBuilder
