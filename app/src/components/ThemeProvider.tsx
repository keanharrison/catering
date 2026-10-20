import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import palettes from './themePalettes.json'

export type Theme = keyof typeof palettes | 'system'
export const themeOptions = [
  { value: 'system', label: 'System' },
  ...Object.entries(palettes).map(([value, palette]) => ({ value: value as Theme, label: palette.label })),
]

function validTheme(value: string | null): value is Theme {
  return value === 'system' || Boolean(value && Object.hasOwn(palettes, value))
}

const ThemeProviderContext = createContext<{
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}>({ theme: 'system', resolvedTheme: 'light', setTheme: () => null })

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme' }: {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return validTheme(stored) ? stored : defaultTheme
    } catch { return defaultTheme }
  })
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const paletteName = theme === 'system' ? systemDark ? 'dark' : 'light' : theme
  const palette = palettes[paletteName]
  const resolvedTheme = palette.dark ? 'dark' : 'light'

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const change = () => setSystemDark(media.matches)
    change()
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.dataset.colorTheme = paletteName
    root.style.colorScheme = resolvedTheme
    for (const [key, value] of Object.entries(palette.tokens)) root.style.setProperty(key, value)
    return () => {
      for (const key of Object.keys(palette.tokens)) root.style.removeProperty(key)
      root.style.removeProperty('color-scheme')
      delete root.dataset.colorTheme
    }
  }, [palette, paletteName, resolvedTheme])

  function setTheme(next: Theme) {
    try { localStorage.setItem(storageKey, next) } catch { /* Keep theme switching usable without storage. */ }
    setThemeState(next)
  }

  return <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeProviderContext.Provider>
}

export function useTheme() { return useContext(ThemeProviderContext) }
