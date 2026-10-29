import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { NativeSelect, NativeSelectOption } from '../../components/ui/native-select'
import { routes } from '../../routes'

type Row = {
  id: string
  title: string
  description: string
  control: ReactNode
  tone?: 'danger'
}

const soon = (what: string) => toast(`${what} isn’t available in this prototype yet. Nothing was changed.`)

/** A control that looks like the real thing but only says it is not built yet. */
function Preview({ label, aria }: { label: string; aria: string }) {
  return <Button variant="outline" aria-label={aria} onClick={() => soon(aria)}>{label}</Button>
}

function LinkButton({ to, children }: { to: string; children: ReactNode }) {
  return <Button variant="outline" nativeButton={false} render={<Link to={to} />}>{children}</Button>
}

function PreviewSelect({ label, options, what }: { label: string; options: string[]; what: string }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <NativeSelect value={options[0]} onChange={() => soon(what)} className="[&_select]:h-9">
        {options.map((option) => <NativeSelectOption key={option} value={option}>{option}</NativeSelectOption>)}
      </NativeSelect>
    </label>
  )
}

const sections: Array<{ id: string; title: string; rows: Row[] }> = [
  {
    id: 'business',
    title: 'Business',
    rows: [
      { id: 'profile', title: 'Business profile', description: 'Restaurant name, address, phone number and email address.', control: <Preview label="Edit profile" aria="Editing the business profile" /> },
    ],
  },
  {
    id: 'ordering-page',
    title: 'Ordering page',
    rows: [
      { id: 'logo', title: 'Logo', description: 'Shown at the top of the page customers order from.', control: <Preview label="Upload logo" aria="Uploading a logo" /> },
      { id: 'food-image', title: 'Restaurant food image', description: 'A photo of your food for the ordering page.', control: <Preview label="Upload image" aria="Uploading a food image" /> },
      { id: 'intro', title: 'Intro text', description: 'A short welcome message above the ordering form.', control: <Preview label="Edit intro text" aria="Editing the intro text" /> },
    ],
  },
  {
    id: 'catering',
    title: 'Catering and fulfillment',
    rows: [
      { id: 'availability', title: 'Catering availability', description: 'The days and hours you accept catering orders.', control: <Preview label="Set availability" aria="Setting availability" /> },
      { id: 'lead-time', title: 'Lead-time rules', description: 'How much notice each order size needs. The current rules are on the menu and rules page.', control: <LinkButton to={routes.settings}>View rules</LinkButton> },
      { id: 'pickup', title: 'Pickup', description: 'Pickup location and pickup windows.', control: <Preview label="Edit pickup" aria="Editing pickup settings" /> },
      { id: 'delivery', title: 'Delivery', description: 'Delivery area and delivery hours.', control: <Preview label="Edit delivery" aria="Editing delivery settings" /> },
      { id: 'menu-rules', title: 'Menu and catering rules', description: 'Review the menu, portions and ordering rules.', control: <LinkButton to={routes.settings}>Open menu and rules</LinkButton> },
    ],
  },
  {
    id: 'team',
    title: 'Team and notifications',
    rows: [
      { id: 'team', title: 'Team access', description: 'Who on your staff can use Admin.', control: <Preview label="Manage team" aria="Managing team access" /> },
      { id: 'account-access', title: 'Switch account', description: 'Use the workspace menu at the top of the sidebar to switch between the customer and Admin accounts.', control: null },
      { id: 'request-notifications', title: 'Request notifications', description: 'Choose when you hear about new requests and customer replies.', control: <Preview label="Manage" aria="Managing request notifications" /> },
      { id: 'customer-notifications', title: 'Customer notifications', description: 'Choose which updates customers receive about their requests.', control: <Preview label="Manage" aria="Managing customer notifications" /> },
      { id: 'integrations', title: 'Integrations', description: 'Browse the services you could connect. None are connected yet.', control: <LinkButton to={routes.integrations}>Open integrations</LinkButton> },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    rows: [
      { id: 'language', title: 'Language', description: 'The language Admin is shown in.', control: <PreviewSelect label="Language" options={['English']} what="Changing the language" /> },
      { id: 'time-zone', title: 'Time zone', description: 'The time zone used for event times.', control: <PreviewSelect label="Time zone" options={['Central Time (US and Canada)', 'Eastern Time (US and Canada)', 'Mountain Time (US and Canada)', 'Pacific Time (US and Canada)']} what="Changing the time zone" /> },
      { id: 'export', title: 'Download your data', description: 'Request a copy of your requests and settings.', control: <Preview label="Request data export" aria="Requesting a data export" /> },
      { id: 'security', title: 'Security', description: 'Password and two-factor authentication.', control: <Preview label="Manage security" aria="Managing security" /> },
      { id: 'sign-out', title: 'Sign out', description: 'Sign out of Admin on this device.', control: <Button variant="outline" onClick={() => window.location.assign('/pearl-login.html')}>Sign out</Button> },
      {
        id: 'delete', tone: 'danger', title: 'Delete workspace',
        description: 'Permanently delete Pearl Island’s workspace and every request in it. This can’t be undone.',
        control: <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Deleting the workspace" onClick={() => soon('Deleting the workspace')}>Delete workspace</Button>,
      },
    ],
  },
]

/** Admin > Settings: compact rows, each a title, a line of description and one control. Menu rules, the integrations link and sign out work; the rest are a preview and say so. */
export function AdminSettingsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="settings-title">
      <header className="mb-6">
        <h1 id="settings-title" className="type-page-title">Settings</h1>
        <p className="mt-1 text-body text-muted-foreground">A preview of Pearl Island’s restaurant settings. Changes can’t be saved yet, and no integrations are live.</p>
      </header>

      <div className="grid gap-8">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`settings-${section.id}`}>
            <h2 id={`settings-${section.id}`} className="mb-1 text-ui font-medium text-muted-foreground">{section.title}</h2>
            <div className="divide-y divide-border border-y border-border">
              {section.rows.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                  <div className="min-w-0 flex-1 basis-64">
                    <h3 className={row.tone === 'danger' ? 'text-body font-medium text-destructive' : 'text-body font-medium text-foreground'}>{row.title}</h3>
                    <p className="mt-0.5 max-w-[68ch] text-ui text-muted-foreground">{row.description}</p>
                  </div>
                  {row.control && <div className="shrink-0">{row.control}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
