import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Send } from '../../components/icons'
import { MAX_MESSAGE_LENGTH, type Message, type Order } from '../../data'
import { catalog } from '../../data'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Field, FieldDescription, FieldError, FieldLabel } from '../../components/ui/field'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../../components/ui/item'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Separator } from '../../components/ui/separator'
import { Textarea } from '../../components/ui/textarea'
import { formatEventTime } from '../../lib/status'
import { routes } from '../../routes'
import { useDemoStore } from '../../state/store'
import { StaffStatusBadge } from '../staff/StaffStatusBadge'

const SELECTED_THREAD_KEY = 'pi2go-customer-message-thread'
const REPLY_DRAFTS_KEY = 'pi2go-customer-message-drafts'

function readSessionValue(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

function writeSessionValue(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // The conversation remains usable if this browser blocks session storage.
  }
}

function readReplyDrafts(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(readSessionValue(REPLY_DRAFTS_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  } catch { return {} }
}

function eventTypeLabel(order: Order) {
  return (catalog.eventTypes.find((event) => event.id === order.intent.eventType)?.label ?? order.intent.eventType) || 'Event details unavailable'
}

function messageDate(at: string) {
  const parsed = new Date(at)
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function latestMessage(order: Order): Message | undefined {
  return [...order.messages].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
}

function messagesChronologically(order: Order) {
  return order.messages.map((entry, index) => ({ entry, index })).sort((a, b) => {
    const byDate = new Date(a.entry.at).getTime() - new Date(b.entry.at).getTime()
    return Number.isNaN(byDate) || byDate === 0 ? a.index - b.index : byDate
  }).map(({ entry }) => entry)
}

function orderDetailsPath(order: Order, clock: string) {
  const historical = order.status === 'rejected'
    || order.status === 'confirmed' && new Date(order.intent.eventAt).getTime() < new Date(clock).getTime()
  const path = historical ? routes.pastOrders : routes.currentOrders
  return `${path}?order=${encodeURIComponent(order.id)}`
}

function authorLabel(author: Message['author']) {
  return { customer: 'You', staff: 'Pearl Island team', system: 'Request update' }[author]
}

function CustomerMessagesPage() {
  const orders = useDemoStore((state) => state.orders)
  const clock = useDemoStore((state) => state.clock)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const customerReply = useDemoStore((state) => state.customerReply)
  const [selectedId, setSelectedId] = useState(() => readSessionValue(SELECTED_THREAD_KEY))
  const [drafts, setDrafts] = useState<Record<string, string>>(readReplyDrafts)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const threads = useMemo(() => orders
    .filter((order) => !order.demoSample && order.status !== 'draft' && order.messages.length > 0)
    .sort((a, b) => {
      const aLatest = latestMessage(a)?.at ?? ''
      const bLatest = latestMessage(b)?.at ?? ''
      return new Date(bLatest).getTime() - new Date(aLatest).getTime()
    }), [orders])
  const selected = threads.find((order) => order.id === selectedId) ?? null
  const reply = selected ? drafts[selected.id] ?? '' : ''
  const canReply = Boolean(selected && !['confirmed', 'rejected'].includes(selected.status))
  const currentOrderIsMissing = Boolean(selectedId && !selected && orders.some((order) => order.id === selectedId && !order.demoSample))

  useEffect(() => {
    writeSessionValue(SELECTED_THREAD_KEY, selectedId)
  }, [selectedId])

  useEffect(() => {
    writeSessionValue(REPLY_DRAFTS_KEY, JSON.stringify(drafts))
  }, [drafts])

  useEffect(() => {
    const viewport = document.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [selected?.id, selected?.messages.length])

  function choose(order: Order) {
    setSelectedId(order.id)
    setMobileThreadOpen(true)
    setReplyError('')
    setSaveError('')
    setNotice('')
  }

  function updateReply(value: string) {
    if (!selected) return
    setDrafts((current) => ({ ...current, [selected.id]: value }))
    setReplyError('')
    setSaveError('')
    setNotice('')
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || savingRef.current) return
    if (!reply.trim()) {
      setReplyError('Enter a reply before saving.')
      return
    }
    if (reply.length > MAX_MESSAGE_LENGTH) {
      setReplyError(`Keep your reply to ${MAX_MESSAGE_LENGTH} characters or fewer.`)
      return
    }
    if (!canReply) {
      setSaveError('This request is closed, so a reply cannot be saved.')
      return
    }

    savingRef.current = true
    setSaving(true)
    activateOrder(selected.id)
    customerReply(reply.trim())
    const error = useDemoStore.getState().lastError
    savingRef.current = false
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setDrafts((current) => ({ ...current, [selected.id]: '' }))
    setReplyError('')
    setSaveError('')
    setNotice('Reply saved on this device. It was not sent to Pearl Island.')
  }

  return <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
    <header className="mb-6">
      <h1 className="type-page-title">Messages</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Conversations stay with their catering requests. Messages in this demo are saved on this device and are not delivered.</p>
    </header>

    {threads.length === 0 ? <Card><CardContent className="p-0"><Empty className="min-h-72">
      <EmptyHeader><EmptyMedia variant="icon"><MessageSquare /></EmptyMedia><EmptyTitle>No conversations yet</EmptyTitle><EmptyDescription>Messages will appear here when the Pearl Island team adds an update to one of your requests.</EmptyDescription></EmptyHeader>
      <EmptyContent><Button nativeButton={false} variant="outline" render={<Link to={routes.customer} />}>New catering request</Button></EmptyContent>
    </Empty></CardContent></Card> : <div className="grid min-h-[34rem] gap-4 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
      <Card className={`${mobileThreadOpen ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col`}>
        <CardHeader><CardTitle>Conversations</CardTitle><CardDescription>{threads.length} request {threads.length === 1 ? 'thread' : 'threads'}</CardDescription></CardHeader>
        <CardContent className="grid content-start gap-2">
          {threads.map((order) => {
            const latest = latestMessage(order)
            return <button type="button" key={order.id} onClick={() => choose(order)} aria-current={selected?.id === order.id ? 'true' : undefined} className="rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Item variant={selected?.id === order.id ? 'muted' : 'outline'}>
                <ItemContent className="min-w-0">
                  <ItemTitle className="break-words">Request {order.id}</ItemTitle>
                  <ItemDescription className="break-words">{eventTypeLabel(order)} · {formatEventTime(order.intent.eventAt)}</ItemDescription>
                  <ItemDescription className="line-clamp-2 text-foreground/80">{latest?.text ?? 'No messages yet'}</ItemDescription>
                  {latest && <span className="text-xs text-muted-foreground">{messageDate(latest.at)}</span>}
                </ItemContent>
                <StaffStatusBadge status={order.status} />
              </Item>
            </button>
          })}
        </CardContent>
      </Card>

      <Card className={`${mobileThreadOpen ? 'flex' : 'hidden lg:flex'} min-h-[34rem] min-w-0 flex-col`}>
        {selected ? <>
          <CardHeader className="gap-3">
            <div className="flex items-center gap-2 lg:hidden"><Button variant="ghost" size="sm" onClick={() => setMobileThreadOpen(false)}><ArrowLeft aria-hidden="true" />Back to conversations</Button></div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><CardTitle className="break-words">Request {selected.id}</CardTitle><CardDescription className="mt-1 break-words">{eventTypeLabel(selected)} · {formatEventTime(selected.intent.eventAt)}</CardDescription></div>
              <div className="flex flex-wrap items-center gap-2"><StaffStatusBadge status={selected.status} /><Button nativeButton={false} variant="outline" size="sm" render={<Link to={orderDetailsPath(selected, clock)} />}>View order</Button></div>
            </div>
            {selected.status === 'awaiting_customer_approval' && selected.revision === 'pending' && <Alert>
              <AlertTitle>Revised proposal awaiting your approval</AlertTitle>
              <AlertDescription>Open the order details to review the proposed selections and approve them.</AlertDescription>
            </Alert>}
          </CardHeader>
          <Separator />
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
            <ScrollArea className="min-h-48 flex-1 rounded-md border p-4">
              <ol aria-label="Conversation messages" className="grid gap-3">
                {messagesChronologically(selected).map((entry) => entry.author === 'system' ? <li key={entry.id} className="mx-auto max-w-[92%] rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{authorLabel(entry.author)}</p><p className="mt-1 whitespace-pre-wrap break-words">{entry.text}</p><time className="mt-1 block">{messageDate(entry.at)}</time>
                </li> : <li key={entry.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${entry.author === 'customer' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="mb-1 text-xs font-medium opacity-75">{authorLabel(entry.author)}</p><p className="whitespace-pre-wrap break-words">{entry.text}</p><time className="mt-1 block text-xs opacity-75">{messageDate(entry.at)}</time>
                </li>)}
              </ol>
            </ScrollArea>

            {notice && <Alert role="status"><AlertTitle>Saved locally</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
            {saveError && <Alert variant="destructive" role="alert"><AlertTitle>Could not save reply</AlertTitle><AlertDescription>{saveError}</AlertDescription></Alert>}

            <form onSubmit={sendReply} className="grid gap-3">
              <Field data-invalid={Boolean(replyError)}>
                <FieldLabel htmlFor={`customer-reply-${selected.id}`}>Your reply</FieldLabel>
                <Textarea id={`customer-reply-${selected.id}`} value={reply} onChange={(event) => updateReply(event.target.value)} placeholder="Write a reply…" rows={3} maxLength={MAX_MESSAGE_LENGTH} aria-invalid={Boolean(replyError)} aria-describedby={`reply-hint-${selected.id} reply-count-${selected.id}${replyError ? ` reply-error-${selected.id}` : ''}`} disabled={!canReply || saving} />
                <FieldDescription id={`reply-hint-${selected.id}`}>{canReply ? 'Saved to this device only; it will not be sent outside the demo.' : 'This request is closed, so replies are disabled.'}</FieldDescription>
                <p id={`reply-count-${selected.id}`} className="text-xs text-muted-foreground" aria-live="polite">{reply.length}/{MAX_MESSAGE_LENGTH} characters</p>
                {replyError && <FieldError id={`reply-error-${selected.id}`}>{replyError}</FieldError>}
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{canReply ? 'Your response will appear in the same request thread.' : 'You can still review this conversation and order.'}</span>
                <Button type="submit" disabled={!canReply || saving}>{saving ? 'Saving…' : 'Save reply'}<Send aria-hidden="true" /></Button>
              </div>
            </form>
          </CardContent>
        </> : currentOrderIsMissing ? <CardContent className="grid flex-1 content-center gap-4">
          <Alert variant="destructive"><AlertTitle>Request unavailable</AlertTitle><AlertDescription>This request is no longer available in the customer account. Its conversation cannot be opened.</AlertDescription></Alert>
          <Button variant="outline" className="w-fit lg:hidden" onClick={() => setMobileThreadOpen(false)}><ArrowLeft aria-hidden="true" />Back to conversations</Button>
        </CardContent> : <CardContent className="flex flex-1 items-center justify-center p-4">
          <Empty className="border-0"><EmptyHeader><EmptyMedia variant="icon"><MessageSquare /></EmptyMedia><EmptyTitle>Select a conversation</EmptyTitle><EmptyDescription>Choose a request to view its message history and reply.</EmptyDescription></EmptyHeader><EmptyContent><span className="text-xs text-muted-foreground">Your unsent replies are kept per request.</span></EmptyContent></Empty>
        </CardContent>}
      </Card>
    </div>}
  </section>
}

export { CustomerMessagesPage }
