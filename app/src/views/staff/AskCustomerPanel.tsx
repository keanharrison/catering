import { useState } from 'react'
import { Field, FieldDescription, FieldLabel } from '../../components/ui/field'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { MAX_MESSAGE_LENGTH } from '../../data'


type AskCustomerPanelProps = {
  /** Called with the drafted question. The demo only records it; nothing is delivered. */
  onSimulateSend: (text: string) => void
  onCancel: () => void
  error?: string | null
}

// Draft composer for a question to the customer. "Simulate send" records the message in the demo
// state only, so the wording never claims the customer received anything.
export function AskCustomerPanel({ onSimulateSend, onCancel, error }: AskCustomerPanelProps) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask for clarification</CardTitle>
        <CardDescription>Draft a question about this request. This demo records it locally; it does not send a message.</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="customer-question">Question for the customer</FieldLabel>
          <Textarea
            id="customer-question"
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-describedby={`customer-question-hint customer-question-count${error ? ' customer-question-error' : ''}`}
            aria-invalid={Boolean(error)}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <FieldDescription id="customer-question-hint">
            Enter the clarification request that should be recorded. Up to {MAX_MESSAGE_LENGTH} characters.
          </FieldDescription>
          <p id="customer-question-count" className="text-xs text-muted-foreground" aria-live="polite">
            {text.length}/{MAX_MESSAGE_LENGTH} characters
          </p>
          {error && <p id="customer-question-error" role="alert" className="text-sm text-destructive">{error}</p>}
          {!trimmed && <p className="text-sm text-muted-foreground">Enter a question to enable saving.</p>}
        </Field>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button disabled={trimmed === ''} onClick={() => onSimulateSend(trimmed)}>
          Save question
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
