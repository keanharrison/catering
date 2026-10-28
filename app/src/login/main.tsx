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
      <span className="login-wordmark" aria-hidden="true">X</span>
      <section className="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Log in to X</h1>
        <div className="login-actions">
          <button className="login-button login-button-primary" type="button" onClick={() => enter('customer')}>
            Continue as a customer
          </button>
          <button className="login-button login-button-secondary" type="button" onClick={() => enter('team')}>
            Continue as restaurant staff
          </button>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><DemoAccountProvider><LoginPage /></DemoAccountProvider></StrictMode>,
)
