import { useEffect, useState } from 'react'
import api from '../../../services'
import { getBomberos } from '../../bomberos/services/bomberoService'
import { getRegistros } from '../../checklists/services/checklistService'
import { getEquipos } from '../../inventario/services/inventarioService'
import type { ChecklistRegistro } from '../../checklists/types'
import type { Movilidad } from '../../../types'

export interface AlertaInventario {
  id: number
  nombre: string
  estado: 'VENCIDO' | 'POR_VENCER'
  fecha: string | null
}

interface DashboardStats {
  cargando: boolean
  bomberosActivos: number | null
  movilidadesEnServicio: number | null
  movilidadesFuera: number
  elementosInventario: number | null
  // Registros pendientes de firma (la notificación principal del panel).
  pendientesFirma: ChecklistRegistro[]
  registrosRecientes: ChecklistRegistro[]
  alertasInventario: AlertaInventario[]
}

const INICIAL: DashboardStats = {
  cargando: true,
  bomberosActivos: null,
  movilidadesEnServicio: null,
  movilidadesFuera: 0,
  elementosInventario: null,
  pendientesFirma: [],
  registrosRecientes: [],
  alertasInventario: [],
}

const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>(INICIAL)

  useEffect(() => {
    let activo = true

    const cargar = async () => {
      const [bomberosR, movilidadesR, registrosR, equiposR] = await Promise.allSettled([
        getBomberos(),
        api.get('/api/movilidades'),
        getRegistros(),
        getEquipos(),
      ])

      if (!activo) return

      const movilidades: Movilidad[] =
        movilidadesR.status === 'fulfilled' ? movilidadesR.value.data : []
      const registros = registrosR.status === 'fulfilled' ? registrosR.value : []
      const equipos = equiposR.status === 'fulfilled' ? equiposR.value : []

      const alertas: AlertaInventario[] = equipos
        .filter((e) => e.estadoVencimiento === 'VENCIDO' || e.estadoVencimiento === 'POR_VENCER')
        .map((e) => ({
          id: e.id,
          nombre: e.nombre,
          estado: e.estadoVencimiento as 'VENCIDO' | 'POR_VENCER',
          fecha:
            e.fechaVencimiento ??
            e.unidades
              .map((u) => u.fechaVencimiento)
              .filter((f): f is string => Boolean(f))
              .sort()[0] ??
            null,
        }))
        .sort((a, b) => (a.fecha ?? '9999').localeCompare(b.fecha ?? '9999'))

      setStats({
        cargando: false,
        bomberosActivos:
          bomberosR.status === 'fulfilled'
            ? bomberosR.value.filter((b) => b.activo !== false).length
            : null,
        movilidadesEnServicio:
          movilidadesR.status === 'fulfilled'
            ? movilidades.filter((m) => m.enServicio).length
            : null,
        movilidadesFuera: movilidades.filter((m) => !m.enServicio).length,
        elementosInventario:
          equiposR.status === 'fulfilled'
            ? equipos.reduce((total, e) => total + (e.cantidad ?? 0), 0)
            : null,
        pendientesFirma: registros.filter((r) => r.estado === 'PENDIENTE_FIRMA'),
        registrosRecientes: registros.slice(0, 4),
        alertasInventario: alertas,
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
