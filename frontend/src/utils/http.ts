import { isAxiosError } from 'axios'

export const extraerMensajeError = (err: unknown, fallback: string): string => {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === 'string') {
    return err.response.data.mensaje
  }
  return fallback
}

// El backend responde 403 con este código cuando el email y la
// contraseña son correctos pero falta confirmar la dirección.
export const esEmailNoVerificado = (err: unknown): boolean =>
  isAxiosError(err) && err.response?.data?.codigo === 'EMAIL_NO_VERIFICADO'
