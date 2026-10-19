import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { IconPlus } from '@tabler/icons-react'
import { demoAccountLabels, useDemoAccount } from '../state/demoAccount'
import { accountHome, findDestination } from './navigation'
import { routes } from '../routes'
import { PreviewContent } from './PreviewContent'
import { StaffRequests } from './staff/StaffRequests'
import { Sidebar } from './Sidebar'

function Page() {
  const { pathname } = useLocation()
  const { account } = useDemoAccount()
  const destination = findDestination(account, pathname)

  // After navigating, move focus to the page so keyboard users start at the top. Not on first load, so the
  // skip link stays first in the Tab order.
  const lastPath = useRef(pathname)
  useEffect(() => {
    document.title = destination ? `${destination.label} · Pearl Island2GO (Tabler preview)` : 'Pearl Island2GO (Tabler preview)'
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    document.getElementById('content')?.focus({ preventScroll: true })
  }, [destination, pathname])

  if (!destination) return <Navigate to={accountHome[account]} replace />

  // Staff Requests is the first migrated product page; every other destination still shows the Phase 1 examples.
  const isStaffRequests = pathname === routes.staff
  const title = isStaffRequests ? 'Catering requests' : destination.label
  const primary = account === 'team' ? { label: 'Open requests', href: '/staff' } : { label: 'New request', href: '/customer' }

  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{demoAccountLabels[account]}</div>
              <h1 className="page-title">{title}</h1>
            </div>
            <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <a className="btn d-none d-sm-inline-flex" href={destination.href}>
                  Open current screen
                </a>
                {!isStaffRequests && (
                  <>
                    <a className="btn btn-primary d-none d-sm-inline-flex" href={primary.href}>
                      <IconPlus className="icon" aria-hidden="true" />
                      {primary.label}
                    </a>
                    <a className="btn btn-primary d-sm-none btn-icon" href={primary.href} aria-label={primary.label}>
                      <IconPlus className="icon" aria-hidden="true" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <main id="content" tabIndex={-1} className="page-body">
        <div className="container-xl">
          {isStaffRequests ? <StaffRequests /> : <PreviewContent />}
        </div>
      </main>
    </div>
  )
}

export function PreviewShell() {
  return (
    <div className="page">
      <a className="visually-hidden-focusable btn btn-primary position-absolute m-2" style={{ zIndex: 1100 }} href="#content">
        Skip to main content
      </a>
      <Sidebar />
      <Routes>
        <Route path="*" element={<Page />} />
      </Routes>
    </div>
  )
}
