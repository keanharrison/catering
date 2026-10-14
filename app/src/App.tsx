import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { routes } from './routes'
import { Gallery } from './views/Gallery'
import { DetailsPage } from './views/customer/DetailsPage'
import { IntakePage } from './views/customer/IntakePage'
import { MenuPage } from './views/customer/MenuPage'
import { ReviewPage } from './views/customer/ReviewPage'
import { SuppliesPage } from './views/customer/SuppliesPage'
import { stagePath } from './views/customer/journey'
import { HandoffPage } from './views/handoff/HandoffPage'
import { StaffPage } from './views/staff/StaffPage'

export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to={routes.customer} replace />} />
        <Route path={stagePath('event')} element={<IntakePage />} />
        <Route path={stagePath('menu')} element={<MenuPage />} />
        <Route path={stagePath('supplies')} element={<SuppliesPage />} />
        <Route path={stagePath('details')} element={<DetailsPage />} />
        <Route path={stagePath('review')} element={<ReviewPage />} />
        <Route path={routes.staff} element={<StaffPage />} />
        <Route path={routes.handoff} element={<HandoffPage />} />
        <Route path={routes.gallery} element={<Gallery />} />
        <Route path="*" element={<Navigate to={routes.customer} replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
