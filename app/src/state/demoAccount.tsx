import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useDemoStore } from './store'

export type DemoAccount = 'customer' | 'team'

const STORAGE_KEY = 'pi2go-demo-account'

type DemoAccountContextValue = {
  account: DemoAccount
  setAccount: (account: DemoAccount) => void
}

const DemoAccountContext = createContext<DemoAccountContextValue | null>(null)

function readAccount(): DemoAccount {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'customer' || saved === 'team') return saved
    if (saved === 'guest') {
      window.localStorage.setItem(STORAGE_KEY, 'customer')
      return 'customer'
    }
  } catch {
    // Storage may be unavailable in a private browser context; use the customer demo.
  }
  return 'customer'
}

export function DemoAccountProvider({ children }: { children: ReactNode }) {
  const [account, updateAccount] = useState<DemoAccount>(readAccount)

  function setAccount(next: DemoAccount) {
    // A customer starts from an empty request, never a sample one or staff's selection.
    if (next === 'customer') useDemoStore.getState().startBlankDraft()
    updateAccount(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The selected demo account remains active for this render even if it cannot persist.
    }
  }

  const value = useMemo(() => ({ account, setAccount }), [account])
  return <DemoAccountContext.Provider value={value}>{children}</DemoAccountContext.Provider>
}

export function useDemoAccount() {
  const context = useContext(DemoAccountContext)
  if (!context) throw new Error('useDemoAccount must be used within DemoAccountProvider.')
  return context
}

export const demoAccountLabels: Record<DemoAccount, string> = {
  customer: 'Customer',
  team: 'Pearl Island team',
}
