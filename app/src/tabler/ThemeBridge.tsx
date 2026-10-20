import { useEffect } from 'react'
import { useTheme } from '../components/ThemeProvider'

/** Keep Bootstrap's semantic light/dark variants aligned with every named palette. */
export function ThemeBridge() {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', resolvedTheme)
  }, [resolvedTheme])
  return null
}

export function useResolvedTheme(): 'light' | 'dark' {
  return useTheme().resolvedTheme
}
