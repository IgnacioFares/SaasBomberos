import { useEffect, useState } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded'
import { reenviarCodigo, verificarEmail } from '../services/authService'
import { extraerMensajeError } from '../../../utils/http'
import CampoCodigo from './CampoCodigo'

interface Props {
  email: string
  onVerificado: () => void
}

// El backend no deja pedir otro código antes de este tiempo.
const ESPERA_REENVIO_SEGUNDOS = 60

// Segundo paso del registro: confirmar que el email existe y es de
// quien se registró.
const VerificacionEmailForm = ({ email, onVerificado }: Props) => {
  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [segundosParaReenviar, setSegundosParaReenviar] = useState(ESPERA_REENVIO_SEGUNDOS)

  // Cuenta regresiva hasta poder pedir otro código.
  useEffect(() => {
    if (segundosParaReenviar <= 0) return
    const temporizador = setTimeout(() => setSegundosParaReenviar((s) => s - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [segundosParaReenviar])

  const confirmar = async (codigoAConfirmar: string) => {
    setVerificando(true)
    setError(null)
    try {
      await verificarEmail(email, codigoAConfirmar)
      onVerificado()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo verificar el código'))
      setVerificando(false)
    }
  }

  const pedirOtroCodigo = async () => {
    setError(null)
    setAviso(null)
    try {
      await reenviarCodigo(email)
      setAviso('Te mandamos un código nuevo.')
      setSegundosParaReenviar(ESPERA_REENVIO_SEGUNDOS)
      setCodigo('')
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo reenviar el código'))
    }
  }

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex flex-col items-center gap-2 text-center">
        <Box
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          sx={{ bgcolor: '#FEE2E2' }}
        >
          <MarkEmailReadRoundedIcon sx={{ color: '#B91C1C', fontSize: 28 }} />
        </Box>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          Escribí el código de 6 dígitos que enviamos a
        </Typography>
        <Typography variant="body2" className="font-bold!" sx={{ color: '#0F172A' }}>
          {email}
        </Typography>
      </Box>

      <CampoCodigo
        valor={codigo}
        deshabilitado={verificando}
        onCambiar={(nuevo) => {
          setCodigo(nuevo)
          setError(null)
        }}
        // Al completar los 6 dígitos se confirma solo: un botón más
        // para apretar no aporta nada.
        onCompleto={confirmar}
      />

      {aviso && (
        <Alert severity="success" variant="outlined">
          {aviso}
        </Alert>
      )}
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={verificando || codigo.length < 6}
        onClick={() => confirmar(codigo)}
        className="py-2.5!"
      >
        {verificando ? 'Verificando...' : 'Verificar mi cuenta'}
      </Button>

      <Box className="flex flex-col items-center gap-1">
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          ¿No te llegó? Revisá la carpeta de correo no deseado.
        </Typography>
        <Button
          size="small"
          onClick={pedirOtroCodigo}
          disabled={segundosParaReenviar > 0 || verificando}
        >
          {segundosParaReenviar > 0
            ? `Reenviar código en ${segundosParaReenviar}s`
            : 'Reenviar código'}
        </Button>
      </Box>
    </Box>
  )
}

export default VerificacionEmailForm
