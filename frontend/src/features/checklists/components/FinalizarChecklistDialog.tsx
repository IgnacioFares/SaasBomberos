import { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DrawRoundedIcon from '@mui/icons-material/DrawRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { Bombero } from '../../../types'
import type { ResumenRegistro } from '../types'
import { getBomberos } from '../../bomberos/services/bomberoService'
import { useAuthContext } from '../../auth/hooks/useAuthContext'
import ResumenChips from './ResumenChips'

interface Props {
  open: boolean
  resumen: ResumenRegistro
  guardando: boolean
  error: string | null
  onCerrar: () => void
  onConfirmar: (participantesIds: number[], observacionGeneral: string) => void
}

// Paso final antes de enviar: quiénes participaron además del
// responsable, observación general y el resumen de lo controlado.
// Al confirmar, el checklist queda pendiente de firma del encargado.
const FinalizarChecklistDialog = ({
  open,
  resumen,
  guardando,
  error,
  onCerrar,
  onConfirmar,
}: Props) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { usuario } = useAuthContext()

  const [bomberos, setBomberos] = useState<Bombero[]>([])
  const [participantes, setParticipantes] = useState<Bombero[]>([])
  const [observacionGeneral, setObservacionGeneral] = useState('')

  useEffect(() => {
    if (!open) return
    getBomberos()
      .then((datos) =>
        setBomberos(
          datos.filter((b) => b.activo !== false && b.id !== usuario?.bombero?.id)
        )
      )
      .catch(() => setBomberos([]))
  }, [open, usuario?.bombero?.id])

  return (
    <Dialog open={open} onClose={guardando ? undefined : onCerrar} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle className="font-bold!">Finalizar checklist</DialogTitle>
      <DialogContent className="flex flex-col gap-5">
        <Box className="flex flex-col gap-2">
          <Typography variant="subtitle2" color="text.secondary">
            Resumen del control
          </Typography>
          <ResumenChips resumen={resumen} />
        </Box>

        <Box className="flex flex-col gap-2">
          <Typography variant="subtitle2" color="text.secondary">
            Responsable
          </Typography>
          <Chip
            label={`${usuario?.bombero?.nombre ?? ''} ${usuario?.bombero?.apellido ?? ''}`}
            sx={{ bgcolor: '#FFE4E6', color: '#9F1239', fontWeight: 600, alignSelf: 'flex-start' }}
          />
        </Box>

        <Autocomplete
          multiple
          options={bomberos}
          value={participantes}
          onChange={(_, valor) => setParticipantes(valor)}
          getOptionLabel={(b) => `${b.nombre} ${b.apellido}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="¿Quiénes más participaron?"
              placeholder="Agregar bomberos (opcional)"
            />
          )}
        />

        <TextField
          label="Observación general"
          placeholder="Notas adicionales sobre este control (opcional)"
          multiline
          minRows={2}
          fullWidth
          value={observacionGeneral}
          onChange={(e) => setObservacionGeneral(e.target.value)}
        />

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions className="px-6! pb-5!">
        <Button onClick={onCerrar} disabled={guardando} startIcon={<CloseRoundedIcon />} color="inherit">
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<DrawRoundedIcon />}
          disabled={guardando}
          onClick={() =>
            onConfirmar(
              participantes.map((b) => b.id).filter((id): id is number => id != null),
              observacionGeneral
            )
          }
        >
          {guardando ? 'Enviando...' : 'Solicitar firma'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FinalizarChecklistDialog
