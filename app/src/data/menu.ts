import type { DietaryTag, MenuCategory, MenuItem, MenuUnit } from './types'
import { menuDetails } from './menuDetails'

// Source: Pearl Island2GO's Spoonfed ordering page, observed October 13, 2026
// (workflow.md). Prices, tags, descriptions and serving notes
// are as observed. Not confirmed by Sober, so every record stays illustrative.
const SOURCE = 'workflow.md (Spoonfed ordering flow observed October 13, 2026)'
const OBSERVED =
  'Observed on the Spoonfed ordering page; not confirmed by Sober. Dietary tags are as listed there, not allergy or nutrition claims.'
const ASSUMED_SIDES =
  'Observed on the Spoonfed ordering page; not confirmed by Sober. Which sides come with an entree and the minimum order are placeholders. Dietary tags are as listed, not allergy claims.'

type Seed = {
  id: string
  name: string
  category: MenuCategory
  /** Price in cents per unit, as observed. */
  priceCents: number
  unit?: MenuUnit
  tags?: DietaryTag[]
  description?: string
  servingNote?: string
  includedSideIds?: string[]
}

// Placeholder: which sides the recommendation adds to an entree.
const RECOMMENDED_SIDES = ['rice-pigeon-peas', 'kale-salad', 'amarillos', 'pikliz']

// Supplies carry no recipe, so their serving size is just what one unit is.
const SUPPLY_SERVING: Partial<Record<MenuUnit, string>> = { person: 'Per guest', each: 'Each', set: 'One set' }

function item(seed: Seed): MenuItem {
  const detail = menuDetails[seed.id]
  const isEntree = seed.category === 'entree'
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    serviceStyles: ['buffet'],
    unit: seed.unit ?? 'serving',
    servingsPerUnit: 1,
    priceCents: seed.priceCents,
    minUnits: 1,
    dietaryTags: seed.tags ?? [],
    includedSideIds: seed.includedSideIds ?? (isEntree ? RECOMMENDED_SIDES : []),
    leadTimeClass: 'standard',
    description: seed.description ?? detail?.description,
    servingNote: seed.servingNote ?? (seed.category === 'supply' ? SUPPLY_SERVING[seed.unit ?? 'serving'] : SPOON),
    ingredients: detail?.ingredients ?? [],
    allergens: detail?.allergens ?? [],
    available: true,
    image: `/menu/${seed.id}.jpg`,
    status: 'illustrative',
    assumption: isEntree ? ASSUMED_SIDES : OBSERVED,
    source: SOURCE,
  }
}

const SPOON = '6oz serving'
const PLANTAIN = '6oz serving; plantains are 2 per serving'

