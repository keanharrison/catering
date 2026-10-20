// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'
import { ThemePicker } from './ThemePicker'

afterEach(() => { cleanup(); localStorage.removeItem('vite-ui-theme') })

describe('color theme preference', () => {
  it('persists a selected palette and restores it on a new visit', () => {
    const view = render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    fireEvent.change(screen.getByLabelText('Color theme'), { target: { value: 'classic-dark' } })
    expect(localStorage.getItem('vite-ui-theme')).toBe('classic-dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    view.unmount()
    render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    expect((screen.getByLabelText('Color theme') as HTMLSelectElement).value).toBe('classic-dark')
    expect(document.documentElement.dataset.colorTheme).toBe('classic-dark')
  })

  it('keeps named light and dark palettes compatible with existing mode styles', () => {
    render(<ThemeProvider><ThemePicker /></ThemeProvider>)
    for (const [name, mode] of [['classic-dark', 'dark'], ['dark', 'dark'], ['light', 'light']]) {
      fireEvent.change(screen.getByLabelText('Color theme'), { target: { value: name } })
      expect(document.documentElement.classList.contains(mode)).toBe(true)
      expect(document.documentElement.dataset.colorTheme).toBe(name)
    }
    fireEvent.change(screen.getByLabelText('Color theme'), { target: { value: 'system' } })
    expect(document.documentElement.dataset.colorTheme).toBe(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })
})
