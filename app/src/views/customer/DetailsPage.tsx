import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StageGate } from '@/components/StageGate'
import { TimeSelect } from '@/components/TimeSelect'
import { catalog } from '@/data'
import { useDemoStore } from '@/state/store'
import {
  INTAKE_LIMITS,
  clearIntakeFormDraft,
  formToIntent,
  intentToForm,
  loadIntakeFormDraft,
  saveIntakeFormDraft,
  sectionErrors,
  validateForm,
  type IntakeErrors,
  type IntakeField,
  type IntakeForm,
} from './intake'
import { MenuOrderSummary } from './MenuOrderSummary'
import { buildOrderSummary } from './orderSummary'
import { stagePath } from './journey'

export function DetailsPage() {
  const session = useDemoStore((state) => state.session)
  return (
    <StageGate stage="details">
      <DetailsView key={session} />
    </StageGate>
  )
}

function DetailsView() {
  const navigate = useNavigate()
  const session = useDemoStore((state) => state.session)
  const order = useDemoStore((state) => state.order)
  const clock = useDemoStore((state) => state.clock)
  const updateDraft = useDemoStore((state) => state.updateDraft)
  const [form, setForm] = useState<IntakeForm>(() => loadIntakeFormDraft(session, intentToForm(order.intent)))
  const [errors, setErrors] = useState<IntakeErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const summary = buildOrderSummary(order, clock)

  function set<K extends IntakeField>(field: K, value: IntakeForm[K]) {
    const next = { ...form, [field]: value }
    setForm(next)
    saveIntakeFormDraft(session, next)
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = sectionErrors(validateForm(form, clock, catalog), 'details')
    setErrors(found)
    const firstInvalid = Object.keys(found)[0] as IntakeField | undefined
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    updateDraft({ intent: formToIntent(form) })
    clearIntakeFormDraft(session)
    navigate(stagePath('review'))
  }

  return (
    <div className="w-full px-4 py-8 pb-28 text-foreground sm:px-8 sm:py-10 lg:pb-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Final details</CardTitle>
              <CardDescription className="text-sm leading-5">
                Add your contact information and any details our catering team needs to prepare your request.
              </CardDescription>
            </CardHeader>
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={Boolean(errors.eventTime) || undefined}>
                    <FieldLabel id="eventTime-label" htmlFor="eventTime">{form.fulfillment === 'delivery' ? 'Delivery time (required)' : 'Pickup time (required)'}</FieldLabel>
                    <TimeSelect
                      id="eventTime"
                      labelledBy="eventTime-label"
                      value={form.eventTime}
                      invalid={Boolean(errors.eventTime)}
                      describedBy={errors.eventTime ? 'eventTime-error' : 'eventTime-help'}
                      onChange={(next) => set('eventTime', next)}
                    />
                    {errors.eventTime
                      ? <FieldError id="eventTime-error">{errors.eventTime}</FieldError>
                      : <FieldDescription id="eventTime-help">Choose when the order should be ready.</FieldDescription>}
                  </Field>

                  <Field data-invalid={Boolean(errors.contactName) || undefined}>
                    <FieldLabel htmlFor="contactName">Contact name (required)</FieldLabel>
                    <Input id="contactName" name="contactName" autoComplete="name" maxLength={INTAKE_LIMITS.contactName} required value={form.contactName} aria-invalid={Boolean(errors.contactName)} aria-describedby={errors.contactName ? 'contactName-error' : undefined} onChange={(event) => set('contactName', event.target.value)} />
                    {errors.contactName && <FieldError id="contactName-error">{errors.contactName}</FieldError>}
                  </Field>

                  <Field data-invalid={Boolean(errors.email) || undefined}>
                    <FieldLabel htmlFor="email">Email (required)</FieldLabel>
                    <Input id="email" name="email" type="email" autoComplete="email" maxLength={INTAKE_LIMITS.email} required value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} onChange={(event) => set('email', event.target.value)} />
                    {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
                  </Field>

                  <Field data-invalid={Boolean(errors.phone) || undefined}>
                    <FieldLabel htmlFor="phone">Phone (required)</FieldLabel>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={INTAKE_LIMITS.phone} required value={form.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} onChange={(event) => set('phone', event.target.value)} />
                    {errors.phone && <FieldError id="phone-error">{errors.phone}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="organization">Company or organization (optional)</FieldLabel>
                    <Input id="organization" name="organization" autoComplete="organization" maxLength={INTAKE_LIMITS.organization} value={form.organization} onChange={(event) => set('organization', event.target.value)} />
                  </Field>

                  <section className="grid gap-5 border-t pt-5" aria-labelledby="onsite-contact-heading">
                    <div>
                      <h2 id="onsite-contact-heading" className="text-base font-medium">{form.fulfillment === 'delivery' ? 'Delivery contact' : 'Pickup contact'} (optional)</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {form.fulfillment === 'delivery' ? 'Who will receive the order?' : 'Who will pick up the order?'} Leave blank if it is the person above.
                      </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field data-invalid={Boolean(errors.onsiteContactName) || undefined}>
                        <FieldLabel htmlFor="onsiteContactName">Name</FieldLabel>
                        <Input id="onsiteContactName" name="onsiteContactName" maxLength={INTAKE_LIMITS.onsiteContactName} value={form.onsiteContactName} aria-invalid={Boolean(errors.onsiteContactName)} onChange={(event) => set('onsiteContactName', event.target.value)} />
                        {errors.onsiteContactName && <FieldError>{errors.onsiteContactName}</FieldError>}
                      </Field>
                      <Field data-invalid={Boolean(errors.onsiteContactPhone) || undefined}>
                        <FieldLabel htmlFor="onsiteContactPhone">Phone</FieldLabel>
                        <Input id="onsiteContactPhone" name="onsiteContactPhone" type="tel" autoComplete="off" maxLength={INTAKE_LIMITS.onsiteContactPhone} value={form.onsiteContactPhone} aria-invalid={Boolean(errors.onsiteContactPhone)} onChange={(event) => set('onsiteContactPhone', event.target.value)} />
                        {errors.onsiteContactPhone && <FieldError>{errors.onsiteContactPhone}</FieldError>}
                      </Field>
                    </div>
                  </section>

                  {form.fulfillment === 'delivery' && (
                    <section className="grid gap-5 border-t pt-5" aria-labelledby="delivery-address-heading">
                      <div>
                        <h2 id="delivery-address-heading" className="text-base font-medium">Delivery address</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Enter the address where the order should be delivered.</p>
                      </div>
                      <Field data-invalid={Boolean(errors.deliveryAddress) || undefined}>
                        <FieldLabel htmlFor="deliveryAddress">Street address (required)</FieldLabel>
                        <Input id="deliveryAddress" name="deliveryAddress" autoComplete="street-address" maxLength={INTAKE_LIMITS.deliveryAddress} required value={form.deliveryAddress} aria-invalid={Boolean(errors.deliveryAddress)} aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined} onChange={(event) => set('deliveryAddress', event.target.value)} />
                        {errors.deliveryAddress && <FieldError id="deliveryAddress-error">{errors.deliveryAddress}</FieldError>}
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-3">
                        <Field className="sm:col-span-1" data-invalid={Boolean(errors.deliveryCity) || undefined}>
                          <FieldLabel htmlFor="deliveryCity">City (required)</FieldLabel>
                          <Input id="deliveryCity" name="deliveryCity" autoComplete="address-level2" maxLength={INTAKE_LIMITS.deliveryCity} required value={form.deliveryCity} aria-invalid={Boolean(errors.deliveryCity)} aria-describedby={errors.deliveryCity ? 'deliveryCity-error' : undefined} onChange={(event) => set('deliveryCity', event.target.value)} />
                          {errors.deliveryCity && <FieldError id="deliveryCity-error">{errors.deliveryCity}</FieldError>}
                        </Field>
                        <Field data-invalid={Boolean(errors.deliveryState) || undefined}>
                          <FieldLabel htmlFor="deliveryState">State (required)</FieldLabel>
                          <Input id="deliveryState" name="deliveryState" autoComplete="address-level1" maxLength={INTAKE_LIMITS.deliveryState} required value={form.deliveryState} aria-invalid={Boolean(errors.deliveryState)} aria-describedby={errors.deliveryState ? 'deliveryState-error' : undefined} onChange={(event) => set('deliveryState', event.target.value)} />
                          {errors.deliveryState && <FieldError id="deliveryState-error">{errors.deliveryState}</FieldError>}
                        </Field>
                        <Field data-invalid={Boolean(errors.deliveryZip) || undefined}>
                          <FieldLabel htmlFor="deliveryZip">ZIP code (required)</FieldLabel>
                          <Input id="deliveryZip" name="deliveryZip" autoComplete="postal-code" maxLength={INTAKE_LIMITS.deliveryZip} required value={form.deliveryZip} aria-invalid={Boolean(errors.deliveryZip)} aria-describedby={errors.deliveryZip ? 'deliveryZip-error' : undefined} onChange={(event) => set('deliveryZip', event.target.value)} />
                          {errors.deliveryZip && <FieldError id="deliveryZip-error">{errors.deliveryZip}</FieldError>}
                        </Field>
                      </div>
                    </section>
                  )}

                  <Field>
                    <FieldLabel htmlFor="customRequest">Custom request (optional)</FieldLabel>
                    <Textarea id="customRequest" name="customRequest" rows={3} maxLength={INTAKE_LIMITS.customRequest} value={form.customRequest} aria-describedby="customRequest-help" onChange={(event) => set('customRequest', event.target.value)} />
                    <FieldDescription id="customRequest-help">Requests outside the listed menu need review by our catering team.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="notes">Additional notes (optional)</FieldLabel>
                    <Textarea id="notes" name="notes" rows={3} maxLength={INTAKE_LIMITS.notes} value={form.notes} onChange={(event) => set('notes', event.target.value)} />
                    <FieldDescription>Share pickup or delivery instructions and other event details.</FieldDescription>
                  </Field>
                </FieldGroup>

              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="outline" onClick={() => navigate(stagePath('supplies'))}>Back to supplies</Button>
                <Button type="submit">Review your request</Button>
              </CardFooter>
            </form>
          </Card>
          <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Order summary">
            <MenuOrderSummary summary={summary} />
          </aside>
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl"><MenuOrderSummary summary={summary} mobile /></div>
      </div>
      <div aria-hidden="true" className="h-20 lg:hidden" />
    </div>
  )
}
