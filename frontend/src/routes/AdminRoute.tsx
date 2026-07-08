import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth/hooks/useAuthContext'

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuthContext()

  if (usuario?.rol !== 'Administrador') {
    return <Navigate to="/checklists" replace />
  }

  return children
}

export default AdminRoute
