// Espejo de PoliticaPassword del backend: las mismas reglas, para que
// el formulario avise mientras se escribe en vez de rebotar el registro
// después. La validación que vale es siempre la del servidor.

export const LARGO_MINIMO = 10
export const LARGO_MAXIMO = 64

export interface Requisito {
  texto: string
  cumple: boolean
}

const sinAcentos = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ /g, '')

const COMUNES = [
  'password', 'contrasena', 'qwerty', '123456', '1234567890',
  'bomberos', 'bombero', 'cuartel', 'admin', 'administrador', 'iloveyou',
  'abc123', '111111', '000000', 'asdasd', 'zxcvbnm', 'letmein',
]

export interface DatosPersonales {
  email?: string
  nombre?: string
  apellido?: string
  dni?: string
}

const esComun = (password: string): boolean => {
  const normalizada = sinAcentos(password)
  return COMUNES.some((comun) => normalizada.includes(sinAcentos(comun)))
}

const usaDatosPersonales = (password: string, datos: DatosPersonales): boolean => {
  const normalizada = sinAcentos(password)
  const usuarioDelEmail = datos.email?.includes('@')
    ? datos.email.slice(0, datos.email.indexOf('@'))
    : datos.email
  return [usuarioDelEmail, datos.nombre, datos.apellido, datos.dni]
    .filter((dato): dato is string => Boolean(dato))
    .map(sinAcentos)
    .some((dato) => dato.length >= 4 && normalizada.includes(dato))
}

// Lista que se muestra debajo del campo mientras se escribe.
export const requisitosDe = (password: string, datos: DatosPersonales): Requisito[] => [
  { texto: `Al menos ${LARGO_MINIMO} caracteres`, cumple: password.length >= LARGO_MINIMO },
  { texto: 'Una letra mayúscula', cumple: /[A-ZÁÉÍÓÚÑÜ]/.test(password) },
  { texto: 'Una letra minúscula', cumple: /[a-záéíóúñü]/.test(password) },
  { texto: 'Un número', cumple: /\d/.test(password) },
  {
    texto: 'Sin tu nombre, email ni DNI',
    cumple: password.length > 0 && !usaDatosPersonales(password, datos),
  },
  { texto: 'Que no sea una contraseña común', cumple: password.length > 0 && !esComun(password) },
]

export const cumpleTodo = (password: string, datos: DatosPersonales): boolean =>
  password.length <= LARGO_MAXIMO && requisitosDe(password, datos).every((r) => r.cumple)

// Fuerza aproximada, solo para el color de la barra: cuántos requisitos
// cumple, con un empujón por longitud. No pretende medir entropía real.
export const fuerzaDe = (password: string, datos: DatosPersonales): number => {
  if (password.length === 0) return 0
  const cumplidos = requisitosDe(password, datos).filter((r) => r.cumple).length
  const porRequisitos = (cumplidos / 6) * 80
  const porLargo = Math.min(password.length / 16, 1) * 20
  return Math.round(porRequisitos + porLargo)
}
