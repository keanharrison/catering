import { useState } from 'react'
import { answerQuestion, type Answer, type DashboardSummary } from './dashboardSummary'

export type Turn = { id: number; question: string; answer: Answer }

/** The conversation so far. Answers come from the customer's own requests; nothing leaves the browser. */
export function useAssistant(summary: DashboardSummary) {
  const [turns, setTurns] = useState<Turn[]>([])

  function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    setTurns((current) => [...current, { id: current.length, question: trimmed, answer: answerQuestion(trimmed, summary) }])
  }

  return { turns, ask }
}
