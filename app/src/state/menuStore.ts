import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { catalog, type MenuItem } from '../data'
import { seedMenu } from '../data/menu'

/**
 * Admin edits to the menu, layered on the shipped menu: field changes to shipped items plus
 * items the admin added. Only the edits are saved, so new shipped items still appear.
 * Every change is copied into `catalog.menu`, which the ordering flow and estimate engine read.
 */

export const MENU_STORAGE_KEY = 'pi2go-menu'

export type MenuEdit = Partial<Omit<MenuItem, 'id'>>

type MenuState = {
  edits: Record<string, MenuEdit>
  added: MenuItem[]
  /** Changes fields of any item, shipped or added. */
  updateItem: (id: string, edit: MenuEdit) => void
  addItem: (item: MenuItem) => void
  /** Drops the admin's changes to a shipped item. */
  resetItem: (id: string) => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      edits: {},
      added: [],
      updateItem: (id, edit) =>
        set((state) =>
          state.added.some((item) => item.id === id)
            ? { added: state.added.map((item) => (item.id === id ? { ...item, ...edit } : item)) }
            : { edits: { ...state.edits, [id]: { ...state.edits[id], ...edit } } },
        ),
      addItem: (item) => set((state) => ({ added: [...state.added, item] })),
      resetItem: (id) =>
        set((state) => {
          const { [id]: _dropped, ...edits } = state.edits
          return { edits }
        }),
    }),
    {
      name: MENU_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ edits, added }) => ({ edits, added }),
    },
  ),
)

/** The full menu: shipped items with edits applied, then added items. */
export function resolveMenu({ edits, added }: Pick<MenuState, 'edits' | 'added'>): MenuItem[] {
  return [...seedMenu.map((item) => (edits[item.id] ? { ...item, ...edits[item.id] } : item)), ...added]
}

function syncCatalog() {
  catalog.menu.splice(0, catalog.menu.length, ...resolveMenu(useMenuStore.getState()))
}

syncCatalog()
useMenuStore.subscribe(syncCatalog)

/** Menu items for screens that should re-render when the admin edits the menu. */
export const useMenu = () => {
  const edits = useMenuStore((state) => state.edits)
  const added = useMenuStore((state) => state.added)
  return resolveMenu({ edits, added })
}
