import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconCheck, IconChefHat, IconMoon, IconPin, IconSun, IconUser } from '@tabler/icons-react'
import { demoAccountLabels, useDemoAccount, type DemoAccount } from '../state/demoAccount'
import { Dropdown } from './Dropdown'
import { accountHome, navigation } from './navigation'
import { useResolvedTheme } from './ThemeBridge'
import { useTheme } from '../components/ThemeProvider'

const FOLD_KEY = 'pi2go-tabler-sidebar'

function useFoldedSidebar() {
  const [folded, setFolded] = useState(() => document.documentElement.getAttribute('data-bs-sidebar') === 'folded-hover')
  function toggle() {
    const next = !folded
    setFolded(next)
    if (next) document.documentElement.setAttribute('data-bs-sidebar', 'folded-hover')
    else document.documentElement.removeAttribute('data-bs-sidebar')
    try {
      localStorage.setItem(FOLD_KEY, next ? 'folded' : 'expanded')
    } catch {
      // Storage can be unavailable; the fold state still applies for this visit.
    }
  }
  return { folded, toggle }
}

const accountOptions: Array<{ value: DemoAccount; icon: typeof IconUser }> = [
  { value: 'customer', icon: IconUser },
  { value: 'team', icon: IconChefHat },
]

const accountNames: Record<DemoAccount, string> = { customer: 'Customer demo account', team: 'Pearl Island team account' }

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { account, setAccount } = useDemoAccount()
  const { setTheme } = useTheme()
  const resolved = useResolvedTheme()
  const { folded, toggle } = useFoldedSidebar()
  const [menuOpen, setMenuOpen] = useState(false)

  // Mobile: choosing a destination (or resizing to desktop) closes the collapsed menu.
  useEffect(() => setMenuOpen(false), [pathname])

  function chooseAccount(next: DemoAccount, close: () => void) {
    close()
    if (next === account) return
    setAccount(next)
    navigate(accountHome[next])
  }

  const nextTheme = resolved === 'dark' ? 'light' : 'dark'

  return (
    <aside className="navbar navbar-vertical navbar-expand-lg">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="sidebar-menu"
          aria-expanded={menuOpen}
          aria-label="Toggle sidebar navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="navbar-brand navbar-brand-autodark">
          <a href={`#${accountHome[account]}`} aria-label="Pearl Island2GO home" className="d-flex align-items-center gap-2">
            <img src="/branding/pearl-island-logo.png" alt="" width={33} height={32} className="brand-mark navbar-brand-image" />
          </a>
          <button
            type="button"
            // Attribute only: Tabler's CSS hides this button while the rail is folded and not hovered/focused. No Bootstrap JS runs.
            data-bs-toggle="sidebar-folded"
            className="btn btn-action btn-sm d-none d-lg-inline-flex"
            aria-pressed={folded}
            aria-label={folded ? 'Keep sidebar expanded' : 'Collapse sidebar to icons'}
            title={folded ? 'Keep sidebar expanded' : 'Collapse sidebar to icons'}
            onClick={toggle}
          >
            <IconPin className="icon" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="navbar-footer">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Dropdown className="dropup">
                {({ triggerProps, menuProps, close }) => (
                  <>
                    <button type="button" className="nav-link w-100" aria-label={`${demoAccountLabels[account]} account menu`} {...triggerProps}>
                      <span className="avatar avatar-sm" aria-hidden="true">
                        {account === 'team' ? <IconChefHat className="icon" /> : <IconUser className="icon" />}
                      </span>
                      <div className="nav-link-title">
                        {demoAccountLabels[account]}
                        <div className="small text-secondary">Demo account</div>
                      </div>
                    </button>
                    <div {...menuProps}>
                      {accountOptions.map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={account === value}
                          className="dropdown-item"
                          onClick={() => chooseAccount(value, close)}
                        >
                          <Icon className="icon dropdown-item-icon" aria-hidden="true" />
                          {accountNames[value]}
                          {account === value && <IconCheck className="icon ms-auto" aria-hidden="true" />}
                        </button>
                      ))}
                      <div className="dropdown-divider" role="separator" />
                      <span role="menuitem" aria-disabled="true" className="dropdown-item disabled">
                        Sign-in and permissions are not connected in this demo.
                      </span>
                    </div>
                  </>
                )}
              </Dropdown>
            </li>
          </ul>
        </div>

        <nav className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="sidebar-menu" aria-label="Sidebar">
          <ul className="navbar-nav pt-lg-3">
            {navigation[account].map((section) => (
              <SectionItems key={section.title} section={section} pathname={pathname} />
            ))}
          </ul>
          <div className="navbar-side">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button type="button" className="nav-link" aria-label={`Switch to ${nextTheme} mode`} onClick={() => setTheme(nextTheme)}>
                  <span className="nav-link-icon">
                    {resolved === 'dark' ? <IconSun className="icon" aria-hidden="true" /> : <IconMoon className="icon" aria-hidden="true" />}
                  </span>
                  <span className="nav-link-title">{resolved === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

function SectionItems({ section, pathname }: { section: (typeof navigation)['customer'][number]; pathname: string }) {
  return (
    <>
      <li className="nav-section-title">{section.title}</li>
      {section.items.map(({ label, icon: Icon, href }) => {
        const active = pathname === href
        return (
          <li key={href} className={`nav-item${active ? ' active' : ''}`}>
            <Link to={href} className="nav-link" aria-current={active ? 'page' : undefined}>
              <span className="nav-link-icon">
                <Icon className="icon" aria-hidden="true" />
              </span>
              <span className="nav-link-title">{label}</span>
            </Link>
          </li>
        )
      })}
    </>
  )
}
