import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

type RenderProps = {
  open: boolean
  triggerProps: {
    ref: React.RefObject<HTMLButtonElement | null>
    id: string
    'aria-haspopup': 'menu'
    'aria-expanded': boolean
    'aria-controls': string
    onClick: () => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  }
  menuProps: {
    ref: React.RefObject<HTMLDivElement | null>
    id: string
    role: 'menu'
    'aria-labelledby': string
    'data-bs-popper': 'static'
    className: string
    style?: CSSProperties
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  }
  close: () => void
}

/**
 * Tabler dropdown markup with React-owned behavior (no Bootstrap JS): click or Enter/Space/Arrow to open,
 * Arrow/Home/End to move, Escape or outside click to close, focus returns to the trigger.
 */
export function Dropdown({
  className,
  menuClassName = '',
  fixed = false,
  children,
}: {
  className: string
  menuClassName?: string
  /** Position the menu against the viewport (like Popper's fixed strategy) so scrolling table wrappers don't clip it. */
  fixed?: boolean
  children: (props: RenderProps) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [fixedStyle, setFixedStyle] = useState<CSSProperties>()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const triggerId = `${id}-trigger`
  const menuId = `${id}-menu`

  const items = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []),
    [],
  )

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useLayoutEffect(() => {
    if (!fixed || !open || !triggerRef.current || !menuRef.current) return
    const trigger = triggerRef.current.getBoundingClientRect()
    const menu = menuRef.current.getBoundingClientRect()
    const below = window.innerHeight - trigger.bottom
    const top = below >= menu.height + 8 || trigger.top < menu.height ? trigger.bottom + 2 : trigger.top - menu.height - 2
    setFixedStyle({ position: 'fixed', inset: 'auto auto auto auto', top, left: Math.max(8, trigger.right - menu.width), margin: 0 })
    const dismiss = () => setOpen(false)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [fixed, open])

  function focusAt(position: 'first' | 'last') {
    // The menu is rendered (hidden) before opening, so focus can move on the next frame.
    requestAnimationFrame(() => {
      const list = items()
      ;(position === 'first' ? list[0] : list[list.length - 1])?.focus()
    })
  }

  const triggerProps: RenderProps['triggerProps'] = {
    ref: triggerRef,
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': menuId,
    onClick: () => setOpen((value) => !value),
    onKeyDown: (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true)
        focusAt(event.key === 'ArrowDown' ? 'first' : 'last')
      }
    },
  }

  const menuProps: RenderProps['menuProps'] = {
    ref: menuRef,
    id: menuId,
    role: 'menu',
    'aria-labelledby': triggerId,
    // Tabler's CSS positions menus (dropup/dropdown-menu-end) only when this attribute is present; Bootstrap JS sets it.
    'data-bs-popper': 'static',
    className: `dropdown-menu${open ? ' show' : ''} ${menuClassName}`.trim(),
    style: fixed && open ? fixedStyle : undefined,
    onKeyDown: (event) => {
      const list = items()
      const index = list.indexOf(document.activeElement as HTMLElement)
      if (event.key === 'ArrowDown') list[(index + 1) % list.length]?.focus()
      else if (event.key === 'ArrowUp') list[(index - 1 + list.length) % list.length]?.focus()
      else if (event.key === 'Home') list[0]?.focus()
      else if (event.key === 'End') list[list.length - 1]?.focus()
      else if (event.key === 'Escape') close()
      else if (event.key === 'Tab') close(false)
      else return
      if (event.key !== 'Tab') event.preventDefault()
    },
  }

  return (
    <div ref={rootRef} className={className}>
      {children({ open, triggerProps, menuProps, close })}
    </div>
  )
}
