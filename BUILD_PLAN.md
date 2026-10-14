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

## Customer journey steps

| Step | Status | Notes |
|---|---|---|
| 5c Intake trimmed to event basics, journey progress bar, stage guards | Done | Back returns to the previous stage; jumping ahead by URL redirects |
| 6a Menu browse: category tabs, item details, tags, filters | Done | All observed items render from the data |
| 6b Selection and totals: quantities, coverage, estimate, flag preview | Done | Menu starts empty; no suggestion needed |
| 6c Required supplies choice | Done | Per-person supplies priced once per guest |
| 6d "Help me choose" | Done | Existing rule engine only; on request; undo |
| 6e Final details: time, contact, notes, custom request | Done | Time joins the intake date |
| 7 Review and simulated submission | Done | Confirmation says nothing was sent and no payment was taken |
| 8 Minimal staff view and handoff summary | Done | Both labeled simulated; accept goes through the status machine |
| 9 End-to-end journey tests (UI level, both scenarios) | Done | 7 tests in `journey.e2e.test.tsx` |
| 10 Mobile, keyboard and copy pass | Not started | Tests run in a simulated browser only; no real-browser or phone check yet |
| 11 Demo readiness: deploy check, demo script | Not started | Vercel login needed for deploy |

## Deferred (not for this meeting)

Rule-based chatbot, advanced AI, full staff workspace, calendar and kitchen previews, multiple time slots, Standard vs Group orders, delivery zones, payments.

## Open decisions

None blocking. Meeting questions are in `SOBER_MEETING_QUESTIONS.md`.
