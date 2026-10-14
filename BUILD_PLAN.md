# Build Plan: One Complete Customer Journey

Revised October 14, 2026. Scope: PRD wins (section 9 narrows the demo). Architecture: `TECH_DESIGN.md`. UI look: PRD section 8 and `fin_marketing_reference_report.md`.

## Executive summary

For the Sober meeting we are building one thing: a customer can assemble a catering request without getting stuck. Event basics, menu selection, supplies, optional help, final details, review, simulated submission. Existing work (data model, rule engine, status machine, design system, intake validation) is reused. Staff review and handoff are minimal and simulated. Everything else is deferred. Unconfirmed menu data stays labeled as an assumption.

## Rules for every step

Done means: it meets its "Done when" check, type check, tests and production build pass, no guardrail is violated (no real-order or payment implication, no invented portion, price or dietary guidance), and it is committed.

## Done

| Step | What | Notes |
|---|---|---|
| 0 | Scaffold | Vite, React, TypeScript, Tailwind, Router, Vitest. Not yet deployed. |
| 1 | Design shell | Fin-aligned tokens and shared components |
| 2 | Data model and sample data | Observed Spoonfed menu, labeled as assumptions |
| 3 | Rule engine | recommend, estimate, detectExceptions |
| 4 | Status machine and store | Persisted state, scenario loader, reset |
| 5a, 5b | Intake form and validation | Reworked in step 5c |

## Remaining steps

| Step | Deliverable | Done when |
|---|---|---|
| 5c | Intake trimmed to event basics (type, guests, date, pickup or delivery, dietary needs, optional budget); journey progress bar across all stages; stage guards so the customer cannot skip ahead | Intake has basics only; both scenarios pass validation; jumping to a later URL redirects to the first incomplete stage |
| 6a | Menu browse: category tabs, expandable items with description, tags, price and serving note, dietary filter chips | Every observed item renders with its data; filters work |
| 6b | Selection and totals: quantity controls, order summary, entree coverage, estimate, review-flag preview; menu starts empty | An order can be built with no suggestion; totals, coverage and flags match the engine after every edit |
| 6c | Required supplies choice (none needed or selected options) | Cannot continue without a choice; supplies price into the estimate |
| 6d | "Help me choose": existing rule engine proposes items and quantities with reasons; accept, change or ignore; undo | Never appears unasked; accepting fills the order; ignoring changes nothing; no new guidance invented |
| 6e | Final details: time, contact, notes, custom request | Required details enforced; time joins the intake date |
| 7 | Review and simulated submission: summary, edit links, submit, clear simulated confirmation | Submission records the request; confirmation says nothing was sent and no payment was taken; flagged requests show their review reasons |
| 8 | Minimal staff view and handoff summary (simulated): request, status, flags, accept; read-only order summary | Accept works only through the status machine; both views state they are simulated |
| 9 | End-to-end journey tests for both scenarios (UI-level) | Both scenarios complete with no dead end; flagged vs unflagged routing verified |
| 10 | Mobile, keyboard and copy pass for the customer journey | Customer pages usable at phone width and by keyboard |
| 11 | Demo readiness: deploy check, demo script, meeting question list | Deployed link works; script verified; blockers reported |

## Deferred (not for this meeting)

Rule-based chatbot, advanced AI, full staff workspace, calendar and kitchen previews, multiple time slots, Standard vs Group orders, delivery zones, payments.

## Open decisions

None blocking. Meeting questions are in `SOBER_MEETING_QUESTIONS.md`.
