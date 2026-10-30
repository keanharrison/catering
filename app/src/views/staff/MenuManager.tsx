import { useState, type FormEvent } from 'react'
import { MenuImage } from '../../components/MenuImage'
import { OptionSelect } from '../../components/OptionSelect'
import { Search } from '../../components/icons'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'
import { ALLERGENS, type DietaryTag, type MenuCategory, type MenuItem, type MenuUnit } from '../../data'
import { seedMenu } from '../../data/menu'
import { formatMoney } from '../../lib/format'
import { useMenu, useMenuStore } from '../../state/menuStore'

const categories: Array<{ category: MenuCategory; title: string; singular: string }> = [
  { category: 'entree', title: 'Entrees', singular: 'Entree' },
  { category: 'side', title: 'Sides', singular: 'Side' },
  { category: 'salad', title: 'Salads', singular: 'Salad' },
  { category: 'supply', title: 'Supplies', singular: 'Supply' },
]

const unitLabel: Record<MenuUnit, string> = { serving: 'serving', bottle: 'bottle', person: 'guest', set: 'set', each: 'each' }
const dietaryTags: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy']
const MAX_IMAGE_BYTES = 500_000

type Availability = 'all' | 'listed' | 'hidden'

const listToText = (list: string[]) => list.join(', ')
const textToList = (text: string) => text.split(/[,\n]/).map((part) => part.trim()).filter(Boolean)

type Draft = {
  name: string
  category: MenuCategory
  description: string
  price: string
  unit: MenuUnit
  servingNote: string
  ingredients: string
  allergens: string[]
  dietaryTags: DietaryTag[]
  image: string
  available: boolean
}

const blankDraft: Draft = { name: '', category: 'entree', description: '', price: '', unit: 'serving', servingNote: '', ingredients: '', allergens: [], dietaryTags: [], image: '', available: true }

const toDraft = (item: MenuItem): Draft => ({
  name: item.name,
  category: item.category,
  description: item.description ?? '',
  price: (item.priceCents / 100).toFixed(2),
  unit: item.unit,
  servingNote: item.servingNote ?? '',
  ingredients: listToText(item.ingredients),
  allergens: item.allergens,
  dietaryTags: item.dietaryTags,
  image: item.image ?? '',
  available: item.available,
})

function toggle<T>(list: T[], value: T, on: boolean) {
  return on ? [...list.filter((entry) => entry !== value), value] : list.filter((entry) => entry !== value)
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function ItemCard({ item, onEdit, onToggle }: { item: MenuItem; onEdit: () => void; onToggle: (on: boolean) => void }) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card">
      <MenuImage item={item} className={item.available ? '' : 'opacity-60'} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words text-sm font-medium">{item.name}</h3>
            <span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(item.priceCents)}<span className="font-normal text-muted-foreground"> / {unitLabel[item.unit]}</span></span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description || 'No description yet.'}</p>
        </div>
        <dl className="grid gap-1.5 text-caption">
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted-foreground">Serving size</dt><dd>{item.servingNote || '—'}</dd></div>
          {item.category !== 'supply' && (
            <>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted-foreground">Ingredients</dt><dd className="line-clamp-2">{item.ingredients.length ? listToText(item.ingredients) : '—'}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted-foreground">Allergens</dt><dd>{item.allergens.length ? listToText(item.allergens) : 'None listed'}</dd></div>
            </>
          )}
        </dl>
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={item.available} onCheckedChange={onToggle} aria-label={`${item.name} on website`} />
            {item.available ? 'On website' : 'Hidden'}
          </label>
          <Button size="sm" variant="outline" onClick={onEdit} aria-label={`Edit ${item.name}`}>Edit</Button>
        </div>
      </div>
    </li>
  )
}

