import { useContext } from 'react'
import { AuthContext } from '../context/authContextInstance'

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider')
  }
  return context
}
