// @vitest-environment jsdom
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { useDemoStore } from './state/store'
import { renderAppAt } from './test/renderApp'

const nav = () => Array.from(document.querySelectorAll('.linear-nav-group [data-slot="sidebar-menu-button"]')).map((el) => el.textContent)
const current = () => Array.from(document.querySelectorAll('[data-slot="sidebar-menu-button"][data-active]')).map((el) => el.textContent)

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pi2go-demo-account', 'team')
  vi.setSystemTime(new Date('2026-10-13T09:00'))
  useDemoStore.getState().loadScenario('routine')
  useDemoStore.setState({ orders: [] })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Admin navigation', () => {
  it('has no Handoff in the sidebar and puts Analytics under Workspace', () => {
    renderAppAt('/staff', <AppRoutes />)
    const groups = Array.from(document.querySelectorAll('.linear-nav-group')).map((group) => [
      group.querySelector('[data-slot="sidebar-group-label"]')?.textContent,
      Array.from(group.querySelectorAll('[data-slot="sidebar-menu-button"]')).map((el) => el.textContent),
    ])
    expect(groups).toEqual([
      ['Operations', ['Requests', 'Messages', 'Calendar']],
      ['Workspace', ['Analytics', 'Menu and rules', 'Integrations', 'Settings']],
    ])
    expect(nav()).not.toContain('Handoff')
  })

  it('keeps Requests selected on the handoff summary reached from an accepted request', () => {
    renderAppAt('/handoff', <AppRoutes />)
    expect(current()).toEqual(['Requests'])
  })
})
