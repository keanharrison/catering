import { useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { FeatureCardHeader } from '../../components/FeatureCardHeader'
import { Field, FieldError, FieldGroup, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { catalog } from '../../data'
import { MenuManager } from '../staff/MenuManager'
import { useDemoAccount } from '../../state/demoAccount'
import { useDemoStore } from '../../state/store'
import { CUSTOMER_PROFILE_KEY, emptyCustomerProfile, readCustomerProfile, type CustomerProfile } from '../../state/customerProfile'

function CustomerSettings() {
  const [savedProfile, setSavedProfile] = useState<CustomerProfile>(readCustomerProfile)
  const [profile, setProfile] = useState<CustomerProfile>(() => ({ ...savedProfile }))
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerProfile, string>>>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const dirty = useMemo(() => (Object.keys(emptyCustomerProfile) as (keyof CustomerProfile)[]).some((key) => profile[key] !== savedProfile[key]), [profile, savedProfile])

  function update<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSaveError('')
  }

  function discard() {
    setProfile({ ...savedProfile })
    setErrors({})
    setSaveError('')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingRef.current || !dirty) return
    const nextErrors: Partial<Record<keyof CustomerProfile, string>> = {}
    if (!profile.name.trim()) nextErrors.name = 'Enter a contact name.'
    if (!profile.email.trim()) nextErrors.email = 'Enter an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!profile.phone.trim()) nextErrors.phone = 'Enter a phone number.'
    setErrors(nextErrors)
    const first = (Object.keys(nextErrors) as (keyof CustomerProfile)[])[0]
    if (first) {
      document.getElementById(`profile-${first}`)?.focus()
      return
    }
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    try {
      const normalized: CustomerProfile = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        organization: profile.organization.trim(),
      }
      localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(normalized))
      setSavedProfile(normalized)
      setProfile(normalized)
      toast.success('Contact details saved on this device.')
    } catch {
      setSaveError('Could not save in this browser. Your entered details are still here; try again.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const fields: { key: keyof CustomerProfile; label: string; autocomplete: string; type?: string; optional?: boolean }[] = [
    { key: 'name', label: 'Name', autocomplete: 'name' },
    { key: 'email', label: 'Email', autocomplete: 'email', type: 'email' },
    { key: 'phone', label: 'Phone', autocomplete: 'tel', type: 'tel' },
    { key: 'organization', label: 'Company or organization', autocomplete: 'organization', optional: true },
  ]

  return <section className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
    <header className="mb-6"><h1 className="type-page-title">Account settings</h1></header>
    <div className="dot-field">
    <Card variant="feature"><FeatureCardHeader icon={destinationIcons.accountSettings} tone={destinationTones.accountSettings!} title="Contact information" />
      <CardContent><CardDescription className="mb-5">Saved details can fill blank contact fields on new requests. Existing drafts and orders keep their original information.</CardDescription><form onSubmit={save} noValidate>
        <FieldGroup>{fields.map(({ key, label, autocomplete, type, optional }) => {
          const id = `profile-${key}`
          const errorId = `${id}-error`
          return <Field key={key} data-invalid={Boolean(errors[key]) || undefined}>
            <FieldLabel htmlFor={id}>{label}{optional ? ' (optional)' : ' (required)'}</FieldLabel>
            <Input id={id} name={key} type={type ?? 'text'} autoComplete={autocomplete} required={!optional} value={profile[key]} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? errorId : key === 'email' ? 'profile-email-help' : undefined} onChange={(event) => update(key, event.target.value)} />
            {errors[key] && <FieldError id={errorId}>{errors[key]}</FieldError>}
            
          </Field>
        })}</FieldGroup>
        {saveError && <Alert variant="destructive" className="mt-5"><AlertTitle>Could not save changes</AlertTitle><AlertDescription>{saveError}</AlertDescription></Alert>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={!dirty || saving} onClick={discard}>Discard changes</Button>
          <Button type="submit" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form></CardContent>
    </Card>
    </div>
  </section>
}

function StaffSettings() {
  const order = useDemoStore((state) => state.order)
  return <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8"><header className="mb-6"><h1 className="type-page-title">Menu and rules settings</h1></header><Tabs defaultValue="menu"><TabsList><TabsTrigger value="menu">Menu</TabsTrigger><TabsTrigger value="rules">Rules</TabsTrigger></TabsList><TabsContent value="menu"><MenuManager /></TabsContent><TabsContent value="rules"><Card><CardHeader><CardTitle>Ordering assumptions</CardTitle><CardDescription>Values currently used by the estimate and exception engine.</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Rule</TableHead><TableHead>Current value</TableHead><TableHead>Data status</TableHead><TableHead>Assumption</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Large order review</TableCell><TableCell>Over {catalog.exceptionThresholds.largeOrderOverGuests} guests</TableCell><TableCell><Badge variant="outline">{catalog.exceptionThresholds.status}</Badge></TableCell><TableCell>{catalog.exceptionThresholds.assumption}</TableCell></TableRow><TableRow><TableCell>Change cutoff</TableCell><TableCell>{catalog.changePolicy.changeCutoffHours} hours</TableCell><TableCell><Badge variant="outline">{catalog.changePolicy.status}</Badge></TableCell><TableCell>{catalog.changePolicy.assumption}</TableCell></TableRow>{catalog.portionRules.map((rule) => <TableRow key={rule.id}><TableCell className="capitalize">{rule.category} portions</TableCell><TableCell>{rule.servingsPerGuest} per guest</TableCell><TableCell><Badge variant="outline">{rule.status}</Badge></TableCell><TableCell>{rule.assumption}</TableCell></TableRow>)}</TableBody></Table></div><p className="mt-4 text-xs text-muted-foreground">{order.status === 'draft' ? 'No customer request is currently active.' : `Current request ${order.id} continues to use these existing rules.`} Editing business rules is intentionally not offered until Pearl Island confirms them.</p></CardContent></Card></TabsContent></Tabs></section>
}

export function SettingsPage() {
  const { account } = useDemoAccount()
  return account === 'team' ? <StaffSettings /> : <CustomerSettings />
}
