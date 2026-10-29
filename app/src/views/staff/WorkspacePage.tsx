import './workspace.css'

export type WorkspaceArea = 'agents'

const sections = {
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
  const section = sections[area]
  return <section className={`workspace-page${embedded ? ' workspace-page-embedded' : ''}`} aria-label={section.title}>
    {!embedded && <header><h1>{section.title}</h1></header>}
    <p className="workspace-notice">Only menu recommendations are available today. The other assistants are planned.</p>
    {section.items.map(([title, status, description]) => <div className="workspace-row" key={title}><div><h2>{title}</h2><p>{description}</p></div><span className="workspace-status">{status}</span></div>)}
  </section>
}
