import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import { logoFiles, serviceGroups, type Service } from './integrations'

function Logo({ service }: { service: Service }) {
  const file = logoFiles[service.id]
  return (
    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-ui font-semibold tracking-[-0.02em] text-foreground shadow-xs">
      {file ? <img src={file} alt="" className="size-6 object-contain" /> : service.mark}
    </span>
  )
}

/** Admin > Integrations: a catalog of services Pearl Island could connect. Nothing connects yet, and no card claims otherwise. */
export function IntegrationsPage() {
  const [tried, setTried] = useState<string | null>(null)

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="integrations-title">
      <header className="mb-3">
        <h1 id="integrations-title" className="type-page-title">Integrations</h1>
        <p className="mt-1 text-body text-muted-foreground">Tools Pearl Island could connect to its catering workflow. None are connected yet.</p>
      </header>

      <p role="status" className="mb-3 min-h-5 text-ui text-muted-foreground">
        {tried ? `Connecting ${tried} isn’t available in this prototype yet.` : ''}
      </p>

      <div className="grid gap-8">
        {serviceGroups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="mb-3 text-ui font-medium text-muted-foreground">{group.label}</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {group.services.map((service) => (
                <li key={service.id} className="min-w-0">
                  <Card className="h-full gap-0 py-0">
                    <CardContent className="flex items-start gap-3 px-4 py-4">
                      <Logo service={service} />
                      <div className="min-w-0">
                        <h3 className="text-body font-medium text-foreground">{service.name}</h3>
                        <p className="mt-0.5 text-ui leading-5 text-muted-foreground">{service.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-4 py-3">
                      <Button variant="outline" aria-label={`Connect ${service.name}`} onClick={() => setTried(service.name)}>Connect</Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
