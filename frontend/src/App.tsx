import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import LoginPage from './features/auth/pages/LoginPage'
import RegistroPage from './features/auth/pages/RegistroPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import BomberosPage from './features/bomberos/pages/BomberosPage'
import MovilidadesPage from './features/movilidades/pages/MovilidadesPage'
import ChecklistsPage from './features/checklists/pages/ChecklistsPage'
import NuevoChecklistPage from './features/checklists/pages/NuevoChecklistPage'
import RealizarChecklistPage from './features/checklists/pages/RealizarChecklistPage'

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
        <Route
          path="/checklists/nuevo"
          element={
            <AdminRoute>
              <NuevoChecklistPage />
            </AdminRoute>
          }
        />
        <Route path="/checklists/:id/realizar" element={<RealizarChecklistPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App