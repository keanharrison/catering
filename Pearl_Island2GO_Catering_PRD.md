# Pearl Island2GO Catering Operating System

Product requirements document | Draft for scope review | October 9, 2026

## Product goal

Demonstrate how Pearl Island2GO could guide catering customers from event requirements to a complete order, then carry the same information into staff operations. The demo should make Sober Pierre's judgment accessible for routine requests while giving him control over exceptions.

This is an interactive client demo, not a production launch. Scope remains proposed until agreed upon. Evidence below comes from the interview findings provided in the project brief; the full transcript has not been reviewed for this PRD.

## 1 Validated problems

Validated here means reported in the supplied interview findings, not measured independently.

- Customers need help choosing menu items, estimating quantities or servings, and completing catering orders.
- Sober or staff provide this guidance by phone, taking time away from restaurant operations.
- Parts of the completed-order handoff, including Google Calendar, happen manually and can introduce errors. Error frequency and consequences are not yet established.
- Pearl Island currently uses Spoonfed. Its exact configuration, costs, strengths, and gaps remain unverified.

The strongest demo story is customer guidance followed by a consistent operational handoff. Replacing Spoonfed or lowering costs is a hypothesis, not an established requirement.

## 2 Assumptions requiring research

| Assumption | What must establish it |
| --- | --- |
| Routine recommendations can be expressed as reliable rules | Sober walks through representative orders and explains portions, combinations, and exceptions |
| Customers will complete guided intake themselves | Observe customers trying the proposed journey and identify where they still need help |
| Event type, headcount, budget, dietary needs, timing, and fulfillment are the right intake fields | Review current forms, calls, and past orders with Sober |
| Standard requests can advance without owner review | Sober defines approval authority, capacity checks, and acceptance rules |
| The operational record and kitchen handoff can share one structure | Inspect the actual information staff need, when they need it, and who owns each step |
| A replacement is preferable to extending Spoonfed | Research current features, configuration, integrations, total cost, and migration burden |

Before realistic recommendations, obtain the current menu, prices, serving units, portion rules, lead times, minimums, and fulfillment constraints. Use approved historical examples where available; otherwise use clearly identified sample scenarios. Never invent Pearl Island policies or imply verified allergy safety.

## 3 Core user journey

1. **Describe the event.** Customer supplies event details through a short guided form. Required fields and help text prevent incomplete requests.
2. **Review a recommendation.** Software proposes menu items and quantities with a plain explanation tied to approved rules. It identifies missing information or cases requiring staff review.
3. **Adjust the proposal.** Customer changes selections or quantities; servings and estimated cost update together. Unsupported combinations prompt review rather than a fabricated answer.
4. **Submit the request.** Customer checks an event and order summary. Submission creates a request; it does not imply restaurant acceptance.
5. **Review exceptions.** Sober or staff see the request, the reason for escalation, and its full context. They edit the proposal or request clarification. A changed proposal requires customer approval before acceptance.
6. **Accept and hand off.** An authorized acceptance action creates a confirmed operational record, calendar preview, and kitchen handoff from the same order details. Automatic acceptance of routine requests remains undecided.

Proposed status sequence: Draft → Submitted → Needs review when applicable → Awaiting customer approval when revised → Confirmed. Exact terminology and ownership require Sober's input.

## 4 MVP and demo functionality

| Demo component | Required behavior |
| --- | --- |
| Customer intake | Event details, required-field validation, progress indicator, editable answers |
| Recommendation builder | A small approved or explicitly illustrative menu; rule-based quantities; explanations; responsive totals |
| Rule-based chatbot | Answers a fixed set of customer questions (menu, portions, quantities, lead time, fit for the event) from the same labeled rule data as the recommendation builder; suggested-question chips; helps with the order workflow; any question it cannot answer routes to staff review instead of guessing; no allergy or nutrition claims; labeled as a scripted prototype, not a live AI model |
| Customer review | Clear estimate, selections, event details, notes, and submission status |
| Staff workspace | Focused request queue, request detail, escalation reason, editable proposal, explicit approval actions |
| Operational handoff | Consistent order summary, calendar event preview, and kitchen preparation view |
| Demo controls | Repeatable sample scenarios, retained state during the walkthrough, and reset |

**Two complete scenarios:** a routine event moves through guidance and acceptance; an unusual request is held for Sober, revised, approved by the customer, and then accepted. Exception triggers are illustrative until Sober defines them.

**Design requirements:** polished Pearl Island presentation using approved assets, mobile-friendly customer flow, readable staff views, clear next actions, and keyboard-accessible forms. Start with a guided form and editable proposal, with a rule-based chatbot alongside it (see the chatbot row in section 4). The chatbot is a v1 feature.

**Simulation boundary:** recommendations can run locally from a fixed rule set. Calendar and kitchen outputs are working previews, with no live calendar writes, payments, emails, or production orders. Clearly communicate simulated integrations during the demo. Do not show invented time savings or business metrics.

## 5 Out of scope

- Production Spoonfed replacement, historical migration, live integrations, and deployment into restaurant operations.
- Payments, deposits, refunds, contracts, tax calculations, or guaranteed quotes.
- Live inventory, scheduling, capacity allocation, purchasing, accounting, and delivery routing.
- Autonomous decisions about allergies, special accommodations, discounts, or fulfillment feasibility.
- Training a model on historical orders or learning automatically from corrections. The demo can show a correction without claiming learning.
- Company Brain, financial analytics, marketing automation, and a general restaurant dashboard.
- A live or probabilistic AI model. The end state is an AI that works with customers on their orders (see `STRATEGY.md`), but the prototype chatbot is rule-based.
- Multi-restaurant support. The menu and rules should be replaceable data so other restaurants are possible later, but only Pearl Island is built now.

