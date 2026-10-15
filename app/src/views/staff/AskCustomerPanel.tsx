import { useState } from 'react'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { Field, inputClass } from '../../components/Field'
import { Panel } from '../../components/Panel'

type AskCustomerPanelProps = {
  /** Called with the drafted question. The demo only records it; nothing is delivered. */
  onSimulateSend: (text: string) => void
  onCancel: () => void
}

// Draft composer for a question to the customer. "Simulate send" records the message in the demo
// state only, so the wording never claims the customer received anything.
export function AskCustomerPanel({ onSimulateSend, onCancel }: AskCustomerPanelProps) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  return (
    <Panel tone="deep" className="mt-6 p-6">
      <Eyebrow>Draft a question for the customer</Eyebrow>
      <div className="mt-4">
        <Field
          label="Question for the customer"
          htmlFor="customer-question"
          hint="Draft only. Simulating the send records it here in the demo; nothing is delivered to the customer."
        >
          <textarea
            id="customer-question"
            rows={3}
            className={inputClass}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={trimmed === ''} onClick={() => onSimulateSend(trimmed)}>
          Simulate send
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Panel>
  )
}
