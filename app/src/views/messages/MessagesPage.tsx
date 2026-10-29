import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { MessageSquare, Search, Send } from '../../components/icons'
import { OptionSelect } from '../../components/OptionSelect'
import { cn } from '../../lib/cn'
import { routes } from '../../routes'
import { StaffStatusBadge } from '../staff/StaffStatusBadge'
import {
  eventName, lastActivity, latestMessage, matchesSearch, readReadState, relativeTime, sortThreads, unreadCount, writeReadState,
  type ReadState, type ThreadSort,
} from './threads'
import { destinationIcons, destinationTones } from '../../components/destinationIcons'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Input } from '../../components/ui/input'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Textarea } from '../../components/ui/textarea'
import { formatEventTime } from '../../lib/status'
import { MAX_MESSAGE_LENGTH, type Order } from '../../data'
import { useDemoAccount } from '../../state/demoAccount'
import { useDemoStore } from '../../state/store'

const sortOptions = [{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]

/** "Sat, Oct 24 · 12:00 PM": the event date and time in a line that fits a list row. */
function shortEvent(eventAt: string) {
  const date = new Date(eventAt)
  return Number.isNaN(date.getTime()) ? 'Date not provided' : `${format(date, 'EEE, MMM d')} · ${format(date, 'h:mm a')}`
}

export function MessagesPage() {
  const navigate = useNavigate()
  const clock = useDemoStore((state) => state.clock)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<ThreadSort>('newest')
  const [read, setRead] = useState<ReadState>(readReadState)
  const { account } = useDemoAccount()
  const staff = account === 'team'
  const orders = useDemoStore((state) => state.orders)
  const activeOrder = useDemoStore((state) => state.order)
  const activateOrder = useDemoStore((state) => state.activateOrder)
  const requestClarification = useDemoStore((state) => state.requestClarification)
  const customerReply = useDemoStore((state) => state.customerReply)
  const lastError = useDemoStore((state) => state.lastError)
  const clearError = useDemoStore((state) => state.clearError)
  const threads = orders.filter((order) => order.status !== 'draft' && (!staff || ['submitted', 'needs_review', 'awaiting_customer_approval'].includes(order.status)))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const shown = sortThreads(threads.filter((order) => matchesSearch(order, query)), sort)
  const selected = shown.find((order) => order.id === selectedId) ?? shown[0] ?? null

  function markRead(order: Order) {
    const next = { ...read, [order.id]: order.messages.map((message) => message.id) }
    setRead(next)
    writeReadState(next)
  }

  function viewRequest() {
    if (!selected) return
    activateOrder(selected.id)
    navigate(routes.staff)
  }

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [selected, selectedId])

  function choose(order: Order) {
    markRead(order)
    setSelectedId(order.id)
    setMessage('')
    setNotice('')
    clearError()
  }

  function send() {
    if (!selected || !message.trim() || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    activateOrder(selected.id)
    if (staff) requestClarification(message.trim())
    else customerReply(message.trim())
    const error = useDemoStore.getState().lastError
    if (error) {
      savingRef.current = false
      setSaving(false)
      return
    }
    markRead(useDemoStore.getState().orders.find((order) => order.id === selected.id) ?? selected)
    setMessage('')
    setNotice(staff ? 'Question saved.' : 'Reply saved.')
    savingRef.current = false
    setSaving(false)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6"><h1 className="type-page-title">Messages</h1></header>
      {threads.length === 0 ? <Card><CardContent className="p-0"><Empty className="min-h-72"><EmptyHeader><EmptyMedia variant="tile" tone={destinationTones.messages}><destinationIcons.messages /></EmptyMedia><EmptyTitle>No conversations yet</EmptyTitle><EmptyDescription>Messages will appear here after a catering request is submitted.</EmptyDescription></EmptyHeader></Empty></CardContent></Card> : (
        <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>{shown.length === threads.length ? `${threads.length} request ${threads.length === 1 ? 'thread' : 'threads'}` : `${shown.length} of ${threads.length} request threads`}</CardDescription>
            </CardHeader>
            <CardContent className="grid min-w-0 gap-3 [&>*]:min-w-0">
              <form role="search" aria-label="Find a conversation" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto]" onSubmit={(event) => event.preventDefault()}>
                <label>
                  <span className="sr-only">Search conversations</span>
                  <span className="relative block">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="h-9 pl-9" />
                  </span>
                </label>
                <div className="w-full xl:w-36"><OptionSelect label="Sort conversations" value={sort} onValueChange={(next) => setSort(next as ThreadSort)} options={sortOptions} /></div>
              </form>
              {shown.length === 0
                ? <p className="px-1 py-4 text-sm text-muted-foreground">No conversations match “{query}”.</p>
                : (
                  <ul className="grid gap-2" aria-label="Conversations">
                    {shown.map((order) => {
                      const latest = latestMessage(order)
                      const unread = unreadCount(order, read)
                      const active = selected?.id === order.id
                      return (
                        <li key={order.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => choose(order)}
                            aria-current={active ? 'true' : undefined}
                            className={cn('w-full rounded-lg border p-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring', active ? 'border-border bg-muted' : 'border-border bg-card hover:bg-muted/50')}
                          >
                            <span className="flex items-baseline justify-between gap-3">
                              <span className={cn('min-w-0 truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
                                {order.intent.contactName || 'Customer'}{order.intent.organization ? <span className="font-normal text-muted-foreground"> · {order.intent.organization}</span> : null}
                              </span>
                              <span className="shrink-0 text-caption text-muted-foreground">{relativeTime(lastActivity(order), clock)}</span>
                            </span>
                            <span className="mt-0.5 block text-caption text-muted-foreground">{shortEvent(order.intent.eventAt)}</span>
                            <span className="mt-1.5 flex items-center justify-between gap-3">
                              <span className={cn('min-w-0 truncate text-sm', unread ? 'text-foreground' : 'text-muted-foreground')}>
                                {latest ? <>{latest.author === 'staff' ? <span className="text-muted-foreground">You: </span> : null}{latest.text}</> : 'No messages yet'}
                              </span>
                              {unread > 0 && <Badge aria-label={`${unread} unread`} className="shrink-0 rounded-full px-1.5">{unread}</Badge>}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
            </CardContent>
          </Card>

          {selected ? (
            <Card className="flex min-h-[32rem] min-w-0 flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="break-words">{selected.intent.contactName || 'Customer'}</CardTitle>
                    <CardDescription className="mt-1 break-words">{eventName(selected)}</CardDescription>
                    <p className="mt-0.5 text-sm text-muted-foreground">{formatEventTime(selected.intent.eventAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StaffStatusBadge status={selected.status} />
                    {staff && <Button variant="outline" size="sm" onClick={viewRequest}>View request</Button>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
                <ScrollArea className="min-h-0 flex-1 rounded-md border p-4">
                  <div className="grid gap-3">
                    {selected.messages.length ? selected.messages.map((entry) => (
                      <div key={entry.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${entry.author === (staff ? 'staff' : 'customer') ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="mb-1 text-xs font-medium opacity-75">
                          {{ customer: staff ? 'Customer' : 'You', staff: staff ? 'You · Pearl Island' : 'Pearl Island team', system: 'Request update' }[entry.author]} · {format(parseISO(entry.at), 'MMM d, h:mm a')}
                        </p>
                        <p className="whitespace-pre-wrap break-words">{entry.text}</p>
                      </div>
                    )) : (
                      <Empty className="min-h-48 border-0"><EmptyHeader><EmptyMedia variant="icon"><MessageSquare /></EmptyMedia><EmptyTitle>No messages yet</EmptyTitle><EmptyDescription>{staff ? 'Ask for clarification to start a conversation.' : 'The catering team has not sent a question.'}</EmptyDescription></EmptyHeader></Empty>
                    )}
                  </div>
                </ScrollArea>
            {notice && <Alert><AlertTitle>Saved locally</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
            {lastError && <Alert variant="destructive"><AlertTitle>Could not save message</AlertTitle><AlertDescription>{lastError}</AlertDescription></Alert>}
            <div className="grid gap-2"><label htmlFor="message-compose" className="text-sm font-medium">{staff ? 'Ask for clarification' : 'Reply'}</label><Textarea id="message-compose" disabled={staff && !['submitted', 'needs_review'].includes(selected.status)} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={staff ? 'Write a question for the customer…' : 'Write a reply…'} rows={3} maxLength={MAX_MESSAGE_LENGTH} aria-describedby="message-compose-count" /><div className="flex flex-wrap items-center justify-between gap-3"><span id="message-compose-count" className="text-xs text-muted-foreground" aria-live="polite">{message.length}/{MAX_MESSAGE_LENGTH} characters</span><Button onClick={send} disabled={saving || !message.trim() || (staff && !['submitted', 'needs_review'].includes(selected.status)) || (!staff && ['confirmed', 'rejected'].includes(selected.status))}>{saving ? 'Saving…' : 'Save message'}<Send aria-hidden="true" /></Button></div>{staff && !['submitted', 'needs_review'].includes(selected.status) && <p className="text-xs text-muted-foreground">Clarification is only available while a request is awaiting staff review.</p>}</div>
          </CardContent></Card>
          ) : null}
        </div>
      )}
      {activeOrder.status === 'draft' && !staff && threads.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Submit your catering request to start a conversation.</p>}
    </section>
  )
}
