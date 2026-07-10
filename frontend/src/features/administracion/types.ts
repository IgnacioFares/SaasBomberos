export interface RolInfo {
  id: number
  nombre: string
}

export interface PermisoInfo {
  nombre: string
  etiqueta: string
  descripcion: string
}

export interface UsuarioAdmin {
  id: number
  email: string
  estado: string
  nombre: string
  apellido: string
  rango: string
  rol: RolInfo
  permisosExtra: string[]
  createdAt: string
}
