import { afterEach } from 'vitest'

// jsdom does not currently implement matchMedia, which the app shell uses for
// its system theme. Keep the browser-facing shell in tests without changing app code.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

afterEach(() => {
  if (typeof document !== 'undefined') document.documentElement.classList.remove('light', 'dark')
})
