import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Link, Typography } from '@mui/material'
import AuthLayout from '../components/AuthLayout'
import LoginForm from '../components/LoginForm'
import { useAuthContext } from '../hooks/useAuthContext'
import type { LoginRequest } from '../types'

const LoginPage = () => {
  const { estaAutenticado, cargando, error, iniciarSesion } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const mensajeExito = (location.state as { mensaje?: string } | null)?.mensaje

  if (!cargando && estaAutenticado) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (credenciales: LoginRequest) => {
    setLoading(true)
    const ok = await iniciarSesion(credenciales)
    setLoading(false)
    if (ok) {
      navigate('/dashboard', { replace: true })
    }
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
      {mensajeExito && (
        <Alert severity="success" variant="outlined" className="mb-4!">
          {mensajeExito}
        </Alert>
      )}
      <LoginForm onLogin={handleLogin} loading={loading} error={error} />
    </AuthLayout>
  )
}

export default LoginPage
