import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoAccountProvider, useDemoAccount, type DemoAccount } from '../state/demoAccount'
import '@fontsource-variable/inter'
import './login.css'

function LoginPage() {
  const { setAccount } = useDemoAccount()

  function enter(account: DemoAccount) {
    setAccount(account)
    window.location.assign(account === 'team' ? '/staff' : '/customer')
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <img className="login-mark" src="/branding/pearl-island-logo.png" alt="Pearl Island" width="52" height="52" />
        <h1 id="login-title">Log in to Pearl Island 2 GO</h1>
        <div className="login-actions">
          <button className="login-button login-button-primary" type="button" onClick={() => enter('customer')}>
            Continue as a customer
          </button>
          <button className="login-button login-button-secondary" type="button" onClick={() => enter('team')}>
            Continue as restaurant staff
          </button>
        </div>
        <p className="login-caption">Demo access. No password required.</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><DemoAccountProvider><LoginPage /></DemoAccountProvider></StrictMode>,
)
