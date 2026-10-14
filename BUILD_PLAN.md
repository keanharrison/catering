# Build Plan: Executable Steps

Draft | October 13, 2026 | Engineering order for the prototype. Scope: PRD wins. Product modules: `PLAN.md`. Architecture: `TECH_DESIGN.md`. Screens: `WIREFRAMES.md`. UI look: PRD section 8 and `fin_marketing_reference_report.md`. Revised after external review: larger steps split, validation and deploy gates added.

## Executive summary

Logic is built and tested before any screen. A deployed shell exists after step 0, and deploy checks run again at demo readiness. Steps are sized to finish and commit on their own. Guardrails from `STRATEGY.md` are enforced by tests, not just by review.

## Rules for every step

A step is done only when all of these are true:

- It meets its "Done when" check.
- Type check and tests pass, and the production build succeeds.
- No guardrail in `STRATEGY.md` is violated.
- It is committed with a message naming the step.

## Steps

| # | Step | Deliverables | Done when |
|---|---|---|---|
| 0 | Scaffold and first deploy | Vite + React + TypeScript, Tailwind, React Router, Vitest, folder layout from `TECH_DESIGN.md`, design tokens and fonts as CSS variables, empty routes (customer, staff, handoff) in `app/` | App runs, tests run, build passes, empty shell is live on Vercel |
| 1 | Design shell | Demo bar (role switch, scenario loader, reset), shared components (panel with corner squares, status pill, mono eyebrow, step/tab bar, buttons, fields, stat line, assumption tag, preview tag), component gallery, responsive base layout | Tokens, routes, demo bar and responsive base layout exist; gallery matches the Fin references |
| 2 | Data model and sample data | Types for menu item, rule, order, status, message, scenario; one data module (menu, portions, lead times, event types, dietary tags); routine and difficult scenarios; every record tagged illustrative or approved | Seed data validation test passes: every menu item, rule and scenario has required fields and an assumption label |
| 3 | Rule engine | `recommend`, `estimate`, `detectExceptions` as pure functions returning a reason for each result | Tests cover recommendations and flags for both scenarios and edge cases (missing headcount, short notice, large order) |
| 4 | State store and status machine | Persisted store (order, status, messages, scenario), enforced transitions, scenario loader, reset | Tests cover allowed and blocked transitions; guardrail tests pass: flagged order cannot be accepted, revised proposal requires customer approval; reset restores the known state |
| 5a | Intake shell (done) | Route and form layout, progress indicator, all intake fields | Customer can reach and fill every intake field |
| 5b | Intake validation (done) | Required-field validation, help text, editable answers, structured order intent output | Incomplete requests are blocked with clear messages |
| 5c | Intake trim | Reduce intake to event basics (type, guests, date, pickup or delivery, dietary needs); move time, contact, notes and custom request to step 6e; Back from the menu returns to the last intake step; fix stale tray wording | Intake has the basics only; validation still passes for both scenarios; Back lands on the last step |
| 6a | Menu browse | Real menu by category tabs (Entrees, Sides, Salads), expandable items with description, dietary tags, per-serving price and serving note; dietary filter chips | Every observed menu item renders from the data with its tags and price; both scenarios load |
| 6b | Selection and totals | Quantity controls, order summary, live servings coverage per category, estimate, minimums, review-flag preview | Totals, coverage and flags update after every change and match the engine; customer can build an order with no suggestion |
| 6c | Supplies | Required supplies choice (none needed or priced options, per-person and per-set pricing) in the selection flow | Order cannot continue without a supplies choice; supplies price into the estimate correctly |
| 6d | Suggestions on request | "Help me choose" action that proposes items and quantities with explanations; customer accepts, changes or ignores; undo | Suggestions never appear unasked; accepting fills the order from the engine; ignoring leaves the order unchanged |
| 6e | Final details | Pickup or delivery time (date stays from intake), contact, notes, custom request, with validation | Required details enforced; time uses the same date; contact and notes carry into the order |
| 7 | Rule-based chatbot | Intent list covering menu items, dietary tags, serving sizes, supplies and notice rules, `answerQuestion`, suggested-question chips, desktop panel and mobile sheet, handoff to staff that adds a Needs review reason, unknown-intent state | Known intents answer from the same data as the recommendations and carry assumption labels; unknown, allergy and discount questions route to staff; a test per intent |
| 8 | Review, submit and status | Review summary, submit creates a request, status screen, staff-message view, approve-changes action, no-scenario-loaded state | Request enters the correct status; no final-quote or acceptance language anywhere |
| 9a | Staff queue and detail (read-only) | Queue with reasons, request detail with full context | Staff can see which requests need attention and why |
| 9b | Staff actions and transitions | Accept, edit proposal, request clarification, reject, internal note, wired to the state machine | Staff can review, edit and request clarification; accept works only when allowed |
| 10 | Handoff preview | Order summary, calendar event preview, kitchen prep sheet, all from one order object | All three render and agree with the customer review and staff record; each is visibly tagged as simulated |
| 11 | End-to-end scenario pass | Run both scenarios start to finish; fix dead ends; check every guardrail | Routine and difficult paths work end to end with no dead ends or guardrail violations |
| 12a | Mobile pass | Mobile layout of the customer flow | Key customer screens are usable at phone width |
| 12b | Accessibility pass | Keyboard navigation, focus states, contrast, form labels | Forms and primary actions work by keyboard; contrast checked |
| 12c | Visual polish | Spacing, type, copy tightening, empty and error state copy | Screens match PRD section 8; copy distinguishes demonstrated behavior from future integrations |
| 13 | Demo readiness | Production deploy, written demo script (exact path for routine and difficult scenarios), local fallback instructions, dry run | Deploy smoke check passes (Vercel URL loads, refresh works on routed pages, localStorage reset works); script verified by a dry run; guardrails checked |

## Empty and error states to cover

No scenario loaded, invalid intake, missing required review field, unknown chatbot intent. Build each in the step that introduces the screen, and re-check in step 11.

## Minimum cut if time is short

Keep at all costs: scenario switcher, intake, recommendation, staff review, status machine, handoff preview, assumption labels.

Cut last: chatbot depth, queue dashboard polish, calendar preview, visual polish. The chatbot is P0 in the PRD, so only its depth is cut (suggested-question chips stay), not the feature.

## Order of work

- Steps 1 and 2 can progress in parallel; screens start at step 5. Steps 5a, 5b and the first version of the suggestions screen are done; 5c and 6a-6e rework the customer flow to be customer-led (see the PRD decision of October 14, 2026).
- Revisit this plan after step 4. If the data model changes, update `TECH_DESIGN.md` and this file before building screens.

## Open decisions

- Repo layout: app in an `app/` subfolder with docs at the root (proposed and assumed in step 0). Confirm before scaffolding.
