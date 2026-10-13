import type { DietaryTag, MenuItem } from './types'

const MENU_SOURCE = 'https://pearlislandcatering.com/s/2022-Pearl-Island-Menu.pdf'

// Item names come from Pearl Island's public sample menus. Prices, tray sizes,
// minimums and dietary tags are placeholders until Sober confirms them.
const ASSUMPTION =
  'Placeholder price, tray size, minimum and dietary tags; not confirmed by Pearl Island. Not an allergy safety claim.'

type Seed = {
  id: string
  name: string
  category: MenuItem['category']
  priceCents: number
  dietaryTags?: DietaryTag[]
  includedSideIds?: string[]
}

const sides = ['rice-pigeon-peas', 'kale-salad', 'fried-plantains', 'pikliz']

function entree(seed: Omit<Seed, 'category'>): MenuItem {
  return tray({ ...seed, category: 'entree', includedSideIds: sides })
}

function side(seed: Omit<Seed, 'category'>): MenuItem {
  return tray({ ...seed, category: 'side' })
}

function tray(seed: Seed): MenuItem {
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    serviceStyles: ['buffet'],
    unit: 'tray',
    servingsPerUnit: 12,
    priceCents: seed.priceCents,
    minUnits: 1,
    dietaryTags: seed.dietaryTags ?? [],
    includedSideIds: seed.includedSideIds ?? [],
    leadTimeClass: 'standard',
    status: 'illustrative',
    assumption: ASSUMPTION,
    source: MENU_SOURCE,
  }
}

function boxed(seed: Pick<Seed, 'id' | 'name' | 'priceCents'>): MenuItem {
  return {
    id: seed.id,
    name: seed.name,
    category: 'boxed',
    serviceStyles: ['boxed'],
    unit: 'box',
    servingsPerUnit: 1,
    priceCents: seed.priceCents,
    minUnits: 10,
    dietaryTags: [],
    includedSideIds: [],
    leadTimeClass: 'custom',
    status: 'illustrative',
    assumption: ASSUMPTION,
    source: MENU_SOURCE,
  }
}

export const menu: MenuItem[] = [
  entree({ id: 'slow-roasted-pork', name: 'Slow Roasted Pork', priceCents: 9600 }),
  entree({ id: 'sous-poulet', name: 'Sous Poulet Chicken', priceCents: 9000 }),
  entree({ id: 'curry-chicken', name: 'Curry Chicken', priceCents: 8800 }),
  entree({ id: 'jerk-chicken', name: 'Jerk Chicken', priceCents: 8800, dietaryTags: ['spicy'] }),
  entree({ id: 'curry-tofu', name: 'Curry Tofu', priceCents: 8400, dietaryTags: ['vegetarian', 'vegan'] }),
  entree({
    id: 'jerk-tofu',
    name: 'Jerk Tofu',
    priceCents: 8400,
    dietaryTags: ['vegetarian', 'vegan', 'spicy'],
  }),
  side({ id: 'creole-beans', name: 'Creole Beans', priceCents: 4800, dietaryTags: ['vegetarian', 'vegan'] }),
  side({
    id: 'rice-pigeon-peas',
    name: 'Rice with Pigeon Peas',
    priceCents: 4200,
    dietaryTags: ['vegetarian', 'vegan'],
  }),
  side({ id: 'kale-salad', name: 'Kale Salad', priceCents: 4400, dietaryTags: ['vegetarian', 'vegan'] }),
  side({
    id: 'fried-plantains',
    name: 'Fried Plantains',
    priceCents: 4600,
    dietaryTags: ['vegetarian', 'vegan'],
  }),
  side({ id: 'pikliz', name: 'Pikliz', priceCents: 2400, dietaryTags: ['vegetarian', 'vegan', 'spicy'] }),
  boxed({ id: 'box-sandwich-wrap', name: 'Boxed Sandwich or Wrap', priceCents: 1500 }),
  boxed({ id: 'box-salad', name: 'Boxed Salad', priceCents: 1400 }),
]
