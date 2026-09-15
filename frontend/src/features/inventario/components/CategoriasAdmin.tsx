import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import SubdirectoryArrowRightRoundedIcon from '@mui/icons-material/SubdirectoryArrowRightRounded'
import useCategorias from '../hooks/useCategorias'
import type { CategoriaEquipo } from '../types'

// Administración de categorías y subcategorías (árbol de dos niveles).
const CategoriasAdmin = () => {
  const { categorias, raices, loading, error, agregar, editar, eliminar } = useCategorias()

  const [nombreNueva, setNombreNueva] = useState('')
  const [padreNueva, setPadreNueva] = useState<number | ''>('')
  const [editando, setEditando] = useState<CategoriaEquipo | null>(null)
  const [nombreEdicion, setNombreEdicion] = useState('')
  const [eliminando, setEliminando] = useState<CategoriaEquipo | null>(null)

  const handleAgregar = async () => {
    if (!nombreNueva.trim()) return
    const ok = await agregar(nombreNueva.trim(), padreNueva === '' ? null : padreNueva)
    if (ok) {
      setNombreNueva('')
      setPadreNueva('')
    }
  }

  const handleGuardarEdicion = async () => {
    if (!editando || !nombreEdicion.trim()) return
    const ok = await editar(editando.id, nombreEdicion.trim(), editando.padreId)
    if (ok) setEditando(null)
  }

  const confirmarEliminar = async () => {
    if (eliminando) await eliminar(eliminando.id)
    setEliminando(null)
  }

  const fila = (categoria: CategoriaEquipo, esSub: boolean) => (
    <Box
      key={categoria.id}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 ${esSub ? 'ml-7' : ''}`}
    >
      <Box className="flex min-w-0 items-center gap-2">
        {esSub ? (
          <SubdirectoryArrowRightRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
        ) : (
          <CategoryRoundedIcon sx={{ fontSize: 18, color: '#9F1239' }} />
        )}
        <Typography variant="body2" className={`truncate ${esSub ? '' : 'font-semibold!'}`}>
          {categoria.nombre}
        </Typography>
      </Box>
      <Box className="flex shrink-0 items-center">
        <Tooltip title="Renombrar">
          <IconButton
            size="small"
            aria-label={`Renombrar ${categoria.nombre}`}
            onClick={() => {
              setEditando(categoria)
              setNombreEdicion(categoria.nombre)
            }}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            color="error"
            aria-label={`Eliminar ${categoria.nombre}`}
            onClick={() => setEliminando(categoria)}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Paper elevation={0} className="rounded-2xl! flex flex-col gap-4 border border-slate-200 p-4 sm:p-5">
      <Box>
        <Typography variant="subtitle1" className="font-semibold!">
          Categorías
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Organizá el equipamiento; las subcategorías cuelgan de una categoría principal.
        </Typography>
      </Box>

      <Box className="flex flex-col gap-2 sm:flex-row">
        <TextField
          label="Nueva categoría"
          placeholder="Ej: Equipos de espuma"
          size="small"
          fullWidth
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
        />
        <TextField
          select
          label="Dentro de"
          size="small"
          value={padreNueva}
          onChange={(e) => setPadreNueva(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">— Nivel principal —</MenuItem>
          {raices.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAgregar}
          disabled={loading || !nombreNueva.trim()}
          className="shrink-0"
        >
          Agregar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" onClose={undefined}>
          {error}
        </Alert>
      )}

      <Box className="flex flex-col">
        {raices.map((raiz) => (
          <Box key={raiz.id} className="flex flex-col">
            {fila(raiz, false)}
            {categorias
              .filter((c) => c.padreId === raiz.id)
              .map((sub) => fila(sub, true))}
          </Box>
        ))}
        {!loading && raices.length === 0 && (
          <Typography variant="body2" color="text.secondary" className="py-4 text-center">
            No hay categorías creadas.
          </Typography>
        )}
      </Box>

      <Dialog open={editando !== null} onClose={() => setEditando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Renombrar categoría</DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            {editando?.padreId !== null && editando !== null && (
              <Chip label="Subcategoría" size="small" className="mb-2!" />
            )}
            <TextField
              label="Nombre"
              fullWidth
              value={nombreEdicion}
              onChange={(e) => setNombreEdicion(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEditando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleGuardarEdicion} disabled={!nombreEdicion.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={eliminando !== null} onClose={() => setEliminando(null)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold!">Eliminar categoría</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{eliminando?.nombre}" se elimina
            {eliminando?.padreId === null ? ' junto con sus subcategorías' : ''}. Los equipos que la
            usan no se borran, pero quedan sin esa categoría.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="px-6! pb-4!">
          <Button onClick={() => setEliminando(null)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default CategoriasAdmin
