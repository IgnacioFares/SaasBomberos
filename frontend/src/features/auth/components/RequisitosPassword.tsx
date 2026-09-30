import { Box, LinearProgress, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { fuerzaDe, requisitosDe, type DatosPersonales } from '../politicaPassword'

interface Props {
  password: string
  datos: DatosPersonales
}

// Colores fijos, no del tema: esta pantalla se ve siempre igual esté
// el sistema en modo claro u oscuro.
const nivel = (fuerza: number) => {
  if (fuerza >= 90) return { etiqueta: 'Contraseña segura', color: '#16A34A' }
  if (fuerza >= 60) return { etiqueta: 'Le falta poco', color: '#D97706' }
  return { etiqueta: 'Contraseña débil', color: '#DC2626' }
}

// Checklist en vivo de lo que pide la política de contraseñas, para que
// no haya que adivinar por qué el registro rebota.
const RequisitosPassword = ({ password, datos }: Props) => {
  if (password.length === 0) return null

  const requisitos = requisitosDe(password, datos)
  const fuerza = fuerzaDe(password, datos)
  const { etiqueta, color } = nivel(fuerza)

  return (
    <Box className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <Box className="flex items-center justify-between gap-2">
        <Typography variant="caption" sx={{ color: '#475569' }}>
          Seguridad de la contraseña
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
          {etiqueta}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={fuerza}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: '#E2E8F0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 999 },
        }}
      />

      <Box className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {requisitos.map((requisito) => (
          <Box key={requisito.texto} className="flex items-center gap-1.5">
            {requisito.cumple ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 15, color: '#16A34A' }} />
            ) : (
              <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
            )}
            <Typography
              variant="caption"
              sx={{ color: requisito.cumple ? '#15803D' : '#64748B' }}
            >
              {requisito.texto}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default RequisitosPassword
