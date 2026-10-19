import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../components/ui/empty'
import { Item, ItemContent, ItemDescription, ItemTitle } from '../../components/ui/item'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Textarea } from '../../components/ui/textarea'
import { formatEventTime } from '../../lib/status'
import { MAX_MESSAGE_LENGTH, type Order } from '../../data'
import { useDemoAccount } from '../../state/demoAccount'
import { useDemoStore } from '../../state/store'

export function MessagesPage() {
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
  const selected = threads.find((order) => order.id === selectedId) ?? threads[0] ?? null

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [selected, selectedId])

  function choose(order: Order) {
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
    setMessage('')
    setNotice(staff ? 'Question saved in this demo. It was not delivered to the customer.' : 'Reply saved in this demo. It was not delivered to Pearl Island.')
    savingRef.current = false
    setSaving(false)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-6"><h1 className="type-page-title">Messages</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Request conversations are attached to their catering order. Messages in this demo are stored on this device and are not delivered.</p></header>
      {threads.length === 0 ? <Card><CardContent className="p-0"><Empty className="min-h-72"><EmptyHeader><EmptyMedia variant="icon"><MessageSquare /></EmptyMedia><EmptyTitle>No conversations yet</EmptyTitle><EmptyDescription>Messages will appear here after a catering request is submitted.</EmptyDescription></EmptyHeader></Empty></CardContent></Card> : (
        <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[minmax(15rem,0.65fr)_minmax(0,1.35fr)]">
          <Card className="min-w-0"><CardHeader><CardTitle>Conversations</CardTitle><CardDescription>{threads.length} request {threads.length === 1 ? 'thread' : 'threads'} · sample threads are marked</CardDescription></CardHeader><CardContent className="grid gap-2">{threads.map((order) => <button type="button" key={order.id} onClick={() => choose(order)} className="rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"><Item variant={selected?.id === order.id ? 'muted' : 'outline'}><ItemContent className="min-w-0"><ItemTitle className="break-words">{order.intent.contactName || 'Customer'} · {order.intent.organization || 'Catering request'}</ItemTitle><ItemDescription className="break-words">{formatEventTime(order.intent.eventAt)}</ItemDescription></ItemContent><div className="flex items-center gap-2">{order.demoSample && <Badge variant="outline">Sample</Badge>}{order.messages.length > 0 && <Badge variant="secondary">{order.messages.length}</Badge>}</div></Item></button>)}</CardContent></Card>
          {selected ? <Card className="flex min-h-[32rem] min-w-0 flex-col"><CardHeader><CardTitle>{selected.intent.contactName || 'Customer'}</CardTitle><CardDescription>{selected.intent.organization || 'Catering request'} · {formatEventTime(selected.intent.eventAt)}</CardDescription></CardHeader><CardContent className="flex min-h-0 flex-1 flex-col gap-4">
            <ScrollArea className="min-h-0 flex-1 rounded-md border p-4"><div className="grid gap-3">{selected.messages.length ? selected.messages.map((entry) => <div key={entry.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${entry.author === (staff ? 'staff' : 'customer') ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}><p className="mb-1 text-xs font-medium opacity-75">{{ customer: staff ? 'Customer' : 'You', staff: staff ? 'You · Pearl Island' : 'Pearl Island team', system: 'Request update' }[entry.author]}</p><p className="whitespace-pre-wrap break-words">{entry.text}</p></div>) : <Empty className="min-h-48 border-0"><EmptyHeader><EmptyMedia variant="icon"><MessageSquare /></EmptyMedia><EmptyTitle>No messages yet</EmptyTitle><EmptyDescription>{staff ? 'Ask for clarification to start a local demo conversation.' : 'The catering team has not sent a question in this demo.'}</EmptyDescription></EmptyHeader></Empty>}</div></ScrollArea>
            {notice && <Alert><AlertTitle>Saved locally</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
            {lastError && <Alert variant="destructive"><AlertTitle>Could not save message</AlertTitle><AlertDescription>{lastError}</AlertDescription></Alert>}
            <div className="grid gap-2"><label htmlFor="message-compose" className="text-sm font-medium">{staff ? 'Ask for clarification' : 'Reply'}</label><Textarea id="message-compose" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={staff ? 'Write a question for the customer…' : 'Write a reply…'} rows={3} maxLength={MAX_MESSAGE_LENGTH} aria-describedby="message-compose-count" /><div className="flex flex-wrap items-center justify-between gap-3"><span id="message-compose-count" className="text-xs text-muted-foreground" aria-live="polite">{message.length}/{MAX_MESSAGE_LENGTH} characters · Saved to this browser only; no message is sent.</span><Button onClick={send} disabled={saving || !message.trim() || (staff && !['submitted', 'needs_review'].includes(selected.status)) || (!staff && ['confirmed', 'rejected'].includes(selected.status))}>{saving ? 'Saving…' : 'Save message'}<Send aria-hidden="true" /></Button></div>{staff && !['submitted', 'needs_review'].includes(selected.status) && <p className="text-xs text-muted-foreground">Clarification is only available while a request is awaiting staff review.</p>}</div>
          </CardContent></Card> : null}
        </div>
      )}
      {activeOrder.status === 'draft' && !staff && threads.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Submit your catering request to start a conversation.</p>}
    </section>
  )
}
