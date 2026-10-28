import { useState } from 'react'
import { answerQuestion, type Answer, type DashboardSummary } from './dashboardSummary'

export type Turn = { id: number; question: string; attachments: string[]; answer: Answer }

/** The conversation so far. Answers come from the customer's own requests; nothing leaves the browser. */
export function useAssistant(summary: DashboardSummary) {
  const [turns, setTurns] = useState<Turn[]>([])

  function ask(question: string, attachments: string[] = []) {
    const trimmed = question.trim()
    if (!trimmed && attachments.length === 0) return
    setTurns((current) => [...current, { id: current.length, question: trimmed, attachments, answer: answerQuestion(trimmed, summary, attachments) }])
  }

  return { turns, ask }
}
