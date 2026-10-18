import {
  catalog as defaultCatalog,
  type Catalog,
  type DietaryTag,
  type MenuCategory,
  type MenuItem,
  type Order,
} from '../../data'
import { quantityOf } from '../../engine'

export const browseCategories: Array<{ category: MenuCategory; title: string }> = [
  { category: 'entree', title: 'Entrees' },
  { category: 'side', title: 'Sides' },
  { category: 'salad', title: 'Salads' },
]

export const filterTags: Array<{ tag: DietaryTag; label: string }> = [
  { tag: 'vegetarian', label: 'Vegetarian' },
  { tag: 'vegan', label: 'Vegan' },
  { tag: 'gluten-free', label: 'Gluten-free' },
  { tag: 'dairy-free', label: 'Dairy-free' },
]

export type MenuEntry = { item: MenuItem; quantity: number }

/** Items in a category, in menu order, narrowed to those carrying every selected tag. */
export function menuEntries(
  order: Order,
  category: MenuCategory,
  filters: DietaryTag[],
  catalog: Catalog = defaultCatalog,
): MenuEntry[] {
  return catalog.menu
    .filter((item) => item.category === category)
    .filter((item) => filters.every((tag) => item.dietaryTags.includes(tag)))
    .map((item) => ({ item, quantity: quantityOf(order.lines, item.id) }))
}

export function supplyEntries(order: Order, catalog: Catalog = defaultCatalog): MenuEntry[] {
  return menuEntries(order, 'supply', [], catalog)
}
