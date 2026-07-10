import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './features/auth/pages/LoginPage'
import RegistroPage from './features/auth/pages/RegistroPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import BomberosPage from './features/bomberos/pages/BomberosPage'
import MovilidadesPage from './features/movilidades/pages/MovilidadesPage'
import ChecklistsPage from './features/checklists/pages/ChecklistsPage'
import NuevoChecklistPage from './features/checklists/pages/NuevoChecklistPage'
import EditarChecklistPage from './features/checklists/pages/EditarChecklistPage'
import RealizarChecklistPage from './features/checklists/pages/RealizarChecklistPage'
import RegistroDetallePage from './features/checklists/pages/RegistroDetallePage'
import InventarioPage from './features/inventario/pages/InventarioPage'
import NuevoEquipoPage from './features/inventario/pages/NuevoEquipoPage'
import EditarEquipoPage from './features/inventario/pages/EditarEquipoPage'
import EquipoDetallePage from './features/inventario/pages/EquipoDetallePage'
import AdministracionPage from './features/administracion/pages/AdministracionPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bomberos" element={<BomberosPage />} />
        <Route path="/movilidades" element={<MovilidadesPage />} />
        <Route path="/checklists" element={<ChecklistsPage />} />
        <Route path="/checklists/nuevo" element={<NuevoChecklistPage />} />
        <Route path="/checklists/:id/editar" element={<EditarChecklistPage />} />
        <Route path="/checklists/:id/realizar" element={<RealizarChecklistPage />} />
        <Route path="/checklists/registros/:id" element={<RegistroDetallePage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/inventario/nuevo" element={<NuevoEquipoPage />} />
        <Route path="/inventario/:id" element={<EquipoDetallePage />} />
        <Route path="/inventario/:id/editar" element={<EditarEquipoPage />} />
        <Route path="/administracion" element={<AdministracionPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
