# Pearl Island2GO Product Strategy

Draft | October 13, 2026 | Inputs: owner's strategy notes, PRD, `pearl_island_research_gate.md`. If this and the PRD disagree on v1 scope, the PRD wins.

## Executive summary

Pearl Island2GO catering customers often need help choosing items, quantities and options. They call, and Sober or staff answer from their own judgment and taste. That time competes with Sober's priority of acquiring and retaining customers. We propose a dual-view platform that gives customers guided, explained recommendations and gives staff a focused review workspace for exceptions. Version 1 is an assumption-based prototype whose job is to win Sober's approval and surface corrections. It is not a production system.

## End-state vision

A catering platform with two views:

- **Customer view:** a simple guided form plus AI-backed recommendations about menu, portions, nutrition and event strategy, so questions are answered at the moment they arise.
- **Admin view (Sober and staff):** a queue of requests with the reason each needs attention, editable proposals, and explicit approval. A messaging thread lets staff request updates and customers respond.

Sober's taste and judgment stay in control. The software handles routine cases and escalates exceptions.

The AI end state is a probabilistic model that works with the customer on their order. The v1 prototype uses a rule-based chatbot instead (no model cost), to show Sober what it could answer. The same problem likely exists at other restaurants, so menu and rules are kept as replaceable data. Only Pearl Island is built now.

## Target user

Primary: Pearl Island2GO catering customers. Assumed mix: large parties, special occasions, and companies (assumption, not yet verified). Secondary: Sober and staff as reviewers.

## Customer problem

Customers have questions while filling out a catering order, so they call. Each call pulls Sober or staff away from operations and from growing the business. Per Sober, this is not constant, which makes the problem real but narrow.

## Why this should work (hypotheses)

- Most customer questions are about menu, portions and fit for the event, and they can be answered from approved rules and menu data.
- Customers who get an explained answer in the form will not call.
- Sober will trust the software if exceptions route to him and nothing is confirmed without authorized review.

These are hypotheses. None are validated.

## What v1 must prove

1. The vision is clear: a viewer sees customer guidance followed by a staff handoff and understands the before and after.
2. Sober approves the direction and can react to concrete screens.
3. The prototype looks real, and every unverified value discloses its assumption on click, so Sober can see what is assumed and say what is wrong.
4. The restaurant-specific feel (Caribbean menu, catering vocabulary) is present rather than a generic dashboard.

## Roadmap

Priority: P0 must have for v1, P1 should have, P2 later, P3 exploratory. Complexity: S, M or L.

| Item | Priority | Version | Complexity | Why it matters |
|---|---|---|---|---|
| Guided customer intake form (event, headcount, budget, dietary, timing, fulfillment) | P0 | v1 | M | Core of the customer journey |
| Customer-led menu browsing and selection (categories, descriptions, tags, quantities) with live servings coverage, cost and review flags; required supplies | P0 | v1 | M | The customer keeps control; shows the real menu |
| Suggestions on request: rule-based items and quantities with plain explanations | P1 | v1 | S | Proactive and personalized without taking over the choice |
| Staff queue, request detail, escalation reason, approve/edit/request clarification | P0 | v1 | M | Keeps Sober's judgment in control |
| Handoff previews: order summary, calendar event, kitchen prep sheet (simulated) | P0 | v1 | M | Shows the operational payoff |
| Two scenarios (routine, difficult), demo controls and reset | P0 | v1 | S | Makes the demo repeatable |
| Assumption labels on all unverified rules, prices and portions | P0 | v1 | S | Prevents implying false policy |
| Rule-based chatbot answering fixed customer questions from the labeled rule data, with handoff to staff when it cannot answer | P0 | v1 | M | Shows the "no call needed" vision without paying for or risking a live model; labeled as scripted |
| Basic clarification exchange (staff note, customer reply) | P1 | v1 | S | Previews messaging |
| Mobile-friendly customer flow | P1 | v1 | M | PRD requirement |
| Probabilistic AI that reasons about the customer's preferences, then works with them on their order, grounded in approved menu data | P1 | v2 | L | Delivers the actual end state |
| Menu and rules as replaceable data so other restaurants can use the platform | P2 | v2 | M | The problem likely exists beyond Pearl Island; v1 keeps data separate from UI so this stays possible |
| Full messaging thread and notifications | P2 | v2 | M | End-state feature |
| Nutrition/calorie breakdown from approved data | P2 | v2 | M | Needs data Pearl Island confirms |
| Spoonfed complement/integration, real calendar writes | P2 | v3 | L | Depends on Spoonfed research |
| Payments, deposits, quotes as contracts | P3 | v3+ | L | Out of scope for now |
| Customer acquisition and marketing features | P3 | later | L | Real goal, but separate from this problem |

Say no to anything not in the table that does not support the v1 goal.

## Guardrails (things v1 must never do)

- Present an estimate as a final quote or imply restaurant acceptance on submit.
- Show a price, portion, lead time or policy as fact when it is an assumption.
- Make allergy or dietary-safety claims, or show nutrition numbers without approved data.
- Confirm an exception request without staff review, or accept a revised proposal without customer approval.
- Show a simulated integration as if it were live.
- Show invented metrics, testimonials or time savings.

## Open questions

- Whether routine requests may ever be accepted automatically (undecided).
- Whether the customer mix assumption is right.
- How much of the AI vision Sober wants in the first real version.
