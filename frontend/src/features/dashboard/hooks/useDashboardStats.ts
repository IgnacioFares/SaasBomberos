import { useEffect, useState } from 'react'
import api from '../../../services'
import { getBomberos } from '../../bomberos/services/bomberoService'
import { getRegistros } from '../../checklists/services/checklistService'

interface DashboardStats {
  bomberosActivos: number | null
  movilidades: number | null
  checklistsPendientes: number | null
  cargando: boolean
}

const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    bomberosActivos: null,
    movilidades: null,
    checklistsPendientes: null,
    cargando: true,
  })

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      const [bomberosResultado, movilidadesResultado, checklistsResultado] = await Promise.allSettled([
        getBomberos(),
        api.get('/api/movilidades'),
        getRegistros({ estado: 'PENDIENTE_FIRMA' }),
      ])

      if (!activo) return

      setStats({
        bomberosActivos:
          bomberosResultado.status === 'fulfilled'
            ? bomberosResultado.value.filter((b) => b.activo !== false).length
            : null,
        movilidades:
          movilidadesResultado.status === 'fulfilled'
            ? (movilidadesResultado.value.data as unknown[]).length
            : null,
        checklistsPendientes:
          checklistsResultado.status === 'fulfilled' ? checklistsResultado.value.length : null,
        cargando: false,
      })
    }

    cargar()

    return () => {
      activo = false
    }
  }, [])

  return stats
}

export default useDashboardStats
