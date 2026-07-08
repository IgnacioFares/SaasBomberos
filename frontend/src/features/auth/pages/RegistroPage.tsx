import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { Link, Typography } from '@mui/material'
import AuthLayout from '../components/AuthLayout'
import RegistroForm from '../components/RegistroForm'
import { useAuthContext } from '../hooks/useAuthContext'
import type { RegisterRequest } from '../types'

const RegistroPage = () => {
  const { estaAutenticado, cargando, error, registrarse } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (!cargando && estaAutenticado) {
    return <Navigate to="/dashboard" replace />
  }

  const handleRegistrar = async (datos: RegisterRequest) => {
    setLoading(true)
    const ok = await registrarse(datos)
    setLoading(false)
    if (ok) {
      navigate('/login', {
        replace: true,
        state: { mensaje: 'Cuenta creada con éxito. Ya podés iniciar sesión.' },
      })
    }
  }

  return (
    <AuthLayout
      titulo="Crear cuenta"
      subtitulo="Registrá tus datos para acceder al sistema de gestión del cuartel."
      ancho="md"
      footer={
        <Typography variant="body2" color="text.secondary">
          ¿Ya tenés cuenta?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </Typography>
      }
    >
      <RegistroForm onRegistrar={handleRegistrar} loading={loading} error={error} />
    </AuthLayout>
  )
}

export default RegistroPage
