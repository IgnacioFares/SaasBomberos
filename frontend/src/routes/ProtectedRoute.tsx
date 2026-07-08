import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuthContext } from '../features/auth/hooks/useAuthContext'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { estaAutenticado, cargando } = useAuthContext()

  if (cargando) {
    return (
      <Box className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
