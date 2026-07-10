import { useCallback, useEffect, useState } from 'react'
import type { PermisoInfo, RolInfo, UsuarioAdmin } from '../types'
import { getUsuarios, getPermisosDisponibles, getRoles, updatePermisos, updateRol } from '../services/adminService'
import { extraerMensajeError } from '../../../utils/http'

const useUsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [permisosDisponibles, setPermisosDisponibles] = useState<PermisoInfo[]>([])
  const [roles, setRoles] = useState<RolInfo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [guardando, setGuardando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      const [usuariosData, permisosData, rolesData] = await Promise.all([
        getUsuarios(),
        getPermisosDisponibles(),
        getRoles(),
      ])
      setUsuarios(usuariosData)
      setPermisosDisponibles(permisosData)
      setRoles(rolesData)
    } catch (err) {
      setError(extraerMensajeError(err, 'Error al cargar los usuarios'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Aplica rol (si cambió) y permisos extra en una sola operación de UI.
  const guardar = async (usuario: UsuarioAdmin, rolId: number, permisos: string[]) => {
    setGuardando(true)
    setError(null)
    try {
      if (rolId !== usuario.rol.id) {
        await updateRol(usuario.id, rolId)
      }
      await updatePermisos(usuario.id, permisos)
      await cargar()
      return true
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudieron guardar los cambios'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  return { usuarios, permisosDisponibles, roles, loading, guardando, error, guardar, limpiarError: () => setError(null) }
}

export default useUsuariosAdmin
