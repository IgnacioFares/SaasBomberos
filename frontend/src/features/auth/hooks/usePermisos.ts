import { useAuthContext } from './useAuthContext'

// Nombres de los permisos funcionales (espejo del catálogo del backend).
export const PERMISOS = {
  GESTIONAR_MOVILIDADES: 'gestionar_movilidades',
  DESPACHAR_MOVILIDADES: 'despachar_movilidades',
  CREAR_CHECKLISTS: 'crear_checklists',
  FIRMAR_CHECKLISTS: 'firmar_checklists',
  GESTIONAR_INVENTARIO: 'gestionar_inventario',
  MOVER_STOCK: 'mover_stock',
  GESTIONAR_PERSONAL: 'gestionar_personal',
  GESTIONAR_AREAS_TRABAJO: 'gestionar_areas_trabajo',
  GESTIONAR_PARTES: 'gestionar_partes',
} as const

// Oculta acciones para las que el usuario no tiene permiso. El gate
// real vive en el backend (AutorizacionService): esto es solo UX.
const usePermisos = () => {
  const { usuario } = useAuthContext()
  const esAdmin = usuario?.rol === 'Administrador'

  const tienePermiso = (permiso: string): boolean =>
    esAdmin || (usuario?.permisos ?? []).includes(permiso)

  return { esAdmin, tienePermiso }
}

export default usePermisos