function ItemDialog({ item, existingIds, onClose }: { item: MenuItem | 'new'; existingIds: Set<string>; onClose: () => void }) {
  const updateItem = useMenuStore((state) => state.updateItem)
  const addItem = useMenuStore((state) => state.addItem)
  const resetItem = useMenuStore((state) => state.resetItem)
  const isNew = item === 'new'
  const [draft, setDraft] = useState<Draft>(() => (isNew ? blankDraft : toDraft(item)))
  const [errors, setErrors] = useState<{ name?: string; price?: string; image?: string }>({})
  const shipped = !isNew && seedMenu.some((entry) => entry.id === item.id)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const isSupply = draft.category === 'supply'

  function uploadImage(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((current) => ({ ...current, image: 'Choose an image file.' }))
    if (file.size > MAX_IMAGE_BYTES) return setErrors((current) => ({ ...current, image: 'Keep the image under 500 KB, or add the file to app/public/menu instead.' }))
    const reader = new FileReader()
    reader.onload = () => {
      set('image', String(reader.result))
      setErrors((current) => ({ ...current, image: undefined }))
    }
    reader.readAsDataURL(file)
  }

  function save(event: FormEvent) {
    event.preventDefault()
    const price = Number(draft.price.replace(/[$,]/g, ''))
    const next: typeof errors = {}
    if (!draft.name.trim()) next.name = 'Enter an item name.'
    if (draft.price.trim() === '' || !Number.isFinite(price) || price < 0) next.price = 'Enter a price in dollars, like 6.25.'
    setErrors(next)
    if (next.name || next.price) return
    const fields = {
      name: draft.name.trim(),
      category: draft.category,
      description: draft.description.trim() || undefined,
      priceCents: Math.round(price * 100),
      unit: draft.unit,
      servingNote: draft.servingNote.trim() || undefined,
      ingredients: isSupply ? [] : textToList(draft.ingredients),
      allergens: isSupply ? [] : draft.allergens,
      dietaryTags: isSupply ? [] : draft.dietaryTags,
      image: draft.image.trim() || undefined,
      available: draft.available,
    }
    if (isNew) {
      const base = slug(fields.name) || 'item'
      let id = base
      for (let n = 2; existingIds.has(id); n += 1) id = `${base}-${n}`
      addItem({
        ...fields,
        id,
        image: fields.image ?? `/menu/${id}.jpg`,
        serviceStyles: ['buffet'],
        servingsPerUnit: 1,
        minUnits: 1,
        includedSideIds: [],
        leadTimeClass: 'standard',
        status: 'illustrative',
        assumption: 'Added by an admin in this prototype; not confirmed by Pearl Island.',
      })
    } else updateItem(item.id, fields)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b bg-popover px-5 py-4 pr-12">
          <DialogTitle>{isNew ? 'Add menu item' : `Edit ${item.name}`}</DialogTitle>
          <DialogDescription>{isNew ? 'New items are on the website as soon as you save, unless you turn them off.' : 'Changes apply to the customer menu and to estimates straight away.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} noValidate>
          <FieldGroup className="px-5 py-5">
            <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
              <div className="grid content-start gap-2">
                <div className="overflow-hidden rounded-lg border"><MenuImage item={{ name: draft.name || 'New item', image: draft.image || undefined }} /></div>
                <label className="cursor-pointer text-sm font-medium underline underline-offset-4 hover:text-foreground">
                  Upload a photo
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadImage(event.target.files?.[0])} />
                </label>
                {errors.image && <p role="alert" className="text-caption text-destructive">{errors.image}</p>}
              </div>
              <div className="grid content-start gap-5">
                <Field data-invalid={Boolean(errors.name) || undefined}>
                  <FieldLabel htmlFor="menu-name">Item name (required)</FieldLabel>
                  <Input id="menu-name" value={draft.name} aria-invalid={Boolean(errors.name)} onChange={(event) => set('name', event.target.value)} />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <OptionSelect label="Category" value={draft.category} onValueChange={(value) => set('category', value as MenuCategory)} options={categories.map((entry) => ({ value: entry.category, label: entry.singular }))} />
                  </Field>
                  <Field data-invalid={Boolean(errors.price) || undefined}>
                    <FieldLabel htmlFor="menu-price">Price, $ (required)</FieldLabel>
                    <Input id="menu-price" inputMode="decimal" value={draft.price} aria-invalid={Boolean(errors.price)} onChange={(event) => set('price', event.target.value)} />
                  </Field>
                </div>
                {errors.price && <FieldError>{errors.price}</FieldError>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Sold by</FieldLabel>
                <OptionSelect label="Sold by" value={draft.unit} onValueChange={(value) => set('unit', value as MenuUnit)} options={(Object.keys(unitLabel) as MenuUnit[]).map((unit) => ({ value: unit, label: `Per ${unitLabel[unit]}` }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="menu-serving">Serving size</FieldLabel>
                <Input id="menu-serving" value={draft.servingNote} placeholder="6oz serving" onChange={(event) => set('servingNote', event.target.value)} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="menu-description">Description</FieldLabel>
              <Textarea id="menu-description" rows={3} value={draft.description} onChange={(event) => set('description', event.target.value)} />
            </Field>

            {!isSupply && (
              <>
                <Field>
                  <FieldLabel htmlFor="menu-ingredients">Ingredients</FieldLabel>
                  <Textarea id="menu-ingredients" rows={3} value={draft.ingredients} onChange={(event) => set('ingredients', event.target.value)} />
                  <FieldDescription>Separate ingredients with commas.</FieldDescription>
                </Field>
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-sm font-medium">Allergens</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ALLERGENS.map((allergen) => (
                      <label key={allergen} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={draft.allergens.includes(allergen)} onCheckedChange={(on) => set('allergens', toggle(draft.allergens, allergen, on))} />
                        {allergen}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-sm font-medium">Dietary tags</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {dietaryTags.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-sm capitalize">
                        <Checkbox checked={draft.dietaryTags.includes(tag)} onCheckedChange={(on) => set('dietaryTags', toggle(draft.dietaryTags, tag, on))} />
                        {tag}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <Field>
              <FieldLabel htmlFor="menu-image">Photo path</FieldLabel>
              <Input id="menu-image" value={draft.image} placeholder="/menu/item-name.jpg" onChange={(event) => set('image', event.target.value)} />
              <FieldDescription>Or save the photo as app/public/menu/&lt;item-id&gt;.jpg and it appears with no other change.</FieldDescription>
            </Field>

            <label className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <span>
                <span className="block text-sm font-medium">On the website</span>
                <span className="block text-caption text-muted-foreground">Customers can see and order this item. Requests that already include it keep it.</span>
              </span>
              <Switch checked={draft.available} onCheckedChange={(on) => set('available', on)} aria-label="On the website" />
            </label>
          </FieldGroup>
          <DialogFooter className="border-t px-5 py-4 sm:justify-between">
            {shipped ? <Button type="button" variant="ghost" onClick={() => { resetItem(item.id); onClose() }}>Reset to original</Button> : <span />}
            <span className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isNew ? 'Add item' : 'Save changes'}</Button>
            </span>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MenuManager() {
  const items = useMenu()
  const updateItem = useMenuStore((state) => state.updateItem)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | MenuCategory>('all')
  const [availability, setAvailability] = useState<Availability>('all')
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)

  const listed = items.filter((item) => item.available).length
  const needle = query.trim().toLowerCase()
  const shown = items.filter((item) =>
    (category === 'all' || item.category === category) &&
    (availability === 'all' || (availability === 'listed') === item.available) &&
    (!needle || `${item.name} ${item.ingredients.join(' ')}`.toLowerCase().includes(needle)),
  )

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[14rem] flex-[2]">
          <span className="sr-only">Search menu items or ingredients</span>
          <span className="relative block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items or ingredients" className="h-9 pl-9" />
          </span>
        </label>
        <div className="min-w-[10rem] flex-1">
          <OptionSelect label="Category" value={category} onValueChange={(value) => setCategory(value as 'all' | MenuCategory)} options={[{ value: 'all', label: 'All categories' }, ...categories.map((entry) => ({ value: entry.category, label: entry.title }))]} />
        </div>
        <div className="min-w-[10rem] flex-1">
          <OptionSelect label="Website status" value={availability} onValueChange={(value) => setAvailability(value as Availability)} options={[{ value: 'all', label: 'All items' }, { value: 'listed', label: 'On website' }, { value: 'hidden', label: 'Hidden' }]} />
        </div>
        <Button onClick={() => setEditing('new')}>Add item</Button>
      </div>

      <p role="status" className="text-ui text-muted-foreground">
        {items.length} items · <span className="text-foreground">{listed} on website</span> · {items.length - listed} hidden
        {shown.length !== items.length && ` · showing ${shown.length}`}
      </p>

      {shown.length === 0 ? (
        <p className="rounded-lg border bg-card px-4 py-10 text-center text-sm text-muted-foreground">No menu items match these filters.</p>
      ) : (
        categories.map(({ category: key, title }) => {
          const group = shown.filter((item) => item.category === key)
          if (group.length === 0) return null
          return (
            <section key={key} aria-labelledby={`menu-${key}`} className="grid gap-3">
              <h2 id={`menu-${key}`} className="type-section-title flex items-center gap-2">
                {title}
                <Badge variant="outline" className="tabular-nums">{group.length}</Badge>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((item) => (
                  <ItemCard key={item.id} item={item} onEdit={() => setEditing(item)} onToggle={(on) => updateItem(item.id, { available: on })} />
                ))}
              </ul>
            </section>
          )
        })
      )}

      {editing && <ItemDialog key={editing === 'new' ? 'new' : editing.id} item={editing} existingIds={new Set(items.map((item) => item.id))} onClose={() => setEditing(null)} />}
    </div>
  )
}
