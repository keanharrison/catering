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
| Customer review | Clear estimate, selections, event details, notes, and submission status |
| Staff workspace | Focused request queue, request detail, escalation reason, editable proposal, explicit approval actions |
| Operational handoff | Consistent order summary, calendar event preview, and kitchen preparation view |
| Demo controls | Repeatable sample scenarios, retained state during the walkthrough, and reset |

**Two complete scenarios:** a routine event moves through guidance and acceptance; an unusual request is held for Sober, revised, approved by the customer, and then accepted. Exception triggers are illustrative until Sober defines them.

**Design requirements:** polished Pearl Island presentation using approved assets, mobile-friendly customer flow, readable staff views, clear next actions, and keyboard-accessible forms. Start with a guided form and editable proposal; a chatbot is optional and requires evidence that it improves the journey.

**Simulation boundary:** recommendations can run locally from a fixed rule set. Calendar and kitchen outputs are working previews, with no live calendar writes, payments, emails, or production orders. Clearly communicate simulated integrations during the demo. Do not show invented time savings or business metrics.

## 5 Out of scope

- Production Spoonfed replacement, historical migration, live integrations, and deployment into restaurant operations.
- Payments, deposits, refunds, contracts, tax calculations, or guaranteed quotes.
- Live inventory, scheduling, capacity allocation, purchasing, accounting, and delivery routing.
- Autonomous decisions about allergies, special accommodations, discounts, or fulfillment feasibility.
- Training a model on historical orders or learning automatically from corrections. The demo can show a correction without claiming learning.
- Company Brain, financial analytics, marketing automation, and a general restaurant dashboard.

## 6 Spoonfed research before finalizing features

Research has not yet been performed. Use official product documentation and demonstrations for capabilities, and Sober's account walkthrough for his actual experience.

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

## Scope decision before coding

Proposed build boundary: one customer journey, one focused staff workspace, two scenarios, and simulated operational handoff. Before coding, agree on this scope and whether the first prototype may use illustrative menu rules while Spoonfed research and Sober's follow-up remain pending. No application coding is authorized by this PRD.
