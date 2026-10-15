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

## UX refinement pass (October 15, 2026)

Each item is its own commit and can be reverted alone with `git revert <commit>`.

| Change | Commit |
|---|---|
| Removed extra copy: estimate note, details-page note, staff "why it needs a look" block (review flags unchanged and still shown in the staff summary) | 8a3dbc2 |
| Details page: clearer labels for the custom-item request and order notes (ids, saved values, validation unchanged) | b56e781 |
| Menu sidebar order: calculator, one "Continue to supplies" button, assistant mockup; the button is a fixed bar on phones | 0aa72d3, 09bce86 |
| Customer assistant mockup labeled demo-only with a no-send caption | ce7ad40 |
| Staff assistant mockup matching the customer one | 407685a |
| Staff "Ask customer a question": draft composer with simulated send and a demo message log | 5233519 |
| Staff "Edit request" through the existing revise flow; customer "Approve changes" on the review page | d0bb4bc |
| Header scroll fix (focus no longer scrolls the header out of view) | a01d6df |

### Mockup and simulation limitations

- **Assistants (customer and staff):** display-only. No AI service is connected; the input, chips and Send are disabled; no answers, so no menu, allergy or pricing advice.
- **Messages:** "Simulate send" records a message in this browser's demo state only. Nothing is delivered to a customer, and the customer view does not show staff messages.
- **Edit and approval:** staff edits and the customer's "Approve changes" button change demo state only; no notification is sent. Accepting creates no real order, payment or calendar entry.
- **Accounts:** none. The Customer/Staff switch is a demo control, not access control.
- **Storage:** the draft and request live in this browser's local storage on this device. Two devices do not share state.
- **Not built:** customer dashboard (past and current requests), real messaging, real AI answers, deployment automation.

## Branding pass (Pearl Island)

Added October 15, 2026. Captured branding (`docs/branding/pearl-island/`) now takes precedence for brand identity; Fin-inspired layout patterns remain where useful. Every item below is its own commit, so any one can be undone with `git revert <commit>` without touching the others. Scope is branding only: no change to the journey, menu data, rules, validation or saved state.

| Step | What | Status | Commit |
|---|---|---|---|
| B1 | Reference files in `docs/branding/pearl-island/` | Done | f49f833 |
| B2 | Theme tokens (turquoise accent, dark turquoise actions, nav color, marketing accent) and Inter-only typography | Done | d6fef0b |
| B3 | Shared component states, 3:1 control borders, corner decorations removed from screens, captured supplies label | Done | d6c4f41 |
| B4 | Header navigation uses the observed active-link color | Done | 8d21592 |
| B5 | Logo asset, page title and icon (default Vite identity removed) | Done | ca072e4 |
| B6 | Logo in the header, upper-left, aligned to the content's left edge, nav right, alt text, aspect ratio kept | Done | f91e443 |
| Fix | Header was scrolled out of view on every page load because focus moved to the page; now scrolls to top and focuses without scrolling | Done | a01d6df |
| B7 | `IMPLEMENTATION.md` decision record, PRD section 8, `TECH_DESIGN.md` styling rows, README link, Gallery update | Not started | |
| B8 | Full-journey desktop and mobile visual check (long labels, steppers, sticky total, errors, review) | Not started | |

Verification so far: the header was checked in a real browser at 1280px and 390px (logo and page heading share a left edge, no horizontal overflow). The rest of the journey has not yet been visually checked.

## Deferred (not for this meeting)

Customer dashboard for past and current requests (backlog: STRATEGY.md roadmap, P2), rule-based chatbot, advanced AI, full staff workspace, calendar and kitchen previews, multiple time slots, Standard vs Group orders, delivery zones, payments.

## Open decisions

None blocking. Meeting questions are in `SOBER_MEETING_QUESTIONS.md`.
