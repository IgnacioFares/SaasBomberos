import { isAxiosError } from 'axios'

export const extraerMensajeError = (err: unknown, fallback: string): string => {
  if (isAxiosError(err) && typeof err.response?.data?.mensaje === 'string') {
    return err.response.data.mensaje
  }
  return fallback
}
