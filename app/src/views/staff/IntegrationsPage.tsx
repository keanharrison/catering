import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Input } from '../../components/ui/input'
import { NativeSelect, NativeSelectOption } from '../../components/ui/native-select'
import { Search } from '../../components/icons'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { logoFiles, serviceTypes, services, type Service } from './integrations'

function Logo({ service }: { service: Service }) {
  const file = logoFiles[service.id]
  return (
    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-ui font-semibold tracking-[-0.02em] text-foreground shadow-xs">
      {file ? <img src={file} alt="" className="size-7 object-contain" /> : service.mark}
    </span>
  )
}

/** Admin > Integrations: every service Pearl Island could connect, searchable and filterable by type. Nothing connects yet, and no card claims otherwise. */
export function IntegrationsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [tried, setTried] = useState<string | null>(null)

  const needle = query.trim().toLowerCase()
  const shown = services.filter((service) => (type === 'all' || service.typeId === type) && (!needle || `${service.name} ${service.type}`.toLowerCase().includes(needle)))
  const filtering = needle !== '' || type !== 'all'

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="integrations-title">
      <header className="mb-4">
        <h1 id="integrations-title" className="type-page-title">Integrations</h1>
        <p className="mt-1 text-body text-muted-foreground">Tools Pearl Island could connect to its catering workflow. None are connected yet.</p>
      </header>

      <form role="search" aria-label="Find an integration" className="mb-4 flex flex-wrap gap-2" onSubmit={(event) => event.preventDefault()}>
        <label className="min-w-[14rem] flex-1">
          <span className="sr-only">Search integrations</span>
          <span className="relative block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations" className="h-9 pl-9" />
          </span>
        </label>
        <label className="min-w-[10rem]">
          <span className="sr-only">Type</span>
          <NativeSelect value={type} onChange={(event) => setType(event.target.value)} className="w-full [&_select]:h-9">
            <NativeSelectOption value="all">All types</NativeSelectOption>
            {serviceTypes.map((option) => <NativeSelectOption key={option.id} value={option.id}>{option.label}</NativeSelectOption>)}
          </NativeSelect>
        </label>
      </form>

      <p role="status" className="mb-3 text-ui text-muted-foreground empty:mb-0">
        {tried ? `Connecting ${tried} isn’t available in this prototype yet.` : filtering ? `${shown.length} of ${services.length} integrations` : null}
      </p>

      {shown.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <Empty className="min-h-64 border-0">
              <EmptyHeader>
                <EmptyMedia variant="tile" tone={destinationTones.integrations}><destinationIcons.integrations /></EmptyMedia>
                <EmptyTitle>No matching integrations</EmptyTitle>
                <EmptyDescription>Try a different name, or show every type.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button variant="outline" onClick={() => { setQuery(''); setType('all') }}>Clear filters</Button></EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((service) => (
            <li key={service.id} className="min-w-0">
              <Card className="h-full gap-0 py-0">
                <CardContent className="flex items-start gap-3 px-4 py-4">
                  <Logo service={service} />
                  <div className="min-w-0">
                    <h2 className="text-body font-medium text-foreground">{service.name}</h2>
                    <p className="text-caption text-muted-foreground">{service.type}</p>
                    <p className="mt-1 text-ui leading-5 text-muted-foreground">{service.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-4 py-3">
                  <Button variant="outline" aria-label={`Connect ${service.name}`} onClick={() => setTried(service.name)}>Connect</Button>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
