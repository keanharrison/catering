import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { routes } from './routes'
import { EventPage } from './views/customer/EventPage'
import { MenuPageShell } from './views/customer/MenuPageShell'
import { SuppliesPage } from './views/customer/SuppliesPage'
import { DetailsPage } from './views/customer/DetailsPage'
import { ReviewPage } from './views/customer/ReviewPage'
import { AppShell } from './components/AppShell'
import { DemoAccountProvider, useDemoAccount } from './state/demoAccount'
import { useDemoStore } from './state/store'
import { stagePath } from './views/customer/journey'
import { StaffPage } from './views/staff/StaffPage'
import { HandoffPage } from './views/handoff/HandoffPage'
import { OrdersPage } from './views/customer/OrdersPage'
import { DraftsPage } from './views/customer/DraftsPage'
import { AnalyticsPage } from './views/staff/AnalyticsPage'
import { IntegrationsPage } from './views/staff/IntegrationsPage'
import { CalendarPage } from './views/staff/CalendarPage'
import { AdminSettingsPage } from './views/staff/AdminSettingsPage'
import { ChatPage } from './views/customer/ChatPage'
import { PlanIntakePage } from './views/customer/PlanIntakePage'
import { MessagesPage } from './views/messages/MessagesPage'
import { CustomerMessagesPage } from './views/messages/CustomerMessagesPage'
import { WorkspacePage } from './views/staff/WorkspacePage'
import { SettingsPage } from './views/settings/SettingsPage'

const LEGACY_DASHBOARD_PATH = '/customer/dashboard'

export function AppRoutes() {
  const { account } = useDemoAccount()
  const activeIsSample = useDemoStore((state) => Boolean(state.order.demoSample))
  // A saved session can reopen on a sample request that staff selected; customers start from their own draft.
  useEffect(() => {
    if (account === 'customer' && activeIsSample) useDemoStore.getState().activateDraft()
  }, [account, activeIsSample])
  const customerPage = (page: ReactNode) =>
    account === 'team' ? <Navigate to={routes.staff} replace /> : page

  return (
    <Routes>
      <Route path="/" element={<Navigate to={routes.customer} replace />} />
      <Route path={stagePath('event')} element={customerPage(<EventPage />)} />
      <Route path={routes.planRequest} element={customerPage(<PlanIntakePage />)} />
      <Route path={stagePath('menu')} element={customerPage(<MenuPageShell />)} />
      <Route path={stagePath('supplies')} element={customerPage(<SuppliesPage />)} />
      <Route path={stagePath('details')} element={customerPage(<DetailsPage />)} />
      <Route path={stagePath('review')} element={customerPage(<ReviewPage />)} />
      <Route
        path={routes.staff}
        element={account === 'team' ? <StaffPage /> : <Navigate to={routes.customer} replace />}
      />
      {/* The Dashboard was folded into Chat; keep old links working. */}
      <Route path={LEGACY_DASHBOARD_PATH} element={<Navigate to={routes.askPearl} replace />} />
      <Route path={routes.askPearl} element={customerPage(<ChatPage />)} />
      <Route path={routes.drafts} element={customerPage(<DraftsPage />)} />
      <Route path={routes.currentOrders} element={customerPage(<OrdersPage kind="current" />)} />
      <Route path={routes.pastOrders} element={customerPage(<OrdersPage kind="past" />)} />
      <Route path={routes.customerMessages} element={customerPage(<CustomerMessagesPage />)} />
      <Route path={routes.analytics} element={account === 'team' ? <AnalyticsPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.staffMessages} element={account === 'team' ? <MessagesPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.calendar} element={account === 'team' ? <CalendarPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.integrations} element={account === 'team' ? <IntegrationsPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.agents} element={account === 'team' ? <WorkspacePage area="agents" /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.staffSettings} element={account === 'team' ? <AdminSettingsPage /> : <Navigate to={routes.customer} replace />} />
      <Route path={routes.settings} element={<SettingsPage />} />
      <Route path={routes.handoff} element={account === 'team' ? <HandoffPage /> : <Navigate to={routes.customer} replace />} />
      <Route path="*" element={<Navigate to={routes.customer} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoAccountProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </DemoAccountProvider>
    </BrowserRouter>
  )
}
