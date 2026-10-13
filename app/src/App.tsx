import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { customerRoutes, routes } from './routes'
import { Gallery } from './views/Gallery'
import { IntakePage } from './views/customer/IntakePage'
import { Placeholder } from './views/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to={routes.customer} replace />} />
          <Route path={customerRoutes.intake} element={<IntakePage />} />
          <Route
            path={customerRoutes.recommendation}
            element={
              <Placeholder
                eyebrow="Your menu"
                title="Your suggested menu."
                note="Placeholder. Recommendations arrive in the next build step."
              />
            }
          />
          <Route
            path={`${routes.staff}/*`}
            element={
              <Placeholder
                eyebrow="Staff"
                title="Requests needing attention."
                note="Placeholder. The staff workspace arrives in later build steps."
              />
            }
          />
          <Route
            path={`${routes.handoff}/*`}
            element={
              <Placeholder
                eyebrow="Handoff"
                title="Order handoff preview."
                note="Placeholder. Simulated summary, calendar and kitchen views arrive in later build steps."
              />
            }
          />
          <Route path={routes.gallery} element={<Gallery />} />
          <Route path="*" element={<Navigate to={routes.customer} replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
