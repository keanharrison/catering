import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2Icon, InfoIcon, SearchIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import { QuantityStepper } from '../../components/QuantityStepper'
import { catalog, type DietaryTag, type MenuCategory, type OrderLine } from '../../data'
import { recommend, setQuantity, type Recommendation } from '../../engine'
import { formatMoney, pluralize } from '../../lib/format'
import { useDemoStore } from '../../state/store'
import { StageGate } from '../../components/StageGate'
import { stagePath } from './journey'
import { menuEntries } from './menuView'
import { buildOrderSummary } from './orderSummary'
import { MenuOrderSummary } from './MenuOrderSummary'

const dietaryFilters: Array<{ value: DietaryTag; label: string }> = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'dairy-free', label: 'Dairy-free' },
]

const dietaryLabels: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-free',
  'dairy-free': 'Dairy-free',
  spicy: 'Spicy',
}

const categories: Array<{ value: MenuCategory; label: string }> = [
  { value: 'entree', label: 'Entrees' },
  { value: 'side', label: 'Sides' },
  { value: 'salad', label: 'Salads' },
]

type MenuSuggestion = { recommendation: Recommendation; undoLines: OrderLine[] | null; applied: boolean }

export function MenuPageShell() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<DietaryTag[]>([])
  const [suggestion, setSuggestion] = useState<MenuSuggestion | null>(null)
  const [feedback, setFeedback] = useState('')
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)
  const summary = buildOrderSummary(order, clock)

  function suggestMenu() {
    setSuggestion({ recommendation: recommend(order.intent), undoLines: null, applied: false })
    setFeedback('')
  }

  function applySuggestion() {
    if (!suggestion) return
    const supplyLines = order.lines.filter((line) => catalog.menu.find((item) => item.id === line.itemId)?.category === 'supply')
    const suggestedLines = suggestion.recommendation.lines.map(({ itemId, units }) => ({ itemId, units }))
    setSuggestion({ ...suggestion, undoLines: order.lines, applied: true })
    updateDraft({ lines: [...suggestedLines, ...supplyLines] })
    setFeedback('Suggested quantities applied. You can restore your previous quantities with Undo.')
  }

  function undoSuggestion() {
    if (suggestion?.undoLines) updateDraft({ lines: suggestion.undoLines })
    setSuggestion(null)
    setFeedback('Previous quantities restored.')
  }

  function renderCategory(category: MenuCategory) {
    const entries = menuEntries(order, category, filters)

    if (entries.length === 0) {
      return (
        <Empty className="gap-3 p-6 md:p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon"><SearchIcon aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>No menu items match</EmptyTitle>
            <EmptyDescription>Try removing a dietary filter or choose another menu category.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }

    return (
      <ul role="list" className="flex flex-col gap-3">
        {entries.map(({ item, quantity }) => (
          <li key={item.id}>
            <Item
              variant="outline"
              className={`gap-4 p-4 sm:p-5 ${quantity > 0 ? 'border-primary/40 bg-primary/[0.03]' : ''}`}
            >
              <ItemContent className="min-w-0 gap-1.5">
                <ItemTitle className="line-clamp-none text-base sm:text-lg">{item.name}</ItemTitle>
                <ItemDescription className="line-clamp-none">
                  <span className="font-medium text-foreground">{formatMoney(item.priceCents)}</span>
                  <span> per {item.unit}</span>
                  {item.servingNote && <span> · {item.servingNote}</span>}
                </ItemDescription>
                {item.dietaryTags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5" aria-label="Dietary labels">
                    {item.dietaryTags.map((tag) => (
                      <Badge key={tag} variant="outline">{dietaryLabels[tag]}</Badge>
                    ))}
                  </div>
                )}
              </ItemContent>
              <ItemActions className="ml-auto max-sm:w-full max-sm:justify-end">
                <QuantityStepper
                  label={item.name}
                  value={quantity}
                  onChange={(value) => {
                    setFeedback('')
                    updateDraft({ lines: setQuantity(order.lines, item.id, value) })
                  }}
                />
              </ItemActions>
              {item.description && (
                <Accordion className="basis-full border-t pt-2" defaultValue={[]}>
                  <AccordionItem value={`description-${item.id}`} className="border-0">
                    <AccordionTrigger className="py-2 text-sm">About this item</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </Item>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <StageGate stage="menu">
      <div className="w-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <section className="mx-auto w-full max-w-7xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Build your menu
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Choose entrées, sides, and salads for your event.
            </p>
          </header>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid min-w-0 gap-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Menu selections</CardTitle>
              <CardDescription>
                Browse Pearl Island’s menu and choose quantities for your guests.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="entree" aria-label="Menu categories" className="w-full">
              <TabsList className="grid w-full grid-cols-3 group-data-horizontal/tabs:h-11 p-0">
                  {categories.map((category) => (
                    <TabsTrigger key={category.value} value={category.value} className="h-full min-h-11">
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="mt-5 space-y-2">
                  <h3 className="text-sm font-medium">Filter by dietary preference</h3>
                  <ToggleGroup
                    variant="outline"
                    multiple
                    value={filters}
                    onValueChange={(values) => setFilters(values as DietaryTag[])}
                    aria-label="Filter menu by dietary preference"
                    className="w-full flex-wrap"
                  >
                    {dietaryFilters.map((filter) => (
                      <ToggleGroupItem
                        key={filter.value}
                        value={filter.value}
                        aria-label={filter.label}
                        className="min-h-11 px-3"
                      >
                        {filter.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <p className="text-sm text-muted-foreground">
                    Dietary labels are guides and don’t confirm allergy or nutrition requirements.
                  </p>
                </div>
                {categories.map((category) => (
                  <TabsContent key={category.value} value={category.value} className="mt-5">
                    {renderCategory(category.value)}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Help me choose</CardTitle>
              <CardDescription>
                Get a starting point based on your guest count and dietary preferences. Review quantities before continuing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestion && (
                suggestion.recommendation.lines.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Suggested for {summary.guestCount ?? 'your'} guests</h3>
                    <ul className="space-y-2 text-sm">
                      {suggestion.recommendation.lines.map((line) => {
                        const item = catalog.menu.find((candidate) => candidate.id === line.itemId)
                        return (
                          <li key={line.itemId} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                            <span className="font-medium">{item?.name ?? line.itemId}</span>
                            <span className="text-muted-foreground">{pluralize(line.units, item?.unit ?? 'unit')}</span>
                            <span className="basis-full text-muted-foreground">{line.reason}</span>
                          </li>
                        )
                      })}
                    </ul>
                    {suggestion.recommendation.notes.map((note) => (
                      <p key={note} className="text-sm text-muted-foreground">{note}</p>
                    ))}
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">How was this chosen?</summary>
                      <p className="mt-2 text-muted-foreground">
                        Suggestions use this demo’s portion assumptions. Review and adjust quantities to fit your event.
                      </p>
                    </details>
                  </div>
                ) : (
                  <Alert>
                    <InfoIcon />
                    <AlertTitle>A guest count is needed</AlertTitle>
                    <AlertDescription>{suggestion.recommendation.notes.join(' ')}</AlertDescription>
                  </Alert>
                )
              )}
              {feedback && (
                <Alert aria-live="polite">
                  <CheckCircle2Icon />
                  <AlertTitle>{suggestion?.applied ? 'Suggestion applied' : 'Changes restored'}</AlertTitle>
                  <AlertDescription>{feedback}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              {!suggestion && <Button variant="outline" onClick={suggestMenu}>Suggest</Button>}
              {suggestion && !suggestion.applied && suggestion.recommendation.lines.length > 0 && (
                <>
                  <Button variant="outline" onClick={suggestMenu}>Suggest again</Button>
                  <Button onClick={applySuggestion}>Apply</Button>
                </>
              )}
              {suggestion && !suggestion.applied && suggestion.recommendation.lines.length === 0 && (
                <Button variant="outline" onClick={suggestMenu}>Suggest again</Button>
              )}
              {suggestion?.applied && (
                <>
                  <Button variant="outline" onClick={suggestMenu}>Suggest again</Button>
                  <Button variant="secondary" onClick={undoSuggestion}>Undo</Button>
                </>
              )}
            </CardFooter>
          </Card>
          </div>
          <aside className="hidden lg:block lg:sticky lg:top-6" aria-label="Order summary">
            <MenuOrderSummary
              summary={summary}
              onBack={() => navigate(stagePath('event'))}
              onContinue={() => navigate(stagePath('supplies'))}
            />
          </aside>
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl">
          <MenuOrderSummary
            mobile
            summary={summary}
            onBack={() => navigate(stagePath('event'))}
            onContinue={() => navigate(stagePath('supplies'))}
          />
        </div>
      </div>
      <div aria-hidden="true" className="h-20 lg:hidden" />
    </StageGate>
  )
}
