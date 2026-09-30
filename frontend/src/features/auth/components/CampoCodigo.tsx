import { useRef } from 'react'
import { Box, TextField } from '@mui/material'

interface Props {
  valor: string
  deshabilitado?: boolean
  onCambiar: (codigo: string) => void
  onCompleto: (codigo: string) => void
}

const DIGITOS = 6

// Seis casillas para el código del mail. Se comporta como se espera de
// este tipo de campo: salta solo a la siguiente, el backspace vuelve
// atrás, y pegar el código completo lo reparte entre las casillas.
const CampoCodigo = ({ valor, deshabilitado, onCambiar, onCompleto }: Props) => {
  const casillas = useRef<(HTMLInputElement | null)[]>([])

  const enfocar = (indice: number) => {
    casillas.current[Math.max(0, Math.min(DIGITOS - 1, indice))]?.focus()
  }

  const escribir = (indice: number, texto: string) => {
    const soloDigitos = texto.replace(/\D/g, '')
    if (soloDigitos.length === 0) return

    const actual = valor.padEnd(DIGITOS, ' ').split('')
    // Si se pegó el código entero, se reparte desde esta casilla.
    soloDigitos.split('').forEach((digito, desplazamiento) => {
      const destino = indice + desplazamiento
      if (destino < DIGITOS) actual[destino] = digito
    })

    const nuevo = actual.join('').replace(/ /g, '')
    onCambiar(nuevo)
    enfocar(indice + soloDigitos.length)
    if (nuevo.length === DIGITOS) onCompleto(nuevo)
  }

  const borrar = (indice: number) => {
    const actual = valor.split('')
    if (actual[indice]) {
      actual[indice] = ''
      onCambiar(actual.join('').trimEnd())
      return
    }
    // Casilla vacía: se borra la anterior y el foco va con ella.
    actual[indice - 1] = ''
    onCambiar(actual.join('').trimEnd())
    enfocar(indice - 1)
  }

  return (
    <Box className="flex justify-center gap-2">
      {Array.from({ length: DIGITOS }, (_, indice) => (
        <TextField
          key={indice}
          value={valor[indice] ?? ''}
          disabled={deshabilitado}
          onChange={(e) => escribir(indice, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault()
              borrar(indice)
            }
            if (e.key === 'ArrowLeft') enfocar(indice - 1)
            if (e.key === 'ArrowRight') enfocar(indice + 1)
          }}
          onFocus={(e) => e.target.select()}
          inputRef={(elemento) => {
            casillas.current[indice] = elemento
          }}
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              autoComplete: indice === 0 ? 'one-time-code' : 'off',
              maxLength: DIGITOS,
              'aria-label': `Dígito ${indice + 1} del código`,
              style: { textAlign: 'center', fontSize: 24, fontWeight: 700, padding: '12px 0' },
            },
          }}
          sx={{ width: 52 }}
        />
      ))}
    </Box>
  )
}

export default CampoCodigo