## 6 Spoonfed research before finalizing features

Public-source research is summarized in `pearl_island_research_gate.md` and has not been independently verified. Sober's account walkthrough has not happened and is still needed for his actual experience. Use official product documentation and demonstrations for capabilities.

| Research area | Questions to resolve |
| --- | --- |
| Customer ordering | Does Spoonfed already offer guided selection, package recommendations, serving guidance, configurable questions, and editable proposals? |
| Staff operations | How does it handle quotes, acceptance, revisions, kitchen sheets, fulfillment, and staff ownership? |
| Calendar handoff | What native Google Calendar support exists? Is the manual step caused by a missing capability, configuration, or workflow choice? |
| Commercial fit | What does Sober pay, which features does he use, and what commitments or switching costs exist? |
| Data access | What exports, APIs, and integration options are available for orders, menus, and customers? |
| Actual friction | Walk through one routine and one difficult order. Identify every phone call, duplicate entry, workaround, and tool outside Spoonfed. |

Deliverable: a capability comparison with evidence, Sober's current workflow map, and a recommendation to extend, complement, or replace Spoonfed. Do not finalize replacement scope until this is complete.

## 7 Demo success criteria

- A first-time viewer can explain the problem and follow the before-and-after story without technical explanation.
- Both scenarios complete end to end with working controls and no dead ends.
- Quantities and estimates follow the configured rules and update consistently after edits.
- Customer review, staff record, calendar preview, and kitchen handoff agree on event details and order contents.
- An exception cannot become confirmed before its required review; a revised proposal requires customer approval.
- Sober can identify recommendations he would change and explain the missing rule or context. His feedback informs the next version.
- The presentation clearly distinguishes demonstrated behavior from future integrations. Actual time savings require later measurement.

## 8 Design direction

**Source of truth for UI and frontend:** `fin_marketing_reference_report.md` and the six Fin screenshots in `images/` (`fin_ref_1`-`fin_ref_6`). Any UI or frontend question is answered there first. The references inform visual patterns only; Fin's logo, copy, photography, and exact values are not reused. The PRD journey and scope take precedence over product content in the references. Where the report's palette and layout proposals (teal/mango palette, staff-dashboard-first home screen, operations metrics) differ from this section, this section wins, because those proposals are not Fin-based or conflict with scope.

**Structure stays PRD-first.** The customer guided flow comes first, followed by the staff workspace and the operational handoff. No marketing landing page or staff-dashboard-first home screen is in scope.

**Borrow (patterns, re-implemented originally):**
- Warm off-white surfaces, near-black text, hairline borders, full-width bands, and low-radius panels.
- Three type voices: large tight sans headings, serif body copy, and small uppercase monospace labels.
- Product-style panels with status pills, a compact stat line, and a clear primary/secondary action row. Use them for the staff exception review card.
- A tab or step list with an active-progress bar. Use it for the intake progress and the status sequence.
- Large-number summary cards for the customer estimate.
- A connected-systems visual for the handoff preview, labeled as simulated.
- Dotted-fill bars only for serving or quantity breakdowns.

**Skip:**
- Logo bands, testimonials, performance or benchmark charts, ROI claims, and pricing-model copy. These would be invented proof, which this PRD rules out.
- Fin's logo, copy, photography, and brand marks.
- Operations analytics, such as on-time delivery, margin, staffing coverage, and driver routing. These are out of scope (section 5).

**Approximate original tokens (illustrative until Pearl Island's approved brand assets are provided):**

| Token | Direction |
| --- | --- |
| Surface | Warm ivory, about `#F8F5EE`; white for panels |
| Text | Charcoal, about `#1C1C1A`; muted gray for secondary copy |
| Border | Light warm gray hairline, about `#DDD8CC` |
| Accent | Warm orange, about `#E4572E`, as the single accent: bullets, active-tab progress bar, chart and bar fills, eyebrow squares |
| Status | Muted green for confirmed, amber for needs review, red for blocked; used only inside product UI pills |
| Radius | 4-8px |
| Spacing | Generous section rhythm; centered max-width content with wide gutters |
| Type | Open-licensed substitutes: grotesque sans headings, serif body, mono uppercase labels |
| Details | Corner registration squares on sections and panels, dotted fills, light technical borders, product UI as the visual hero |

Replace the accent and type tokens with Pearl Island's approved brand assets when available. Customer-flow views must stay mobile-friendly and meet the accessibility requirements in section 4.

## Scope decision before coding

Build boundary: one customer journey, one focused staff workspace, two scenarios, and simulated operational handoff (order summary, calendar preview, kitchen prep view).

**Decision (October 13, 2026):** Build an assumption-based prototype before the Sober call. Illustrative menu, pricing, and rule data is allowed if clearly labeled as an assumption in the UI. The purpose is to give Sober something concrete to correct. Coding is authorized for this prototype only. Replacement scope, real rules, and production behavior remain pending Sober's input. See `pearl_island_research_gate.md` for assumptions, questions, and the call agenda.
