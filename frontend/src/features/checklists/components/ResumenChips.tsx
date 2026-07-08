import { Box, Chip } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import type { ResumenRegistro } from '../types'
import { ESTILO_ITEM_ESTADO } from '../constants'

interface Props {
  resumen: ResumenRegistro
  size?: 'small' | 'medium'
}

// Estado general de un registro en chips, sin abrir el detalle:
// "✓ 58 correctos · ⚠ 2 faltantes · 1 sobrante · 3 observaciones".
// Si no hay diferencias muestra un único chip "Todo correcto".
const ResumenChips = ({ resumen, size = 'small' }: Props) => {
  const sinDiferencias =
    resumen.faltantes === 0 && resumen.sobrantes === 0 && resumen.novedades === 0

  const chip = (
    key: string,
    label: string,
    estilo: { color: string; bg: string },
    icon: React.ReactElement
  ) => (
    <Chip
      key={key}
      icon={icon}
      label={label}
      size={size}
      sx={{
        bgcolor: estilo.bg,
        color: estilo.color,
        fontWeight: 600,
        '& .MuiChip-icon': { color: estilo.color },
      }}
    />
  )

  const chips: React.ReactElement[] = []

  if (sinDiferencias) {
    chips.push(
      chip(
        'todo-ok',
        `Todo correcto (${resumen.correctos})`,
        ESTILO_ITEM_ESTADO.CORRECTO,
        <CheckCircleRoundedIcon />
      )
    )
  } else {
    chips.push(
      chip('correctos', `${resumen.correctos} correctos`, ESTILO_ITEM_ESTADO.CORRECTO, <CheckCircleRoundedIcon />)
    )
    if (resumen.faltantes > 0) {
      chips.push(
        chip(
          'faltantes',
          `${resumen.faltantes} ${resumen.faltantes === 1 ? 'faltante' : 'faltantes'}`,
          ESTILO_ITEM_ESTADO.FALTANTE,
          <WarningAmberRoundedIcon />
        )
      )
    }
    if (resumen.sobrantes > 0) {
      chips.push(
        chip(
          'sobrantes',
          `${resumen.sobrantes} ${resumen.sobrantes === 1 ? 'sobrante' : 'sobrantes'}`,
          ESTILO_ITEM_ESTADO.SOBRANTE,
          <AddCircleOutlineRoundedIcon />
        )
      )
    }
    if (resumen.novedades > 0) {
      chips.push(
        chip(
          'novedades',
          `${resumen.novedades} ${resumen.novedades === 1 ? 'novedad' : 'novedades'}`,
          ESTILO_ITEM_ESTADO.NOVEDAD,
          <ErrorOutlineRoundedIcon />
        )
      )
    }
  }

  if (resumen.noControlados > 0) {
    chips.push(
      chip(
        'no-controlados',
        `${resumen.noControlados} sin controlar`,
        ESTILO_ITEM_ESTADO.NO_CONTROLADO,
        <ErrorOutlineRoundedIcon />
      )
    )
  }
  if (resumen.conObservacion > 0) {
    chips.push(
      chip(
        'observaciones',
        `${resumen.conObservacion} ${resumen.conObservacion === 1 ? 'observación' : 'observaciones'}`,
        { color: '#475569', bg: '#F1F5F9' },
        <ChatBubbleOutlineRoundedIcon />
      )
    )
  }

  return <Box className="flex flex-wrap items-center gap-1.5">{chips}</Box>
}

export default ResumenChips
