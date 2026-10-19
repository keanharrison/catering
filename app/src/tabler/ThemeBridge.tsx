import { useEffect } from 'react'
import { useTheme } from '../components/ThemeProvider'

/** Mirrors the app's theme preference (light | dark | system) onto Tabler's `data-bs-theme` attribute. */
export function ThemeBridge() {
  const { theme } = useTheme()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light')
    }
    apply()
    if (theme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return null
}

/** Resolved light/dark value, for labels and icons. */
export function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useTheme()
  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
}
