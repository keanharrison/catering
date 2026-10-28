# Catering Platform PRD

**Status:** Product direction and Pearl Island pilot requirements; open business rules remain unconfirmed.
**Updated:** October 27, 2026

## Product direction

Build a standalone catering platform that helps customers place complete, accurate catering orders and helps restaurant teams review and run them. The product must work without a restaurant website, POS, calendar, or other vendor; integrations are optional connectors. Restaurant differences—brand, menu, prices, locations, fulfillment, and rules—belong in setup rather than restaurant-specific code.

Pearl Island is the first pilot and validation partner, not the product boundary. Its website and the catering platform are separate products. A website may link to the platform, but neither product depends on the other or shares its code, login, or data by default.

## Customer and business problem

Customers need help starting catering orders and judging quantities. Restaurant owners and staff answer repeated questions, review incomplete or infeasible requests, and may re-enter order information into operational tools. The product should make self-service practical while keeping a person reachable and the restaurant in control of exceptions.

Pearl Island feedback recorded in project notes: customers commonly ask how to cater and ask repeated serving-size questions; Sober described roughly 5–6 help or substitution calls per week at 5–7 minutes each, during a slow period; he said his wife re-enters Spoonfed orders into Google Calendar. These are reported observations, not independently measured outcomes. Her workflow has not yet been observed directly, and current Spoonfed capabilities and costs need verification.

## Users

- **Customer / event organizer:** builds an order, gets quantity help, checks status, and communicates with the restaurant.
- **Restaurant staff / location manager:** reviews orders, handles exceptions, coordinates fulfillment, and communicates changes.
- **Owner / admin:** oversees locations, controls setup and approval rules, and reviews operations.
- **Setup operator:** configures a restaurant and locations without changing product code.

## Product requirements

### Customer ordering

- Support guided and manual ordering; customers can switch modes without losing entered information.
- Collect configured event, contact, fulfillment, dietary, and timing details.
- Browse a restaurant-configured menu with descriptions, options, dietary labels, units, minimums, increments, and prices where approved.
- Help customers estimate quantities and show coverage or short-order guidance with clear explanations.
- Check configured rules before submission and explain allowed alternatives or how to reach a person.
- Show a complete review, submit an order, and access drafts, active and past orders, messages, edit/cancellation requests, and proposed changes.

### Restaurant operations

- Provide an action center, order list, and order detail with context, flags, history, and the next available actions.
- Let authorized staff accept, decline with a reason, ask a question, or propose a change; customer approval is required for staff-proposed changes before acceptance.
- Support location-aware scheduling and preparation views. Calendar, email, payments, POS, and other connections are optional integrations; manual workflows must remain usable without them.
- Keep a consistent order record between customer and staff views so details are not re-entered between product screens.

### Restaurant setup

- Configure business and location details, branding, menu and prices, item options, dietary labels, quantity and portion rules, fulfillment, lead times, fees, policies, roles, alerts, and integrations.
- Support location overrides for availability, prices, fulfillment, lead times, and staff/calendar assignment.
- Validate setup when loaded; missing required values must be surfaced to staff and never guessed for customers.

## Trust, safety, and product boundaries

- Automation may suggest and explain; restaurant staff retain control over exceptions and acceptance rules.
- Dietary labels are not allergy, nutrition, or cross-contamination guarantees. The product must direct safety questions to the restaurant unless verified data and process support an answer.
- Do not show an estimate as a final quote, imply acceptance on submission, or claim an integration action occurred unless it actually succeeded.
- Do not invent menu facts, prices, portions, fees, policies, testimonials, savings, or business outcomes.
- A restaurant can use the catering product independently of its website and other software.

## Current Pearl Island prototype

The existing React, TypeScript, Vite, and React Router app is a browser-based demo, not the production platform. It currently demonstrates customer event intake, menu selection, quantities and estimates, optional rule-based suggestions, supplies, final details, review and simulated submission; customer order and message views; and staff review, revision, messaging, settings, and a simulated handoff. The exact current routes are wired in `app/src/App.tsx` and `app/src/routes.ts`.

State is local to one browser and persisted for the demo. There is no backend, account security, shared multi-device state, live messaging, payment, AI service, calendar write, website connection, or other live integration. Assistant controls are display-only where present; rule-based menu suggestions are not an AI service. Do not describe simulated actions as real transactions or integrations.

The Pearl Island menu and operating data in `app/src/data/` are illustrative. Menu descriptions were cross-referenced against public menus, and some values were observed in Spoonfed, but Pearl Island has not confirmed current availability, prices, dietary labels, units, portions, minimums, combinations, lead times, or policies. Sample customers and events are invented for repeatable walkthroughs.

## Demo objective

Refine the existing prototype into a clear, credible Sober walkthrough: a customer can assemble a catering request without getting stuck, and staff can understand and review the same request. Keep optional help customer-led, demonstrate staff control, and make simulated behavior clear at the point it matters. Use the walkthrough to confirm menu data, quantity guidance, operating rules, exception handling, and the actual staff handoff before expanding scope.

## Evidence and open questions

Product flow and Spoonfed observations are consolidated in `WORKFLOW.md`; unresolved questions are maintained in `SOBER_MEETING_QUESTIONS.md` and `docs/branding/pearl-island/`. Confirm with Pearl Island:

- Current menu, prices, item availability, options, dietary wording, portions, and serving units.
- Item and order minimums, increments, included sides, supply combinations, and supply quantities.
- Lead times and cutoffs; current sources conflict on 48/72 business hours versus five business days for large orders.
- Delivery availability, zones, fees, time windows, order minimums, taxes, and payment process.
- Change and cancellation rules, when submission becomes accepted, and which cases require personal review.
- When event timing is collected, staff roles and actual order/calendar handoff, and questions customers still call about.
- Whether customers prefer self-selection, guided ordering, or both, and what assistant guidance Sober approves.

Do not treat reported interest as a pilot commitment or purchase decision. Measure operational outcomes only after a live pilot with an agreed baseline.