export const menu: MenuItem[] = [
  // Entrees (Caribbean entrees, priced per 6oz serving)
  item({
    id: 'slow-roasted-pork',
    name: 'Slow Roasted Pork',
    category: 'entree',
    priceCents: 625,
    tags: ['gluten-free', 'dairy-free'],
    description:
      "Pearl Island's award-winning slow roasted pork with oregano, garlic, lemon and culantro marinade",
    servingNote: SPOON,
  }),
  item({ id: 'sous-poulet', name: 'Sous Poulet Chicken', category: 'entree', priceCents: 500, tags: ['gluten-free', 'dairy-free'], servingNote: SPOON }),
  item({ id: 'curry-chicken', name: 'Curry Chicken', category: 'entree', priceCents: 500, tags: ['gluten-free', 'dairy-free'], servingNote: SPOON }),
  item({ id: 'jerk-chicken', name: 'Jerk Chicken', category: 'entree', priceCents: 500, tags: ['gluten-free', 'dairy-free'], servingNote: SPOON }),
  item({ id: 'curry-tofu', name: 'Curry Tofu', category: 'entree', priceCents: 525, tags: ['vegan', 'gluten-free'], servingNote: SPOON }),
  item({ id: 'creole-beans', name: 'Creole Beans', category: 'entree', priceCents: 525, tags: ['vegan', 'gluten-free'], servingNote: SPOON }),
  item({ id: 'jerk-tofu', name: 'Jerk Tofu', category: 'entree', priceCents: 525, tags: ['vegetarian', 'gluten-free'], servingNote: SPOON }),

  // Sides: rice options
  item({
    id: 'tropical-fried-rice',
    name: 'Tropical Fried Rice',
    category: 'side',
    priceCents: 425,
    tags: ['vegetarian'],
    description: 'Turmeric stewed rice with papaya, pineapple, carrots, peas, onions and peppers',
    servingNote: SPOON,
  }),
  item({ id: 'rice-pigeon-peas', name: 'Rice w/ Pigeon Peas', category: 'side', priceCents: 276, tags: ['vegetarian'], servingNote: SPOON }),
  item({
    id: 'brown-rice-quinoa-lima',
    name: 'Brown Rice, Red Quinoa & Lima Beans',
    category: 'side',
    priceCents: 275,
    tags: ['vegan', 'gluten-free', 'dairy-free'],
    servingNote: SPOON,
  }),
  item({ id: 'yellow-rice', name: 'Yellow Rice', category: 'side', priceCents: 275, tags: ['vegetarian'], servingNote: SPOON }),
  item({ id: 'white-rice', name: 'White Rice', category: 'side', priceCents: 250, tags: ['vegetarian'], servingNote: SPOON }),

  // Sides: more sides
  item({ id: 'mac-and-cheese', name: 'Pearl Island Mac and Cheese', category: 'side', priceCents: 425, tags: ['vegetarian'], servingNote: SPOON }),
  item({ id: 'roasted-vegetables', name: 'Roasted Vegetables', category: 'side', priceCents: 475, servingNote: SPOON }),
  item({ id: 'tostones', name: 'Tostones', category: 'side', priceCents: 250, servingNote: PLANTAIN }),
  item({
    id: 'amarillos',
    name: 'Amarillos',
    category: 'side',
    priceCents: 275,
    tags: ['vegan', 'gluten-free', 'dairy-free'],
    servingNote: PLANTAIN,
  }),
  item({
    id: 'pikliz',
    name: 'Pikliz',
    category: 'side',
    priceCents: 100,
    tags: ['vegan', 'gluten-free', 'dairy-free'],
    servingNote: '2oz',
  }),
  item({ id: 'aioli', name: 'Aioli', category: 'side', unit: 'bottle', priceCents: 925, tags: ['vegetarian'], servingNote: '16oz bottle' }),
  item({ id: 'vegan-aioli', name: 'Vegan Aioli', category: 'side', unit: 'bottle', priceCents: 900, servingNote: '16oz bottle' }),
  item({ id: 'southern-roasted-vegetables', name: 'Southern Roasted Vegetables', category: 'side', priceCents: 525, servingNote: SPOON }),
  item({
    id: 'collard-greens',
    name: 'PI Collard Greens',
    category: 'side',
    priceCents: 375,
    tags: ['vegan', 'gluten-free', 'dairy-free'],
    servingNote: SPOON,
  }),

  // Salads
  item({
    id: 'kale-salad',
    name: 'Kale Salad',
    category: 'salad',
    priceCents: 375,
    description:
      "Organic Kale, pan-roasted mushrooms, carrots and watermelon radish served with Pearl Island's Shallot Vinaigrette",
  }),
  item({
    id: 'medley-salad',
    name: 'Medley Salad',
    category: 'salad',
    priceCents: 475,
    description:
      "Organic Mixed Greens, Kale and Baby Spinach tossed with Rainbow Peppers English Cucumbers and Heirloom Tomatoes, served with Pearl Island's Shallot Vinaigrette",
  }),

  // Disposable catering supplies (required choice on the ordering page; "none needed" is also allowed)
  item({ id: 'supplies-plates-cutlery-cups', name: 'Plates, Cutlery, Cups', category: 'supply', unit: 'person', priceCents: 200 }),
  item({ id: 'supplies-plates-cutlery', name: 'Plates & Cutlery', category: 'supply', unit: 'person', priceCents: 150 }),
  item({ id: 'supplies-cups', name: 'Cups', category: 'supply', unit: 'person', priceCents: 50 }),
  item({ id: 'supplies-cutlery-pack', name: 'Cutlery Pack', category: 'supply', unit: 'person', priceCents: 75 }),
  item({ id: 'serving-spoons', name: 'Serving Spoons', category: 'supply', unit: 'each', priceCents: 100 }),
  item({ id: 'serving-tongs', name: 'Serving Tongs', category: 'supply', unit: 'each', priceCents: 100 }),
  item({ id: 'chafing-set', name: 'Disposable Chaffing Set', category: 'supply', unit: 'set', priceCents: 1500 }),
]

/** The menu as shipped. `menu` above is the live list the app reads; edits are layered on this copy. */
export const seedMenu: readonly MenuItem[] = Object.freeze(menu.slice())
