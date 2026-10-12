# PLAN: Pearl Island2GO Catering Operating System

Source of truth: `Pearl_Island2GO_Catering_PRD.md`. If this plan and the PRD disagree, the PRD wins.

## Build Sequence

Strategy -> PRD -> Research gate -> Scope sign-off -> Wireframes -> Technical design -> Implementation -> Testing -> Demo polish

**No application coding is authorized until scope is agreed (Module 0).** Scope remains proposed until then.

## Guardrails

- Simulation boundary: no live calendar writes, payments, emails, or production orders. Label simulated integrations clearly in the demo.
- Never invent Pearl Island policies, imply verified allergy safety, or show made-up time savings or business metrics.
- Menu and rule data is either approved by Pearl Island or clearly labeled illustrative.
- Replacing Spoonfed is a hypothesis, not a requirement.

## Proposed Status Sequence

Draft -> Submitted -> Needs review (when applicable) -> Awaiting customer approval (when revised) -> Confirmed

Terminology and ownership are pending Sober's input. Whether routine requests can be accepted automatically is **undecided**; until decided, confirmation requires an explicit authorized acceptance action.

## 0. Research Gate And Scope Sign-Off

Resolve what the PRD marks as unknown before features are finalized.

Core work:

- Spoonfed research: capabilities, Google Calendar support, cost, exports/APIs, and where the manual steps actually come from. Use official docs and Sober's account walkthrough.
- Walk through one routine and one difficult order with Sober; record every phone call, duplicate entry, and workaround.
- Request the current menu, prices, serving units, portion rules, lead times, minimums, and fulfillment constraints.
- Agree the build boundary: one customer journey, one staff workspace, two scenarios, simulated handoff.
- Decide whether the first prototype may use illustrative menu rules while research is pending.

Definition of Done:

- Capability comparison with evidence and a recommendation to extend, complement, or replace Spoonfed (replacement scope is not finalized before this).
- Written scope agreement, including the illustrative-data decision.

## 0b. Reference Gathering (Aesthetic And Functional Inspiration)

Runs alongside Module 0 research and feeds wireframes. Goal: build faster by starting from proven patterns instead of a blank page.

**Proven method (worked well before, near-exact replica achieved):** pair a reference site's **source code** (saved HTML/CSS, computed styles, layout structure) with **screenshots** of the same pages. Screenshots show the intended result; source shows how it is built. Give both to the coding agent together.

Core work:

- Pick 3-5 references: catering/ordering flows (guided intake, package builders, quote/approval flows), restaurant brand sites for look and feel, and staff-side queue/kitchen-sheet UIs. Include Spoonfed's public pages as a competitor reference.
- For each: capture full-page screenshots (desktop and mobile), save the page source, and note what to borrow (layout, spacing, flow, interaction) and what to skip.
- Capture Pearl Island's own site and approved brand assets as the primary visual reference.
- Record references and notes in one place so they can be reused in wireframes and build prompts.

Rules:

- Borrow structure, layout, and interaction patterns. Do not ship another company's copy, logos, images, or brand identity. Final visuals use Pearl Island's approved assets.
- Check the licensing/terms of any source you reuse verbatim; when in doubt, re-implement the pattern rather than copy the code.

Definition of Done:

- A short reference board (screenshots + source + "borrow/skip" notes) covering customer flow, staff workspace, and handoff views.
- Chosen visual direction agreed before wireframes start.

## 1. App Shell / Navigation

Core work:

- Main app layout, role context (customer vs. staff), and baseline visual system using approved Pearl Island assets.
- Views: customer intake, recommendation, customer review, staff queue and request detail, operational handoff.
- Reusable patterns for headers, panels, forms, buttons, status labels, and action areas.

Definition of Done:

- A user can move between all planned views with consistent navigation.
- Placeholder states exist for each module.
- Customer flow is mobile-friendly; staff views are readable; forms are keyboard-accessible.

## 2. Demo Data Model And Controls

Core work:

- Small menu, portion rules, lead times, event types, dietary tags, and order states in one shared structure, each marked approved or illustrative.
- Two repeatable sample scenarios: a routine event, and an unusual request.
- Demo controls: scenario loader, state retained through the walkthrough, and reset.

Definition of Done:

- Data supports both scenarios end to end; no module invents its own mock data.
- Reset returns the demo to a known starting state.

## 3. Customer Intake Flow

Core work:

- Guided form: event details, required-field validation, progress indicator, editable answers (event type, headcount, budget, dietary needs, timing, fulfillment).
- Start with a guided form; a chatbot is optional and needs evidence it improves the journey.
- Output a structured order intent for the recommendation module.

Definition of Done:

- A customer can complete intake start to finish; incomplete requests are prevented with clear help text.

## 4. Recommendation Builder (Rule-Based)

Core work:

- Propose items and quantities from a fixed local rule set, with a plain explanation tied to each rule.
- Customer can adjust selections; servings and estimated cost update together.
- Unsupported combinations or missing information prompt review instead of a fabricated answer.

Definition of Done:

- Quantities and estimates follow the configured rules and stay consistent after edits.
- Output feeds exception detection and customer review.

## 5. Exception Detection

Core work:

- Flag illustrative triggers (large order, short notice, unclear headcount, dietary complexity, unavailable request, budget mismatch) until Sober defines the real ones.
- Attach a clear reason to each flag; surface it to customer and staff.
- Preserve exception state through review, revision, and handoff.

Definition of Done:

- Exception rules run automatically; flagged requests explain what needs attention.
- An exception cannot become Confirmed before its required review.

## 6. Customer Review And Submission

Core work:

- Show estimate, selections, event details, and notes; allow basic edits.
- Submission creates a request. It does not imply restaurant acceptance.
- Route to Submitted or Needs review depending on exception status.

Definition of Done:

- A customer can review and submit; the status shown matches the order's actual state.

## 7. Staff Workspace

Core work:

- Focused request queue and request detail with escalation reason and full context.
- Actions: approve, edit proposal, request clarification, reject, add internal notes.
- A revised proposal moves to Awaiting customer approval and needs the customer's approval before acceptance.
- Authorized acceptance creates the confirmed record.

Definition of Done:

- Staff can see which requests need attention and why, and resolve them with explicit actions.
- Revised proposals cannot be accepted without customer approval.

## 8. Operational Handoff Preview

Core work:

- From one set of order details, generate the confirmed operational record, calendar event preview, kitchen prep view, and customer confirmation.
- Show timing, fulfillment details, notes, and exception history where relevant.

Definition of Done:

- Customer review, staff record, calendar preview, and kitchen view agree on event details and contents.
- Staff can tell what to make, when, and for whom.
- Calendar and kitchen outputs are visibly previews, not live integrations.

## 9. Testing / Polish

Core work:

- Run both scenarios end to end; check empty, validation, and error states, plus mobile layout and demo pacing.
- Tighten copy so the demo distinguishes demonstrated behavior from future integrations.

Definition of Done:

- Both scenarios complete with working controls and no dead ends.
- A first-time viewer can explain the problem and follow the before/after story without technical explanation.
- Sober can point to recommendations he would change and explain the missing rule; that feedback is captured for the next version.
