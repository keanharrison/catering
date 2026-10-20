import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { routes } from './routes'
import { EventPage } from './views/customer/EventPage'
import { MenuPageShell } from './views/customer/MenuPageShell'
import { SuppliesPage } from './views/customer/SuppliesPage'
import { DetailsPage } from './views/customer/DetailsPage'
import { ReviewPage } from './views/customer/ReviewPage'
import { AppShell } from './components/AppShell'
import { ThemeProvider } from './components/ThemeProvider'
import { DemoAccountProvider, useDemoAccount } from './state/demoAccount'
import { stagePath } from './views/customer/journey'
import { StaffPage } from './views/staff/StaffPage'
import { HandoffPage } from './views/handoff/HandoffPage'
import { OrdersPage } from './views/customer/OrdersPage'
import { MessagesPage } from './views/messages/MessagesPage'
import { CustomerMessagesPage } from './views/messages/CustomerMessagesPage'
import { WorkspacePage } from './views/staff/WorkspacePage'
import { SettingsPage } from './views/settings/SettingsPage'

export function AppRoutes() {
  const { account } = useDemoAccount()
  const customerPage = (page: ReactNode) =>
    account === 'team' ? <Navigate to={routes.staff} replace /> : page

  return (
    <Routes>
      <Route path="/" element={<Navigate to={routes.customer} replace />} />
      <Route path={stagePath('event')} element={customerPage(<EventPage />)} />
      <Route path={stagePath('menu')} element={customerPage(<MenuPageShell />)} />
      <Route path={stagePath('supplies')} element={customerPage(<SuppliesPage />)} />
      <Route path={stagePath('details')} element={customerPage(<DetailsPage />)} />
      <Route path={stagePath('review')} element={customerPage(<ReviewPage />)} />
      <Route
        path={routes.staff}
        element={account === 'team' ? <StaffPage /> : <Navigate to={routes.customer} replace />}
      />
      <Route path={routes.currentOrders} element={customerPage(<OrdersPage kind="current" />)} />
      <Route path={routes.pastOrders} element={customerPage(<OrdersPage kind="past" />)} />
      <Route path={routes.customerMessages} element={customerPage(<CustomerMessagesPage />)} />
      <Route path={routes.staffMessages} element={account === 'team' ? <MessagesPage /> : <Navigate to={routes.customer} replace />} />
      {(['integrations', 'agents', 'staffSettings'] as const).map(area => (
        <Route key={area} path={routes[area]} element={account === 'team' ? <WorkspacePage area={area} /> : <Navigate to={routes.customer} replace />} />
      ))}
      <Route path={routes.settings} element={<SettingsPage />} />
      <Route path={routes.handoff} element={account === 'team' ? <HandoffPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.gallery} element={<Navigate to={routes.customer} replace />} />
      <Route path="*" element={<Navigate to={routes.customer} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <DemoAccountProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </DemoAccountProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
