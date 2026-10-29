import { useNavigate, Link } from 'react-router-dom'
import { catalog, type Order } from '../../data'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { formatEventTime } from '../../lib/status'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'

function draftTitle(order: Order) {
  return catalog.eventTypes.find((type) => type.id === order.intent.eventType)?.label ?? 'Catering request'
}

export function DraftsPage() {
  const navigate = useNavigate()
  const drafts = useDemoStore((state) => state.savedDrafts)
  const resumeDraft = useDemoStore((state) => state.resumeDraft)
  const deleteDraft = useDemoStore((state) => state.deleteDraft)
  const newRequestButton = <Button nativeButton={false} render={<Link to={routes.customer} />}>New catering request</Button>

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="type-page-title">Drafts</h1>
        {newRequestButton}
      </header>

      {drafts.length === 0 ? (
        <Card><CardContent className="p-0"><Empty className="min-h-72">
          <EmptyHeader>
            <EmptyMedia variant="tile" tone={destinationTones.drafts}><destinationIcons.drafts /></EmptyMedia>
            <EmptyTitle>No saved drafts</EmptyTitle>
            <EmptyDescription>Choose Save draft while planning a request and it will wait here until you are ready to finish it.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{newRequestButton}</EmptyContent>
        </Empty></CardContent></Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {drafts.map((order) => {
            const { guestCount, eventAt, fulfillment } = order.intent
            const items = order.lines.filter((line) => catalog.menu.find((item) => item.id === line.itemId)?.category !== 'supply').length
            return (
              <li key={order.id} className="min-w-0">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{draftTitle(order)}</CardTitle>
                    <CardDescription>{eventAt.startsWith('T') || !eventAt ? 'No date yet' : formatEventTime(eventAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <dl className="grid grid-cols-3 gap-x-4 text-sm">
                      <div><dt className="type-small-label text-muted-foreground">Guests</dt><dd className="mt-1">{guestCount ?? 'Not set'}</dd></div>
                      <div><dt className="type-small-label text-muted-foreground">Fulfillment</dt><dd className="mt-1 capitalize">{fulfillment}</dd></div>
                      <div><dt className="type-small-label text-muted-foreground">Menu items</dt><dd className="mt-1">{items || 'None yet'}</dd></div>
                    </dl>
                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                      <Button variant="ghost" onClick={() => deleteDraft(order.id)}>Delete</Button>
                      <Button onClick={() => { resumeDraft(order.id); navigate(routes.customer) }}>Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
