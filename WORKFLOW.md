# Catering Product Workflow

This document combines the proposed catering product journey with observations from Pearl Island's Spoonfed ordering flow. It covers the catering product only; a restaurant website is a separate product and may link to catering, but the catering workflow must work independently. Website, calendar, POS, email, payments, and other connections are optional integrations.

## Evidence labels

- **Product direction:** standalone, restaurant-agnostic catering software; each restaurant's brand, menu, locations, and rules are configured as data.
- **Reported by Pearl Island:** customer questions about how to cater and serving quantities; staff review orders; Spoonfed details are manually re-entered into Google Calendar, as described by Sober. The wife's process has not yet been observed directly.
- **Observed in Spoonfed:** public ordering flow and menu details inspected October 13, 2026. These observations are not confirmation that values are current or that they reflect Pearl Island's internal rules.
- **Proposed workflow:** the product behavior below is a design target for validation, not a confirmed description of Pearl Island's current operation.
- **Prototype:** behavior that currently runs in the local demo; it does not imply a live transaction or integration.

## End-to-end journey

```text
Restaurant setup → Customer creates order → Rules and estimate are checked
      ↑                                      ↓
Staff manages menu/rules ← Staff reviews ← Customer submits request
                                  ↓                 ↓
                       Change / clarify       Accept or decline
                                  ↓                 ↓
                         Customer responds → Schedule and prepare
```

The same order record should carry customer choices, staff decisions, and preparation details through the process. A connector can automate a handoff, but staff must be able to complete the workflow without it.

## Customer workflow

1. **Enter catering.** The customer opens a direct catering link. A restaurant website can link to this entry point, but is not required. If a restaurant has multiple locations, the customer selects one or enters a delivery address that can route to a location.
2. **Choose how to order.** Offer guided help or manual browsing. Customers can switch modes without losing their work. Guidance should explain suggestions, allow edits or dismissal, and hand uncertain or safety-related questions to a person.
3. **Describe the event.** Collect the fields configured for the restaurant: event type, date/time, guest count, pickup or delivery, address when needed, dietary needs, budget if used, contact details, and notes. Ask for details at the point that best fits the restaurant's confirmed process.
4. **Build the menu.** Browse configured categories and items; inspect descriptions, options, and dietary labels; enter quantities in the item's selling unit. Enforce configured minimums and increments. Show prices only when configured and approved.
5. **Understand quantities.** Show serving coverage and short-order guidance from restaurant-approved portion rules. Suggestions may be rule-based or otherwise configured; show why they were made and let the customer adjust them. Never infer a universal portion rule.
6. **Choose supplies and add-ons.** Present available supplies and add-ons, their units and prices, and enforce configured quantity rules. State whether a selection is required only when the restaurant has confirmed that rule.
7. **Check the request.** Validate required details, lead times, minimums, availability, and other configured policies. Explain each issue and offer approved alternatives or staff contact; do not silently change the customer's order.
8. **Review and submit.** Show event details, menu, quantities, supplies, notes, and an estimate when all needed prices are set. If pricing is incomplete, say the restaurant will confirm it. Submission creates a request; it is not acceptance unless restaurant setup explicitly defines and authorizes that behavior.
9. **Follow up.** The customer can view order status, respond to questions, request edits or cancellation, and approve or decline staff-proposed changes. A customer approval does not bypass any remaining staff approval.

### Customer screen sketch

```text
Event details → Menu → Supplies → Final details → Review
                         ┌──────────────────┬────────────────┐
Menu item                │ Item / description│ Unit price     │
                         │ Dietary labels    │ Quantity [- 2 +]│
                         └──────────────────┴────────────────┘
Optional guidance: explain suggestions; Apply / Edit / Keep browsing
Order summary: selected items · quantity coverage · estimate or pricing note
Next action: Continue / Review / Submit request
```

