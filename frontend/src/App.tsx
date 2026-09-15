import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import ForceLightTheme from './theme/ForceLightTheme'
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
import AreasTrabajoPage from './features/areas-trabajo/pages/AreasTrabajoPage'
import AreaTrabajoDetallePage from './features/areas-trabajo/pages/AreaTrabajoDetallePage'
import PartesPage from './features/partes/pages/PartesPage'
import SeleccionarTipoPartePage from './features/partes/pages/SeleccionarTipoPartePage'
import ParteFormPage from './features/partes/pages/ParteFormPage'
import ParteDetallePage from './features/partes/pages/ParteDetallePage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<ForceLightTheme><LoginPage /></ForceLightTheme>} />
      <Route path="/registro" element={<ForceLightTheme><RegistroPage /></ForceLightTheme>} />

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
        <Route path="/areas-trabajo" element={<AreasTrabajoPage />} />
        <Route path="/areas-trabajo/:id" element={<AreaTrabajoDetallePage />} />
        <Route path="/partes" element={<PartesPage />} />
        <Route path="/partes/nuevo" element={<SeleccionarTipoPartePage />} />
        <Route path="/partes/nuevo/:tipo" element={<ParteFormPage />} />
        <Route path="/partes/:id/editar" element={<ParteFormPage />} />
        <Route path="/partes/:id" element={<ParteDetallePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
