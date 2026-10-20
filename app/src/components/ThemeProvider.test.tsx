// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from './ThemeProvider'
import { ThemePicker } from './ThemePicker'

afterEach(() => { cleanup(); localStorage.removeItem('vite-ui-theme') })

async function choose(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole('combobox', { name: 'Color theme' }))
  await user.click(await screen.findByRole('option', { name: label }))
}

describe('color theme preference', () => {
  it('persists a selected palette and restores it on a new visit', async () => {
    const user = userEvent.setup()
    const view = render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    await choose(user, 'Gray')
    expect(localStorage.getItem('vite-ui-theme')).toBe('classic-dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    view.unmount()
    render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    expect(screen.getByRole('combobox', { name: 'Color theme' }).textContent).toContain('Gray')
    expect(document.documentElement.dataset.colorTheme).toBe('classic-dark')
  })

  it('keeps named light and dark palettes compatible with existing mode styles', async () => {
    const user = userEvent.setup()
    render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    for (const [label, name, mode] of [['Gray', 'classic-dark', 'dark'], ['Dark', 'dark', 'dark'], ['Light', 'light', 'light']]) {
      await choose(user, label)
      expect(document.documentElement.classList.contains(mode)).toBe(true)
      expect(document.documentElement.dataset.colorTheme).toBe(name)
    }
    await choose(user, 'System')
    expect(document.documentElement.dataset.colorTheme).toBe(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })
})