On small screens, the order summary can collapse while the next action stays easy to reach. Visual styling follows `SOUL.md`; exact layouts and copy remain open for the next wireframe pass.

## Staff workflow

1. **Open the action center.** Show new requests and items needing staff attention, with location, event time, customer, status, and clear reasons for flags.
2. **Review one complete order.** Show the event and contact details, selected items and units, quantity coverage, price status, notes, customer messages, validation results, and change history together.
3. **Choose an action.** Authorized staff can accept, decline with a reason, ask the customer for information, or propose a change. A proposal remains pending until the customer responds; edits and messages must remain attached to the same order.
4. **Coordinate fulfillment.** Once accepted, staff schedule and prepare the order using the product's own operational view. Optional calendar or kitchen-system connectors may copy data, but a successful action must not be shown unless the connector confirms it.
5. **Update progress.** Staff record preparation and completion states so customers and staff see the same order status.

### Staff screen sketch

```text
Action center: [New] [Needs attention] [Upcoming]
Request detail: event + customer | menu + quantities | flags + history
Reason for review: plain explanation and source rule
Actions: [Ask customer] [Propose change] [Decline] [Accept]
After acceptance: fulfillment status · schedule/prep details · optional connector state
```

Suggested lifecycle for discussion: Draft → Submitted → (Needs review / Awaiting response) → (Awaiting customer approval when changed) → Confirmed → In preparation → Completed; Declined and Cancelled are terminal outcomes. Exact names, transitions, automatic acceptance, and who is authorized to act require restaurant configuration and validation.

## Restaurant setup workflow

1. Set up business identity, customer-facing brand, contact/help options, and locations.
2. Configure menu categories, items, descriptions, options, dietary labels, selling units, prices, minimums, and increments.
3. Configure portions and quantity guidance, event fields, supplies/add-ons, fulfillment, lead times, fees, order minimums, and change/cancellation policies.
4. Assign staff roles, locations, review authority, alerts, and optional connectors.
5. Validate setup before customers use it. Missing or conflicting values go to staff for resolution; the system must not guess.

Location settings can override business defaults for item availability/prices, fulfillment, lead times, and staff or calendar assignment.

## Pearl Island Spoonfed observations

Observed October 13, 2026; illustrative until Sober confirms current values and practice:

- The ordering flow offered Standard or Group orders, pickup or delivery, a location/zone, date, and time; orders over 50 guests were directed to contact the restaurant with five business days' notice.
- Menu categories included Sides, Salads, Entrees, and Disposable Catering Supplies. The customer selected a time slot; the flow allowed additional time slots.
- Items showed prices, quantity controls, and dietary icons; some descriptions expanded on demand. The order summary began empty and stayed available separately.
- Supplies appeared as a required section with a no-supplies option and per-person or per-set add-ons, including plates, cutlery, cups, serving utensils, and chafing sets.
- The menu described spooned portions as 6 oz; plantains were listed as two pieces per serving. Prices and these units are unconfirmed and may not match internal preparation units.

Public Spoonfed terms cited in the earlier notes described 48 business hours for traditional orders and 72 for custom items, appetizers, and box lunches. This conflicts with the storefront's five-business-day note for orders over 50 guests. Neither should be implemented as a confirmed policy until Sober resolves the conflict.

## Prototype boundary

The current Pearl Island demo covers event intake, menu selection and quantities, estimates, optional rule-based suggestions, supplies, final details, review/submission, customer order and message screens, staff review/revision, and simulated handoff. Demo state is stored in one browser; there is no backend, account security, shared multi-device state, live messaging, payments, AI service, calendar write, or website connection. Sample orders are invented and menu/rule data is provisional.

For the Sober walkthrough, focus on whether a customer can assemble a request without getting stuck and whether staff can understand and review it. Use `PRD.md` and `SOBER_MEETING_QUESTIONS.md` for requirements and unresolved business decisions; update this workflow only when evidence or a product decision changes the journey.
