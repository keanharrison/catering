import { fireEvent } from '@testing-library/react'
import { useDemoStore } from '../state/store'

/** Opens the active request's details dialog from the staff list, as a click on its row would. */
export function openActiveRequest() {
  const row = document.querySelector<HTMLElement>(`[data-request-row="${useDemoStore.getState().order.id}"]`)
  if (!row) throw new Error('The active request is not in the staff list.')
  fireEvent.click(row)
}
