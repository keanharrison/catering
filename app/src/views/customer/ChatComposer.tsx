import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUp, Microphone, Plus, X } from '../../components/icons'

const MAX_QUESTION_LENGTH = 300
const MAX_FILES = 5

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> }
type Recognizer = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechResultEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

function recognizerConstructor(): (new () => Recognizer) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const toolButton = 'flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent md:size-10'

/**
 * The pill-shaped question field used on Chat and the Dashboard: attach files with +, dictate with the microphone, send with the arrow.
 * Attachments are listed but not read yet; the answer says so.
 */
export function ChatComposer({ value, onChange, onSubmit, autoFocus = false }: {
  value: string
  onChange: (value: string) => void
  onSubmit: (attachments: string[]) => void
  autoFocus?: boolean
}) {
  const [files, setFiles] = useState<File[]>([])
  const [listening, setListening] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const recognizer = useRef<Recognizer | null>(null)
  const voiceSupported = typeof window !== 'undefined' && recognizerConstructor() !== null

  useEffect(() => () => recognizer.current?.stop(), [])

  function pick(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? [])
    setFiles((current) => [...current, ...chosen].slice(0, MAX_FILES))
    event.target.value = ''
  }

  function toggleVoice() {
    if (listening) {
      recognizer.current?.stop()
      return
    }
    const Recognition = recognizerConstructor()
    if (!Recognition) return
    const base = value.trim()
    const next = new Recognition()
    next.lang = navigator.language || 'en-US'
    next.interimResults = true
    next.continuous = false
    next.onresult = (event) => {
      const heard = Array.from(event.results).map((result) => result[0].transcript).join('')
      onChange(`${base} ${heard}`.trim().slice(0, MAX_QUESTION_LENGTH))
    }
    next.onend = () => setListening(false)
    next.onerror = () => setListening(false)
    recognizer.current = next
    setListening(true)
    next.start()
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    recognizer.current?.stop()
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
        className="flex items-center gap-1 rounded-full bg-background p-2 pl-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1px_var(--border)] transition-shadow duration-150 focus-within:shadow-[0_1px_2px_rgb(0_0_0/0.04),inset_0_0_0_1.5px_var(--foreground)]"
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
            className="chat-input h-10 w-full bg-transparent text-lead text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span aria-hidden="true" className="chat-caret" />
        </div>
        <button
          type="button"
          aria-label={voiceSupported ? (listening ? 'Stop voice input' : 'Start voice input') : 'Voice input is not supported in this browser'}
          aria-pressed={voiceSupported ? listening : undefined}
          disabled={!voiceSupported}
          onClick={toggleVoice}
          className={`${toolButton} relative ${listening ? 'bg-secondary' : ''}`}
        >
          <Microphone aria-hidden="true" style={{ width: 20, height: 20 }} />
          {listening && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />}
        </button>
        <button
          type="submit"
          aria-label="Send question"
          disabled={!canSend}
          data-icon-surface
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#c3c3c3] disabled:hover:bg-[#c3c3c3] md:size-10"
        >
          <ArrowUp aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
