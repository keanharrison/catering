import type { FormEvent } from 'react'
import { ArrowUp } from '../../components/icons'

const MAX_QUESTION_LENGTH = 300

/** The pill-shaped question field used on the Chat page and the Dashboard. */
export function ChatComposer({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }
  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-3 rounded-full bg-background p-2 pl-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1px_var(--border)] transition-shadow duration-150 focus-within:shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1.5px_var(--foreground)]"
    >
      <label htmlFor="chat-input" className="sr-only">Ask a question</label>
      <input
        id="chat-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_QUESTION_LENGTH}
        autoComplete="off"
        placeholder="Ask about your requests…"
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label="Send question"
        disabled={!value.trim()}
        data-icon-surface
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c3c3c3] disabled:hover:bg-[#c3c3c3] md:size-10"
      >
        <ArrowUp aria-hidden="true" />
      </button>
    </form>
  )
}
