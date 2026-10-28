# Catering Platform PRD

**Status:** Demo-day product direction; Pearl Island operating rules and admin workflow still need validation.
**Updated:** October 27, 2026 · **Sober follow-up availability:** October 29 at 11 a.m. Eastern, as recorded in Obsidian.

## Product direction

Build a standalone catering platform that helps customers create complete orders and helps restaurant teams review and fulfill them. The product serves different restaurants through restaurant-owned setup for menu, prices, guidance, policies, and brand. A restaurant website may link to catering, but the products are separate; calendar, POS, email, payments, and other services connect only through optional integrations.

Pearl Island is the first pilot, not the product boundary. Interest in the idea is not a pilot, purchase, or replacement commitment.

## Pearl Island evidence

The following is grounded in the active Pearl Island Obsidian notes. Direct reports, team synthesis, and unresolved details are distinguished below.

- **Customer ordering help:** On October 20, Sober said customers often ask “how do I cater?” Calls are usually a few minutes and currently infrequent because business is slow. He prefers starting with help inside a web app; a phone agent is not warranted at current call volume. He is open to switching from Spoonfed for a more capable, seamless, ideally less expensive option. He reported its monthly renewal at $235.
- **What customers value today:** Sober values straightforward ordering, customer profiles, communication, and easy order updates in Spoonfed; these should carry into any replacement.
- **AI-assisted ordering:** Sober responded positively to a web assistant that drafts a complete order from customer needs, lets the customer revise it, and submits it for staff review, with manual ordering available. This was discussed as a desired direction, not demonstrated as working AI or approved as final scope.
- **Operations and connectedness:** Sober described email notification and order review in Spoonfed, followed by manual transfer of order details into Google Calendar by his wife. The exact fields, frequency, time, changes, and system ownership still need to be observed with her. Sober affirmed that better connections between systems would help.
- **Quantity guidance:** Customers ask whether there will be enough food. The October 6 discussion mentions a 10–15% buffer, but the transcript does not make the speaker attribution fully clear or establish how it applies across menu categories. Treat it as a question for Sober, not a configured rule. Historical Square sales were mentioned as a possible input; their suitability and access have not been assessed.
- **Business priorities:** Sober wants Pearl Island to become more technology-centered and reduce manual work. He also wants to monetize restaurant knowledge asynchronously and does not want to provide live one-to-one coaching; that is a separate opportunity, outside this catering demo.
- **Limits of the feedback:** The October 20 notes say the admin view was introduced but not explored in depth. Call volume, administrative savings, willingness to pay, pilot commitment, and replacement scope are not established outcomes.

**Sources in Obsidian:** `Clients/Active/Pearl Island/Meetings/10-06-2026.md`, `Meetings/10-20-2026.md`, `About/Company Objectives.md`, `About/Updates.md`, `Plan/Next Steps.md`, and `Plan/2026-10-25 - High-level transformation direction.md`. The current product direction to keep the website and catering platform separate, agnostic, and independently usable is a product decision, not a claim attributed to Sober.

## Users

- **Catering customer:** wants help starting an order, choosing food and quantities, revising the order, and tracking the restaurant’s response.
- **Pearl Island owner and team:** review submitted orders, resolve exceptions, communicate with customers, maintain approved ordering knowledge, and coordinate fulfillment.

## Demo-day customer experience

1. **Start with AI-assisted ordering.** From a direct catering link (which Pearl Island’s website may provide), the first option is to describe the event and get a proposed order. A clear secondary action skips to manual ordering. Do not require an account to start; profiles and order history can support returning customers.
2. **Build a draft conversationally.** Ask only for details needed to recommend the order. Use restaurant-approved menu items, prices, portions, availability, and rules. Show an itemized proposal with quantities and short reasons; let customers revise, remove, or replace items before submission.
3. **Keep help in the ordering flow.** Answer common questions such as how to place a catering order and how quantities are estimated. If approved information does not answer the question, connect the customer to Pearl Island staff rather than guessing. Voice assistance is not part of this demo.
4. **Offer manual ordering without losing work.** Customers who know what they want can choose items and quantities directly, with the same approved menu and rule checks as the assisted path.
5. **Check the order before submission.** The system verifies required details and configured ordering rules. If a hard requirement fails, explain the issue and what the customer can do. Do not silently alter an order or invent a substitute, price, portion, or policy.
6. **Submit with clear status.** A submitted order has passed the configured customer-side checks, but Pearl Island has not confirmed it. Show **“Waiting for confirmation from Pearl Island.”** Keep validation result and restaurant confirmation as separate states.
7. **Let the customer follow up.** Preserve the profile, messages, and order-update capabilities Sober values. Show staff questions or proposed changes and let the customer respond or approve changes.

