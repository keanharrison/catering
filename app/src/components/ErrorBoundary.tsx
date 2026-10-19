import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STORAGE_KEY } from '../state/store'
import { Button } from './Button'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Called after saved data is cleared. Defaults to reloading the customer start page. */
  onReset?: () => void
}

// Last line of defense: if a screen throws, show a way out instead of a blank page.
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen failed to render', error, info.componentStack)
  }

  private reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    if (this.props.onReset) this.props.onReset()
    else window.location.assign('/customer')
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="mx-auto max-w-xl px-6 py-24">
        <h1 className="type-page-title">Something went wrong.</h1>
        <p className="mt-6 text-muted">
          This page could not load. Clearing the saved request and starting over usually fixes it.
        </p>
        <div className="mt-8">
          <Button onClick={this.reset}>Start over</Button>
        </div>
      </main>
    )
  }
}
