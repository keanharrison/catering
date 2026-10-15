import { Button } from './Button'
import { Eyebrow } from './Eyebrow'
import { inputClass } from './Field'
import { Panel } from './Panel'
import { Pill } from './Pill'

// Display-only assistant mockup: a heading, suggested questions and an input area. No AI service is
// connected, every control is disabled, and the copy says so plainly. It shows no answers, so it cannot
// give menu, allergy or pricing advice.
const sampleQuestions = [
  'How much food should I order?',
  'Which items are vegan or gluten-free?',
  'What do I need for a lunch for 40?',
]

export function AssistantPanel() {
  return (
    <section aria-label="Ask a question (assistant demo only)">
      <Panel className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>Ask a question</Eyebrow>
          <Pill>Demo only</Pill>
        </div>

        <p className="mt-4 rounded-lg bg-ivory-deep px-4 py-3 text-sm">
          Hi! Ask me about portions, dietary options, or what to order for your event.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
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
            Ask a question
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