## Demo-day staff experience

Use the following as the proposed admin navigation, based on the current product direction; it is not validated by Sober because the admin view was only briefly introduced:

| Tab | Purpose in the demo |
|---|---|
| **Review** | New orders waiting for Pearl Island confirmation; inspect order details and any rule or completeness issues. |
| **Completed** | Fulfilled orders and their final order record. |
| **In Progress** | Confirmed orders still being prepared or fulfilled. |
| **Messages** | Customer conversations attached to their orders. |
| **Analytics** | Basic counts derived from actual order records; no invented savings, demand, or performance claims. |
| **Settings** | Pearl Island-approved menu, prices, portions, availability, policies, and assistant knowledge. |
| **Account** | The signed-in staff member’s account details. |
| **Team** | Pearl Island staff who use the system; specific roles and permissions need validation. |

In **Review**, staff should see the same order the customer submitted, including event timing, selected items, quantities, price status, notes, and customer contact. Staff can confirm, ask a question, propose a change, or decline with a reason. Proposed changes return to the customer for approval. After confirmation, the order can appear in **In Progress** and provide a calendar-ready handoff from the same record.

For the demo, a Google Calendar preview can show the information that would transfer; it must be labeled as a preview unless a connector actually completes the write. Keep the standalone order workflow usable without Calendar, Spoonfed, Square, or any other provider.

## Pearl Island ownership of AI knowledge

Pearl Island’s authorized team owns and approves the menu, prices, availability, portions, substitutions, lead times, policies, and answers the assistant may use. The AI can assemble and explain a proposal from that approved information; it cannot create menu facts, change the source data, or make Pearl Island’s confirmation decision. The product validates AI-generated items and quantities against the restaurant’s configured rules, and hands unanswered or uncertain questions to staff.

Historical Square data may inform future quantity guidance only after Pearl Island approves access and the team confirms how the data should be interpreted. The 10–15% buffer is not a universal or implemented rule until Sober confirms its meaning and application.

## Demo success and guardrails

- A customer can start with AI assistance or skip to manual ordering, revise the proposed order, and reach a clear submission status without a long intake form.
- Every suggested menu item and business rule comes from Pearl Island-approved setup; the team can identify and correct that source information.
- Customer and staff see the same order; staff can review and confirm it, communicate changes, and produce a calendar-ready handoff preview.
- The demo does not imply that submission means Pearl Island confirmation, or that a simulated message, payment, or calendar write occurred.
- Do not show invented menu facts, prices, policies, savings, or performance metrics. Confirm menu and operating details with Sober before presenting them as facts.
- Do not add a phone agent or live coaching/knowledge product to this catering demo. Explore asynchronous knowledge monetization separately.

## Open questions for Pearl Island

- Which items, prices, units, options, and dietary descriptions are current and approved?
- What portion guidance and buffer should the assistant use, by menu category, and may approved Square data inform it?
- What are the real minimums, lead times, availability constraints, delivery terms, and substitution rules?
- Which details are required before an order is valid, and which exceptional orders may still be submitted for staff review?
- What does Sober’s wife transfer to Google Calendar, how are changes handled, and who owns each step?
- Who on the team confirms orders, maintains approved assistant knowledge, and handles customer messages?
- Which admin tabs and analytics are useful, given that the admin experience was not explored in depth?
- What customer-data access, retention, and AI-provider boundaries will Pearl Island approve?
- Should the product complement or replace Spoonfed, and what Spoonfed/Square access or migration constraints apply?
- What measurable pilot outcome and guardrail would justify continued use? No purchase, pilot, or savings target is agreed yet.

## Product development method

- Start with customer conversations and operational evidence; the product lead owns the problem, rationale, and outcomes, while design and engineering choose how and when to deliver.
- Before building, align on users, problem, hypotheses, scope, non-goals, assumptions, success measures, and guardrails; prioritize by customer and business value.
- Work in sequence: research → plan → design → build → test → release → measure; test customer and staff flows, edge cases, mobile/accessibility, and the demo narrative.
- Record decisions and open questions, measure intended outcomes and harms, and verify AI-assisted work rather than treating it as authoritative.
