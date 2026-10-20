import { Link } from 'react-router-dom'
import { ThemePicker } from '../../components/ThemePicker'
import { routes } from '../../routes'
import './workspace.css'

export type WorkspaceArea = 'integrations' | 'agents' | 'staffSettings'

const sections = {
  integrations: {
    title: 'Integrations',
    description: 'Connections for a single catering workflow, from the restaurant website to the team calendar.',
    items: [
      ['Restaurant website', 'Not connected', 'Bring catering requests from the Pearl Island website into the staff request queue.'],
      ['Google Calendar', 'Not connected', 'Add accepted events to the restaurant calendar with the event time, guest count, and pickup or delivery details.'],
      ['Ordering and POS', 'Not connected', 'Explore how existing ordering tools could share menu and fulfillment information with catering.'],
    ],
  },
  agents: {
    title: 'AI & agents',
    description: 'A place for assisted catering workflows, with staff approval kept in control.',
    items: [
      ['Menu recommendations', 'Rule-based', 'The menu page’s Suggest button uses the existing menu, guest count, and dietary selections. It does not call an AI service.'],
      ['Request review assistant', 'Planned', 'Summarize dietary and operational exceptions for staff review before a request is accepted.'],
      ['Customer follow-up', 'Planned', 'Draft clarification questions for staff to review. No messages are sent automatically.'],
    ],
  },
}

export function WorkspacePage({ area, embedded = false }: { area: WorkspaceArea; embedded?: boolean }) {
  const settings = area === 'staffSettings'
  const section = settings ? null : sections[area]
  return <section className={`workspace-page${embedded ? ' workspace-page-embedded' : ''}`} aria-label={settings ? 'Settings' : section!.title}>
    {!embedded && <header><h1>{settings ? 'Settings' : section!.title}</h1></header>}
    {settings ? <>
      <div className="workspace-row"><div><h2>Appearance</h2><p>Choose a color theme.</p></div><ThemePicker /></div>
      <div className="workspace-row"><div><h2>Menu and rules</h2><p>Review the existing menu and catering rules preview.</p></div><Link to={routes.settings}>Open menu and rules</Link></div>
      <div className="workspace-row"><div><h2>Account access</h2><p>Use the workspace menu at the top of the sidebar to switch between the customer and restaurant staff accounts.</p></div></div>
    </> : <>
      <p className="workspace-notice">{area === 'integrations' ? 'These connections are not configured. This page outlines the proposed setup; it does not connect external services.' : 'Only menu recommendations are available today. The other assistants are planned.'}</p>
      {section!.items.map(([title, status, description]) => <div className="workspace-row" key={title}><div><h2>{title}</h2><p>{description}</p></div><span className="workspace-status">{status}</span></div>)}
    </>}
  </section>
}
