import { Button } from './Button'
import { Eyebrow } from './Eyebrow'
import { inputClass } from './Field'
import { Panel } from './Panel'
import { Pill } from './Pill'

// Sample questions shown as chips. They are display-only: the assistant is a mockup, so every
// control is disabled and nothing here sends a message or produces an answer.
const sampleQuestions = [
  'How much food should I order?',
  'Which items are vegan or gluten-free?',
  'What do I need for a lunch for 40?',
]

export function AssistantPanel() {
  return (
    <section aria-label="Ask a question (assistant preview)">
      <Panel className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>Ask a question</Eyebrow>
          <Pill>Preview</Pill>
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
      </Panel>
    </section>
  )
}
