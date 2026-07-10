export interface Bombero {
  id?: number
  nombre: string
  apellido: string
  dni: string
  email?: string
  telefono?: string
  rango?: string
  fechaIngreso?: string
  // Datos médicos y de emergencia (se cargan al registrarse).
  telefonoEmergencia?: string
  obraSocial?: string
  enfermedades?: string
  grupoSanguineo?: string
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