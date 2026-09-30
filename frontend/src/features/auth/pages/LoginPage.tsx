import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Link, Typography } from '@mui/material'
import AuthLayout from '../components/AuthLayout'
import LoginForm from '../components/LoginForm'
import VerificacionEmailForm from '../components/VerificacionEmailForm'
import { useAuthContext } from '../hooks/useAuthContext'
import type { LoginRequest } from '../types'

const LoginPage = () => {
  const { estaAutenticado, cargando, error, iniciarSesion } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(
    (location.state as { mensaje?: string } | null)?.mensaje ?? null
  )
  // Quien se registró y nunca confirmó el código termina acá: en vez de
  // un error sin salida, se le muestra el paso de verificación.
  const [emailAVerificar, setEmailAVerificar] = useState<string | null>(null)

  if (!cargando && estaAutenticado) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (credenciales: LoginRequest) => {
    setLoading(true)
    setMensaje(null)
    const resultado = await iniciarSesion(credenciales)
    setLoading(false)
    if (resultado.ok) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (resultado.faltaVerificar) setEmailAVerificar(credenciales.email)
  }

  if (emailAVerificar) {
    return (
      <AuthLayout
        titulo="Verificá tu email"
        subtitulo="Tu cuenta existe, pero falta confirmar el correo antes de entrar."
        footer={
          <Typography variant="body2" color="text.secondary">
            <Link
              component="button"
              type="button"
              onClick={() => setEmailAVerificar(null)}
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Volver al inicio de sesión
            </Link>
          </Typography>
        }
      >
        <VerificacionEmailForm
          email={emailAVerificar}
          onVerificado={() => {
            setEmailAVerificar(null)
            setMensaje('Cuenta verificada. Ya podés iniciar sesión.')
          }}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titulo="Iniciar sesión"
      subtitulo="Ingresá con tu cuenta para acceder al sistema de gestión."
      footer={
        <Typography variant="body2" color="text.secondary">
          ¿No tenés cuenta todavía?{' '}
          <Link component={RouterLink} to="/registro" underline="hover" sx={{ fontWeight: 600 }}>
            Registrate
          </Link>
        </Typography>
      }
    >
      {mensaje && (
        <Alert severity="success" variant="outlined" className="mb-4!">
          {mensaje}
        </Alert>
      )}
      <LoginForm onLogin={handleLogin} loading={loading} error={error} />
    </AuthLayout>
  )
}

export default LoginPage
