import { useState } from 'react'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { MAX_MESSAGE_LENGTH } from '../../data'

type DeclineRequestPanelProps = {
  /** Called with the reason. The demo records it as the final message; nothing is delivered. */
  onDecline: (reason: string) => void
  onCancel: () => void
  error?: string | null
}

// Closing a request is final, so a reason is required and the action asks for its own confirmation.
export function DeclineRequestPanel({ onDecline, onCancel, error }: DeclineRequestPanelProps) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decline request</CardTitle>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="decline-reason">Reason</FieldLabel>
          <Textarea
            id="decline-reason"
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-describedby={`decline-reason-hint${error ? ' decline-reason-error' : ''}`}
            aria-invalid={Boolean(error)}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <FieldDescription id="decline-reason-hint">The customer sees this as the last message. A declined request can’t be reopened.</FieldDescription>
          {error && <p id="decline-reason-error" role="alert" className="text-sm text-destructive">{error}</p>}
        </Field>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="destructive" disabled={trimmed === ''} onClick={() => onDecline(trimmed)}>
          Decline request
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
