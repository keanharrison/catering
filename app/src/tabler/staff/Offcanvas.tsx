import { IconClose } from '../../components/icons'
import { useEffect, useId, useRef, type ReactNode } from 'react'

// Tabler's bottom offcanvas, driven by React instead of Bootstrap JS: Escape closes, focus is trapped while
// open and returns to the opener on close, and the page behind does not scroll.
export function Offcanvas({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    titleRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open])

  if (!open) return null

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCloseRef.current()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onClose} />
      <div
        ref={panelRef}
        className="offcanvas offcanvas-bottom show staff-offcanvas"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title" id={titleId} ref={titleRef} tabIndex={-1}>
            {title}
          </h2>
          <button type="button" className="btn-close" aria-label="Close request details" onClick={onClose}><IconClose className="icon" aria-hidden="true" /></button>
        </div>
        <div className="offcanvas-body">{children}</div>
      </div>
    </>
  )
}
