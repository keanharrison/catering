import { themeOptions, useTheme, type Theme } from './ThemeProvider'
import './theme-picker.css'

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return <select className="theme-picker" aria-label="Color theme" value={theme} onChange={event => setTheme(event.target.value as Theme)}>
    {themeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
}
