import { themeOptions, useTheme, type Theme } from './ThemeProvider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import './theme-picker.css'

export function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return (
    <Select items={themeOptions} value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger aria-label="Color theme" className="theme-picker">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {themeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
