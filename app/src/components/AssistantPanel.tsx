import { Button } from './Button'
import { Eyebrow } from './Eyebrow'
import { inputClass } from './Field'
import { Panel } from './Panel'
import { Pill } from './Pill'

// Display-only assistant mockup: a heading, suggested questions and an input area. No AI service is
// connected, every control is disabled, and the copy says so plainly. It shows no answers, so it cannot
// give menu, allergy or pricing advice. The staff version matches the customer one with different prompts.
type Audience = 'customer' | 'staff'

const copy: Record<Audience, { region: string; heading: string; greeting: string; questions: string[] }> = {
  customer: {
    region: 'Ask a question (assistant demo only)',
    heading: 'Ask a question',
    greeting: 'Hi! Ask me about portions, dietary options, or what to order for your event.',
    questions: [
      'How much food should I order?',
      'Which items are vegan or gluten-free?',
      'What do I need for a lunch for 40?',
    ],
  },
  staff: {
    region: 'Staff assistant (demo only)',
    heading: 'Staff assistant',
    greeting: 'Hi! Ask me about this request, its review notes, or the menu.',
    questions: ['Summarize this request', 'What needs a second look?', 'Draft a question for the customer'],
  },
}

export function AssistantPanel({ audience = 'customer' }: { audience?: Audience }) {
  const text = copy[audience]
  return (
    <section aria-label={text.region}>
      <Panel className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>{text.heading}</Eyebrow>
          <Pill>Demo only</Pill>
        </div>

        <p className="mt-4 rounded-lg bg-ivory-deep px-4 py-3 text-sm">
          {text.greeting}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {text.questions.map((question) => (
            <button
              key={question}
              type="button"
              disabled
              className="rounded-lg border border-control-line px-3 py-2 text-left font-sans text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <label htmlFor="assistant-input" className="sr-only">
            {text.heading}
          </label>
          <input
            id="assistant-input"
            disabled
            placeholder="Type your question..."
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <Button disabled>Send</Button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Demo only. Questions can't be sent or answered yet, so nothing you see here is advice about the menu,
          ingredients or pricing.
        </p>
      </Panel>
    </section>
  )
}
