# Technical Design: Pearl Island2GO Prototype

Draft | October 13, 2026 | Status: proposed, pending owner approval. The PRD wins on scope; `fin_marketing_reference_report.md` and PRD section 8 win on UI.

## Executive summary

A static single-page web app with no backend. All menu data, rules and scenarios live in one typed data module marked approved or illustrative. State is held in the browser and persisted locally so the demo survives refreshes and can be reset. It is deployed to a free static host as a shareable link. This costs nothing, has no model or server to fail mid-demo, and keeps menu and rules separate from the UI so they can be replaced after the Sober call, or for another restaurant later.

## Decisions

| Area | Choice | Why | Tradeoff |
|---|---|---|---|
| Framework | Vite + React + TypeScript | Fast setup, typed data model catches rule/state mistakes, widely understood | No server rendering; not needed here |
| Styling | Tailwind CSS with design tokens as CSS variables (PRD section 8) | Fin-style tokens (ivory, charcoal, orange accent, 4-8px radius) defined once | Needs discipline so one-off values do not creep in |
| Fonts | Inter Tight (headings), Source Serif 4 (body), JetBrains Mono (eyebrows/labels), all open-licensed | Closest free match to the Fin type voices | Not identical to Fin's proprietary fonts, by design |
| Routing | React Router, role-based areas: `/customer/*`, `/staff/*`, `/handoff/:id` | Clear dual view with one navigation shell | |
| State | Zustand store persisted to `localStorage` | Small, simple, retained across refresh, trivial reset | Customer and staff views share state only in the same browser |
| Backend | None | No cost, no outages, matches the simulation boundary | No real multi-user or two-device demo |
| Chatbot | Rule-based intent matcher (keywords plus suggested-question chips) calling the rule engine | No model cost; same data as recommendations so answers cannot contradict them | Limited to fixed questions; unknown input routes to staff |
| Tests | Vitest for the rule engine and state machine; manual scenario walkthroughs for UI | The logic is where wrong answers hide | UI is not automatically tested in v1 |
| Hosting | Vercel (or Netlify / GitHub Pages) static deploy from the repo | Free, shareable link, preview per branch | Public URL; keep it unlisted and label it a prototype |

## Architecture

```
data/            menu, portion rules, lead times, event types, dietary tags, scenarios
                 every record carries status: 'illustrative' | 'approved'
engine/          pure functions: recommend(intent), estimate(selection),
                 detectExceptions(order), answerQuestion(text)
state/           store: order, status, messages, scenario, reset()
                 status machine: Draft -> Submitted -> Needs review
                 -> Awaiting customer approval -> Confirmed
views/
  customer/      intake, recommendation + chatbot, review/submit, status
  staff/         queue, request detail (escalation reason, edit, clarify, accept)
  handoff/       order summary, calendar event preview, kitchen prep sheet
components/      shared UI per PRD section 8 (panels, pills, tabs, eyebrows)
```

Key rules:

- **One data source.** No view or the chatbot defines its own mock data. Customer review, staff record, calendar preview and kitchen sheet all render from the same order object.
- **Engine is pure and UI-free.** It takes data in and returns results with the reason for each, so every recommendation can show its explanation and be tested.
- **Status transitions are enforced in one place.** The store rejects invalid moves, so an exception cannot reach Confirmed without review and a revised proposal cannot be accepted without customer approval (PRD section 7).
- **Assumptions are visible.** Any value from an illustrative record renders with an assumption label; the chatbot appends it to answers that use such data.
- **Simulation is labeled.** Calendar and kitchen outputs carry a visible "Preview" tag.

## Chatbot behavior

- Entry points: free text plus suggested-question chips per screen (portions for my headcount, lead time, what is included, what fits a corporate lunch).
- Matching: normalized keywords map to a fixed intent list; each intent calls an engine function and returns an answer with its rule explanation.
- Unknown or risky questions (allergies, discounts, custom requests, anything unmatched): the bot says it cannot answer and offers to flag the request for staff, which creates a Needs review reason.
- Never: allergy or nutrition claims, prices or policies not in the data, or statements that imply acceptance.

## Hosting and demo operation

- Deploy the built static bundle; share the URL on the call or screen-share locally as fallback.
- Demo controls: scenario loader (routine, difficult), role switcher (customer, staff), and reset. A built production bundle should be tested before every call.
- Keep the URL unlisted, add a visible "Prototype, illustrative data" banner, and add no analytics or third-party scripts.

## Risks

- Illustrative data looks authoritative. Mitigation: assumption labels on every value.
- Chatbot answers a question wrongly. Mitigation: fixed intents, handoff on unknown, tests for each intent.
- State lost mid-demo. Mitigation: persisted store and a one-click reset to a known state.

## Open decisions

- Confirm stack (Vite/React/TypeScript/Tailwind) and Vercel as host.
- Whether to add a second device or shared-state demo later (would need a backend; not in v1).
