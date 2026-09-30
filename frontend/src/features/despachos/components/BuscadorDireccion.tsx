import { Alert, Autocomplete, Box, Chip, TextField, Typography } from '@mui/material'
import type { ResultadoDireccion } from '../types'
import useBusquedaDireccion from '../hooks/useBusquedaDireccion'

// La búsqueda por texto solo devuelve Maipú o Mendoza; "fuera de
// Mendoza" solo aparece marcando un punto a mano en el mapa.
const ETIQUETA_AMBITO: Record<ResultadoDireccion['ambito'], string> = {
  MAIPU: 'Maipú',
  MENDOZA: 'Mendoza',
  FUERA: 'Fuera de Mendoza',
}

const ESTILO_AMBITO: Record<ResultadoDireccion['ambito'], { bgcolor: string; color: string }> = {
  MAIPU: { bgcolor: '#DCFCE7', color: '#15803D' },
  MENDOZA: { bgcolor: '#FEF3C7', color: '#B45309' },
  FUERA: { bgcolor: '#FEE2E2', color: '#B91C1C' },
}

interface Props {
  valor: string
  label: string
  placeholder?: string
  // Texto que ya corresponde a una dirección resuelta (elegida de la
  // lista o marcada en el mapa): no se vuelve a buscar, porque su
  // ubicación ya se conoce.
  textoElegido?: string | null
  onCambiarTexto: (texto: string) => void
  // Solo se dispara al elegir una dirección de la lista, no al tipear.
  onElegir: (resultado: ResultadoDireccion) => void
}

// Campo de dirección con sugerencias de OpenStreetMap. Busca primero
// dentro de Maipú y, si ahí no hay nada, en el resto de Mendoza.
const BuscadorDireccion = ({
  valor,
  label,
  placeholder,
  textoElegido,
  onCambiarTexto,
  onElegir,
}: Props) => {
  const { opciones, buscando, error } = useBusquedaDireccion(valor === textoElegido ? '' : valor)

  // Si ninguna coincidencia es de Maipú, hubo que ampliar la búsqueda a
  // la provincia: conviene avisarlo antes de mandar el móvil lejos.
  const soloFueraDeMaipu = opciones.length > 0 && opciones.every((o) => o.ambito === 'MENDOZA')

  return (
    <Box className="flex flex-col gap-2">
      <Autocomplete
        freeSolo
        // Las opciones ya vienen filtradas por el buscador; si MUI
        // volviera a filtrarlas por texto, descartaría resultados
        // válidos escritos de otra forma.
        filterOptions={(opcionesSinFiltrar) => opcionesSinFiltrar}
        options={opciones}
        loading={buscando}
        inputValue={valor}
        onInputChange={(_, texto) => onCambiarTexto(texto)}
        onChange={(_, elegido) => {
          if (elegido && typeof elegido !== 'string') onElegir(elegido)
        }}
        getOptionLabel={(opcion) => (typeof opcion === 'string' ? opcion : opcion.etiqueta)}
        renderOption={(props, opcion) => {
          const { key, ...resto } = props as typeof props & { key: string }
          return (
            <Box component="li" key={key} {...resto} className={`${props.className} gap-2!`}>
              <Box className="min-w-0 flex-1">
                <Typography variant="body2" className="truncate font-medium!">
                  {opcion.etiqueta}
                </Typography>
                <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                  {opcion.direccionCompleta}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={ETIQUETA_AMBITO[opcion.ambito]}
                sx={{ ...ESTILO_AMBITO[opcion.ambito], fontWeight: 700, flexShrink: 0 }}
              />
            </Box>
          )
        }}
        loadingText="Buscando la dirección..."
        noOptionsText="No se encontró esa dirección en Maipú ni en Mendoza. Marcala en el mapa."
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            helperText={
              buscando
                ? 'Buscando la dirección...'
                : 'Escribí la dirección y elegila de la lista para ubicarla en el mapa'
            }
          />
        )}
      />

      {soloFueraDeMaipu && (
        <Alert severity="info" variant="outlined">
          No se encontró esa dirección en Maipú. Estas son las coincidencias más cercanas en Mendoza.
        </Alert>
      )}
      {error && (
        <Alert severity="warning" variant="outlined">
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default BuscadorDireccion
