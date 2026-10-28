import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUp, Plus, X } from '../../components/icons'

const MAX_QUESTION_LENGTH = 300
const MAX_FILES = 5

// Example questions that take turns in the empty field: each reveals left to right, holds, then lifts away as the next rises in.
const HINTS = ['What’s the status of my request?', 'When is my next event?', 'Do I have any drafts in progress?']


const toolButton = 'flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent md:size-10'

/**
 * The pill-shaped question field used on the Chat page: attach files with +, send with the arrow.
 * Attachments are listed but not read yet; the answer says so.
 */
export function ChatComposer({ value, onChange, onSubmit, autoFocus = false }: {
  value: string
  onChange: (value: string) => void
  onSubmit: (attachments: string[]) => void
  autoFocus?: boolean
}) {
  const [files, setFiles] = useState<File[]>([])
  const [hint, setHint] = useState(0)
  const picker = useRef<HTMLInputElement>(null)
  function pick(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? [])
    setFiles((current) => [...current, ...chosen].slice(0, MAX_FILES))
    event.target.value = ''
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    onSubmit(files.map((file) => file.name))
    setFiles([])
  }

  const canSend = Boolean(value.trim()) || files.length > 0

  return (
    <div className="relative">
      {files.length > 0 && (
        <ul aria-label="Attached files" className="absolute inset-x-0 bottom-full mb-2 flex flex-wrap gap-2 px-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex max-w-full items-center gap-1 rounded-full bg-secondary py-1 pl-3 pr-1 text-ui text-foreground">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" style={{ width: 12, height: 12 }} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={submit}
        className="flex items-center gap-1 rounded-full bg-background p-2 pl-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1px_var(--border)] transition-shadow duration-150 focus-within:shadow-[0_2px_10px_rgb(0_0_0/0.07),inset_0_0_0_1px_var(--border)]"
      >
        <input ref={picker} type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.txt,.csv" onChange={pick} />
        <button
          type="button"
          aria-label="Attach files"
          disabled={files.length >= MAX_FILES}
          onClick={() => picker.current?.click()}
          className={toolButton}
        >
          <Plus aria-hidden="true" style={{ width: 20, height: 20 }} />
        </button>
        <label htmlFor="chat-input" className="sr-only">Ask a question</label>
        <div className="relative min-w-0 flex-1 pl-1">
          <input
            id="chat-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={MAX_QUESTION_LENGTH}
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Ask about your requests…"
            className="chat-input h-10 w-full bg-transparent text-lead text-foreground outline-none placeholder:text-transparent"
          />
          <span aria-hidden="true" className="chat-caret" />
          <span key={hint} aria-hidden="true" className="chat-hint" onAnimationEnd={() => setHint((current) => (current + 1) % HINTS.length)}>{HINTS[hint]}</span>
        </div>
        <button
          type="submit"
          aria-label="Send question"
          disabled={!canSend}
          data-icon-surface
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--disabled-fill)] disabled:hover:bg-[var(--disabled-fill)] md:size-10"
        >
          <ArrowUp aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
