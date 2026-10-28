# Product and Design Vision

## The product we are building

Catering should make it easier for people to plan food for an event and easier for restaurant teams to fulfill the order correctly. It should give customers clear guidance without taking away their choices, and give staff useful automation without taking away their judgment.

The product serves many restaurants. A restaurant's identity and operating rules come from its setup. The customer-facing experience can carry that restaurant's brand; the staff workspace should feel consistent across restaurants. The catering product remains useful on its own, with optional connectors to websites, calendars, payments, POS, and other systems.

## Experience principles

- **Make the next step clear.** Keep customer ordering approachable, especially on a phone; ask for information when it is needed and explain why it matters.
- **Keep customer agency.** Let people browse and order manually, request guidance when useful, and edit or decline suggestions without losing their work.
- **Explain quantity guidance.** Show what a quantity covers and why a suggestion or warning appears. Treat configured portions as restaurant rules, not universal truths.
- **Keep a person reachable.** Route uncertainty, allergy questions, unavailable items, and exceptions to staff instead of fabricating confidence.
- **Give staff control and context.** Bring the order, event details, history, and reasons for review together with clear actions and ownership.
- **Carry one order record through the workflow.** Customer review, staff decisions, and operational handoff should refer to the same data so staff do not have to retype it.
- **Be honest about state.** Estimates are estimates; submission is not acceptance; simulated or unavailable integrations must not look completed.
- **Design for restaurant reality.** Support mixed menu units, quantity minimums, increments, item options, multiple locations, and location-specific fulfillment rules through setup.

## Visual direction

Use the restaurant's approved brand assets and references for customer-facing pages. For Pearl Island, follow the approved references in `docs/branding/pearl-island/` and the current interface tokens in `app/src/index.css`; do not substitute another brand's identity. Keep staff screens legible, calm, and action-focused, with clear hierarchy, restrained surfaces, readable status cues, and accessible controls.

The existing prototype uses React, TypeScript, Vite, React Router, Tailwind CSS, and shared UI components. Preserve the useful separation between restaurant data, pure calculations/rules, application state, and views. Keep business rules independent from rendering; keep integrations behind optional boundaries so the core ordering and staff workflows remain usable without a provider.

## Trust and restraint

- Use evidence-backed menu and policy data; mark unconfirmed values internally and never present them as verified facts.
- Dietary labels are not allergy or nutrition guarantees.
- Automation can draft and recommend; staff decide exceptions and acceptance.
- Do not imply real orders, messages, payments, calendar writes, or measured savings unless those outcomes are actually established.
- Prefer a complete, dependable ordering flow over broad feature count. Learn from the Pearl Island pilot before generalizing assumptions into product rules.
