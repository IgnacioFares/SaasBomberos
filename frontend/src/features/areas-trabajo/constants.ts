export const formatearFecha = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export const formatearFechaHora = (iso: string): string => {
  const fecha = new Date(iso)
  return `${fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}

export const estaVencida = (fechaLimite: string): boolean =>
  new Date(`${fechaLimite}T23:59:59`).getTime() < Date.now()

// true si se completó después del día límite (23:59 de fechaLimite).
export const seCompletoFueraDePlazo = (fechaLimite: string, completadaEn: string): boolean =>
  new Date(completadaEn).getTime() > new Date(`${fechaLimite}T23:59:59`).getTime()

// "YYYY-MM" a partir de una fecha (con o sin hora), para comparar contra el filtro de mes.
export const mesDe = (iso: string): string => iso.slice(0, 7)
