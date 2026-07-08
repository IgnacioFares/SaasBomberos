export interface Bombero {
  id?: number
  nombre: string
  apellido: string
  dni: string
  email?: string
  telefono?: string
  rango?: string
  fechaIngreso?: string
  activo?: boolean
}

export interface Movilidad {
  id?: number
  nombre: string
  patente?: string
  modelo?: string
  marca?: string
  kilometraje: number
  enServicio: boolean
  descripcion?: string
  activo?: boolean
}