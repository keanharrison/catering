import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from './icons'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { deriveNotifications } from '../lib/notifications'
import { useDemoAccount } from '../state/demoAccount'
import { useDemoStore } from '../state/store'

const SEEN_KEY = 'x-notifications-seen'

function readSeen() {
  try { return localStorage.getItem(SEEN_KEY) ?? '' } catch { return '' }
}

export function NotificationsMenu() {
  const { account } = useDemoAccount()
  const orders = useDemoStore((state) => state.orders)
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)
  const items = deriveNotifications(orders, account)
  const unread = items.filter((item) => item.at > seen).length

  function markSeen() {
    const newest = items[0]?.at ?? ''
    if (!newest || newest <= seen) return
    setSeen(newest)
    try { localStorage.setItem(SEEN_KEY, newest) } catch { /* The list still works if storage is blocked. */ }
  }

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) markSeen() }}>
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'}
        render={<button type="button" className="relative flex size-11 shrink-0 items-center justify-center rounded-[10px] text-foreground shadow-[inset_0_0_0_1px_var(--input)] transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-9" />}
      >
        <Bell aria-hidden="true" />
        {unread > 0 && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 rounded-2xl p-2">
        <p className="px-3 pb-2 pt-2 text-[14px] text-foreground">Notifications</p>
        {items.length === 0 ? (
          <p className="px-3 pb-3 text-[14px] text-muted-foreground">You’re all caught up.</p>
        ) : (
          <ul className="grid gap-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-[14px] leading-[1.35] text-foreground no-underline transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block">{item.title}</span>
                  {item.detail && <span className="mt-0.5 block text-[13px] text-muted-foreground">{item.detail}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
