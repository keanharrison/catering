import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { routes } from './routes'
import { Placeholder } from './views/Placeholder'

const nav = [
  { to: routes.customer, label: 'Customer' },
  { to: routes.staff, label: 'Staff' },
  { to: routes.handoff, label: 'Handoff' },
]

export default function App() {
  return (
    <BrowserRouter>
      <header className="flex items-center justify-between border-b border-line bg-panel px-6 py-4">
        <span className="font-sans text-xl tracking-tight">Pearl Island2GO</span>
        <nav className="flex gap-6 font-sans text-sm">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to={routes.customer} replace />} />
          <Route
            path={`${routes.customer}/*`}
            element={
              <Placeholder
                eyebrow="Customer"
                title="Plan your catering order."
                note="Placeholder. Intake and recommendations arrive in later build steps."
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
          <Route path="*" element={<Navigate to={routes.customer} replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
