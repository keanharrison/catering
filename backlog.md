# Backlog

**Updated:** October 28, 2026 · **Sources:** `PRD.md`, `PRODUCT.md`, `WORKFLOW.md`, `SOBER_MEETING_QUESTIONS.md`, read-only inspection of `app/`, and product decisions made in conversation.

## How to read this

- **Priority:** *Active* = client-facing work being done now, in order. *Queued* = admin-facing and setup work, not started. *Deferred* = parked on purpose. *Hygiene* = repository upkeep, to be done later.
- **Status:** `Done` (evidence cited) · `Partial` (what exists, what is missing) · `Not started` · `Needs definition` (scope not decided) · `Needs validation` (depends on an answer from Pearl Island or the product owner).
- **Basis:** `PRD` (stated in `PRD.md`) · `user direction` (asked for in conversation) · `needs validation` (a proposal not yet confirmed by anyone).
- Nothing is marked `Done` without a file that shows it. The code was read, not run; "evidence" means the behavior is present in source, and where tests exist they are named.

## Where the product stands

The prototype runs entirely in one browser: orders, messages and approvals are local demo state; there is no backend, payment, notification, calendar write or AI service (`PRODUCT.md`). The menu, prices and rules are illustrative (`app/src/data/types.ts` `DataStatus` is `'illustrative' | 'approved'`). The "assistant" on the Chat page answers a fixed set of questions about the customer's own stored requests; it is not a language model (`app/src/views/customer/dashboardSummary.ts`).

---

## Active priority: customer-facing experience

Order below is the working order.

### C1. Start with AI-assisted ordering or skip to manual ordering
- **Description:** From the catering entry point, the first choice is "describe your event and get a proposed order," with a clear secondary action to order manually. Switching between the two keeps the customer's work. No account is required to start.
- **Acceptance criteria:**
  - Opening New request shows both options before the event form, with the assisted option first and the manual option clearly available.
  - Choosing manual leads to the existing event, menu, supplies, details and review steps.
  - Switching from one mode to the other does not clear entered details or selected items.
  - Starting does not require sign-in.
- **Status:** Not started. Evidence of the gap: New request opens directly on the event form (`EventPage.tsx`); no assisted/manual choice exists in `app/src`.
- **Basis:** PRD (demo-day customer experience, steps 1 and 4); user direction ("we need to build the AI vs manual option for the new request page").

### C2. Conversational draft order with an itemized, revisable proposal
- **Description:** The assistant asks only for the details needed, then proposes an itemized order with quantities and a short reason per item, using only restaurant-approved menu items, prices, portions and rules. The customer can revise, remove or replace items before submitting.
- **Acceptance criteria:**
  - The conversation asks for event type, date, guest count, fulfillment and dietary needs only as needed, not a long form.
  - The proposal lists each item with quantity, price status and a one-line reason.
  - Customer can remove, replace or change quantities, and the same rule checks as manual ordering apply.
  - If the proposal comes from rules rather than an AI service, the interface does not claim AI.
  - The assistant never invents an item, price, portion or policy.
- **Status:** Partial. A rule-based "Help me choose" exists on the Menu step (Suggest, Apply, Undo; `MenuPageShell.tsx`, `engine/recommend.ts`) and the staff "AI & agents" page states it "does not call an AI service" (`WorkspacePage.tsx`). The Chat page does not draft orders.
- **Basis:** PRD (step 2); `needs validation` for whether a real AI provider is used in the demo (open question on AI-provider boundaries).

### C3. Help inside the ordering flow, with a handoff to staff
- **Description:** The assistant answers common questions ("how do I place a catering order," "how are quantities estimated") from approved information, and routes anything it cannot answer to Pearl Island staff instead of guessing.
- **Acceptance criteria:**
  - A customer can ask how to place a catering order and how quantities are estimated and get an answer drawn from configured text.
  - A question with no approved answer shows a clear way to contact staff (message or contact option) and does not produce a guessed answer.
  - Answers about the customer's own requests stay consistent with the Current orders and Messages pages.
- **Status:** Partial. Chat answers questions about drafts, status, next event and message threads, and falls back to a link to Messages (`answerQuestion` in `dashboardSummary.ts`; covered by `chat.test.tsx`). No ordering-how-to or quantity-explanation content exists, and unanswered questions are not delivered to staff.
- **Basis:** PRD (step 3); voice assistance is explicitly out of scope for the demo.

### C4. Manual ordering with approved menu and rule checks
- **Description:** A customer who knows what they want chooses items and quantities directly.
- **Acceptance criteria:** Event details, menu with quantities, supplies, final details and review are completable end to end with estimate and rule flags.
- **Status:** Done (prototype). Evidence: routes and pages for the five steps (`EventPage.tsx`, `MenuPageShell.tsx`, `SuppliesPage.tsx`, `DetailsPage.tsx`, `ReviewPage.tsx`), rule engine (`app/src/engine/`), journey and intake tests (`journey.e2e.test.tsx`, `intake.test.ts`). Menu data is illustrative until approved.
- **Basis:** PRD (step 4).

### C5. Pre-submission checks that explain and never silently change an order
- **Description:** Required details and configured rules are checked before submission. Hard failures explain the problem and what the customer can do; soft issues go to staff review.
- **Acceptance criteria:**
  - Missing or invalid required fields block Continue with a message naming the field and the fix.
  - Each rule issue names the rule and the customer's options.
  - The system never changes an item, quantity, price or policy on the customer's behalf.
  - Which failures block and which go to staff review is defined by the restaurant.
- **Status:** Partial. Field validation with messages is present (`intake.ts`, `validate.ts`) and the engine raises exception flags for staff (`engine/exceptions.ts`). The split between "hard requirement" and "flag for staff" is a placeholder.
- **Basis:** PRD (step 5); `needs validation` for real minimums, lead times and which orders may still be submitted for review.

### C6. Submission status that separates validation from confirmation
- **Description:** After submission the customer sees that the order passed customer-side checks but is not confirmed: "Waiting for confirmation from Pearl Island." Validation result and restaurant confirmation are separate states.
- **Acceptance criteria:**
  - After submitting, the status line reads "Waiting for confirmation from Pearl Island" (restaurant name from setup, see S1).
  - The page does not use the words "confirmed" or "accepted" until staff confirm.
  - No copy implies that a payment, message or calendar write occurred.
- **Status:** Partial. Submitted requests show "The Pearl Island team will review your request" (`ReviewPage.tsx` lines near 163); the PRD wording and the separation of validation from confirmation are not present.
- **Basis:** PRD (step 6 and guardrails).

### C7. Follow-up: messages, order updates and approving changes
- **Description:** The customer keeps a profile, sees staff questions and proposed changes, replies, and approves or declines changes.
- **Acceptance criteria:** Messages thread per order; a pending proposal is clearly flagged; approving a change updates the same order record staff see.
- **Status:** Done (prototype, local only). Evidence: `CustomerMessagesPage.tsx`, `CurrentOrdersPage.tsx` (review and approve proposal), Account settings profile (`SettingsPage.tsx`), notification bell for the team's decisions (`lib/notifications.ts`, `NotificationsMenu.tsx`). Notifications are derived in the browser; nothing is delivered by email.
- **Basis:** PRD (step 7).

### C8. Returning-customer profile and order history
- **Description:** A profile and order history support returning customers without forcing an account to start.
- **Acceptance criteria:** A returning customer's saved details prefill contact fields; past orders are listed; starting an order never requires sign-in.
- **Status:** Partial. Saved profile prefills blank contact fields and Past orders exists (`state/customerProfile.ts`, `PastOrdersPage.tsx`); both live only in this browser, and there is no identity to recognize a returning customer on another device.
- **Basis:** PRD (step 1: "profiles and order history can support returning customers"); `needs validation` for how identity works.

### C9. Chat attachments
- **Description:** The chat field has a + button to attach files. The microphone was removed by user direction, because the PRD leaves voice assistance out of the demo.
- **Acceptance criteria:**
  - A decision is recorded on what the assistant does with an attached file; until then the interface states that attachments are not read.
  - The chat field has no microphone or voice control.
- **Status:** Partial. + lists the chosen files and the reply says they are not read (`ChatComposer.tsx`; `chat.test.tsx`). The microphone was removed on October 28, 2026.
- **Basis:** user direction; PRD (voice assistance is not part of the demo).

### C10. Customer-facing brand and food image (depends on S1)
- **Description:** The customer experience shows the restaurant's brand and the food image the owner selected.
- **Acceptance criteria:** See S1; plus the customer pages read brand name, logo and image from setup rather than from hard-coded strings.
- **Status:** Not started. Evidence: restaurant name is hard-coded in copy (for example "Pearl Island team" in `ReviewPage.tsx`, `demoAccount.tsx`); the product name is the placeholder "X"; the Pearl Island logo file is no longer used on customer pages.
- **Basis:** user direction.

### C11. Apply the ElevenLabs-based visual system to the remaining screens
- **Description:** One screen at a time, bring the rest of the product to the shared look the user approved.
- **Acceptance criteria:** Each screen uses the shared type scale, 36px black primary buttons, 12px controls, floating-tile empty states and the icon registry; reviewed at desktop and 390px width with no horizontal overflow.
- **Status:** Partial. Done and measured: app shell, refined sidebar, top bar, Chat, Plan your catering, Current and Past orders and Messages empty states, shared controls (`index.css`, `components/ui/*`, `destinationIcons.ts`). Not yet reviewed against the new styles: Supplies, Details, Review, staff pages, Handoff.
- **Basis:** user direction.

### C12. Mobile, accessibility and edge-case pass for customer flows
- **Description:** Test the customer path on a phone width, with keyboard only, and with edge cases.
- **Acceptance criteria:** Every step works at 390px wide; all controls reachable and operable by keyboard with visible focus; contrast of text and status colors at least 4.5:1; error and empty states reviewed.
- **Status:** Partial. Tests exist for structure and keyboard behavior (`a11y.test.tsx`, `regression.test.tsx`); status colors were contrast-checked when added (`docs/color-plan.md`). No full pass has been recorded since the visual changes.
- **Basis:** PRD (development method: test mobile and accessibility).

### C13. Demo narrative and honesty labels
- **Description:** A rehearsed demo path in which nothing implies a live integration, payment or confirmation.
- **Acceptance criteria:** A written walkthrough from start to staff confirmation; every simulated action is labeled (for example local-only messages and the Chat Preview label); no screen shows a menu fact, price, policy, saving or metric as verified when it is illustrative.
- **Status:** Partial. Local-only labeling exists (for example "Saved locally" notices; Chat "Preview" label; Integrations page states connections are not configured). No written walkthrough exists.
- **Basis:** PRD (demo success and guardrails).

---

## Queued: staff and admin experience

Not started unless noted. The admin view was only briefly introduced to Sober, so its structure is a proposal.

### A1. Reconcile admin navigation with the proposed tabs
- **Description:** The PRD proposes Review, Completed, In Progress, Messages, Analytics, Settings, Account, Team. The app has Requests, Handoff, Messages, Menu and rules, Integrations, AI & agents, Settings.
- **Acceptance criteria:** A decision is recorded on the final tab set; the sidebar and routes match it; each tab has a defined purpose.
- **Status:** Needs definition. Evidence: staff navigation in `AppSidebar.tsx` and routes in `routes.ts`.
- **Basis:** PRD (staff experience table); `needs validation`.

### A2. Review: inspect and act on submitted orders
- **Description:** Staff see new orders waiting for confirmation with event timing, items, quantities, price status, notes, contact and any flags, and can confirm, ask a question, propose a change, or decline with a reason.
- **Acceptance criteria:** The staff view shows the same order record the customer submitted; each of the four actions works; a proposed change returns to the customer for approval.
- **Status:** Done (prototype). Evidence: `StaffPage.tsx`, `RequestDetails.tsx`, `AskCustomerPanel.tsx`, `EditRequestPanel.tsx`, `DeclineRequestPanel.tsx`; state machine in `state/orderMachine.ts` with `orderMachine.test.ts`. Requests lives in one list with filters, not a separate Review tab (see A1).
- **Basis:** PRD.

### A3. In Progress and Completed order states
- **Description:** After confirmation, orders move through preparation to completion and appear in the matching tabs.
- **Acceptance criteria:** Staff can mark a confirmed order in progress and then completed; customers see the same status; Completed shows the final order record.
- **Status:** Not started. Evidence: `OrderStatus` has only draft, submitted, needs_review, awaiting_customer_approval, confirmed, rejected (`data/types.ts`).
- **Basis:** PRD (tabs); `WORKFLOW.md` suggested lifecycle is a proposal.

### A4. Calendar-ready handoff preview
- **Description:** Confirmed orders produce a handoff that shows what would transfer to a calendar, labeled as a preview unless a connector actually writes it.
- **Acceptance criteria:** A confirmed order shows event time, guest count, fulfillment, location and notes in a calendar-event layout labeled "Preview"; no copy claims it was written to Google Calendar unless a connector did.
- **Status:** Partial. A printable staff handoff summary exists (`HandoffPage.tsx`); it has no calendar-event preview.
- **Basis:** PRD; `needs validation` for what Sober's wife actually copies into Google Calendar.

### A5. Messages
- **Description:** Customer conversations attached to orders.
- **Acceptance criteria:** Staff can read and reply per order; a reply appears in the customer's thread.
- **Status:** Done (prototype). Evidence: `MessagesPage.tsx`.
- **Basis:** PRD.

### A6. Analytics from real order records
- **Description:** Basic counts derived only from actual order records.
- **Acceptance criteria:**
  - Shows counts such as orders by status and by event type over a selectable period.
  - Every number can be traced to order records; an empty state shows when there are none.
  - No revenue, savings, demand forecasts or performance claims.
- **Status:** Not started. Evidence: no analytics code in `app/src`.
- **Basis:** PRD (Analytics tab); user direction (basic analytics grounded in real order records).

### A7. Account and Team
- **Description:** The signed-in staff member's account details, and the list of staff who use the system.
- **Acceptance criteria:** Account shows and edits the staff member's own details; Team lists staff; roles and permissions as defined after validation.
- **Status:** Not started; roles and permissions need definition. Evidence: no team or role code in `app/src`.
- **Basis:** PRD; `needs validation` for roles and permissions.

### A8. Assistant knowledge review
- **Description:** Staff see questions the assistant could not answer and add approved answers; the team owns what the assistant may say.
- **Acceptance criteria:** Unanswered questions appear in a list for staff; an approved answer is used on the next matching question; the assistant cannot change menu data or make the confirmation decision.
- **Status:** Not started.
- **Basis:** PRD (Pearl Island ownership of AI knowledge); `needs validation` for who maintains it.

---

## Queued: restaurant-owned setup

### S1. Owner setup for customizing the customer-facing experience
- **Description:** The restaurant owner customizes what customers see, including the restaurant's brand and a selected food image, without engineering help.
- **Acceptance criteria:**
  - The owner can set the restaurant name and brand elements and choose a food image.
  - After saving, the customer pages show the owner's name, brand and image.
  - The product itself stays restaurant-agnostic: nothing Pearl Island-specific is hard-coded once this ships.
  - Exact controls, where the image appears, image requirements, and brand fields beyond name are **needs definition** and must be specified with the user before building.
- **Status:** Needs definition. Evidence: no setup or branding configuration exists; the Pearl Island logo and name are hard-coded in places.
- **Basis:** user direction; PRD (restaurant-owned setup for brand).

### S2. Owner-editable approved menu, prices, portions, availability and policies
- **Description:** The authorized team maintains the information the assistant and ordering rules use.
- **Acceptance criteria:** Staff can add, edit and retire items, prices, units, portions, availability, lead times and policies; changes apply to new orders; each value shows whether it is approved or illustrative.
- **Status:** Not started. Evidence: the Settings page is a read-only reference and says editing is intentionally not offered until rules are confirmed (`SettingsPage.tsx`); provenance field exists in the data model (`data/types.ts`).
- **Basis:** PRD (settings tab and ownership); `needs validation` for which fields.

### S3. Setup validation
- **Description:** Missing or conflicting setup values are flagged to staff before customers use the product.
- **Acceptance criteria:** A setup check lists missing or conflicting values; the ordering flow never fills a gap with a guess.
- **Status:** Not started.
- **Basis:** `needs validation` (proposed in `WORKFLOW.md`, not in the PRD).

### S4. Locations
- **Description:** Support for multiple locations with their own availability, fulfillment and lead times.
- **Acceptance criteria:** To be defined if Pearl Island needs it.
- **Status:** Needs validation. Evidence: no location concept in `app/src`.
- **Basis:** needs validation (appears only in `WORKFLOW.md`).

---

## Product guardrails (apply to every item)

- No invented menu facts, prices, policies, savings or metrics; confirm details with Sober before presenting them as facts. *Status: partial; data is flagged illustrative in the model but not everywhere in copy.* (PRD)
- Submission is not confirmation; validation and confirmation stay separate. *See C6.* (PRD)
- A simulated message, payment or calendar write is never presented as real. *Partial; see C13.* (PRD)
- AI proposes from approved data only, cannot change source data or confirm orders, and hands off uncertain questions. *See C2, C3.* (PRD)
- No phone agent and no live coaching or knowledge product in this demo. (PRD)
- Standalone first: the full order workflow works without Google Calendar, Spoonfed, Square or any other provider; connectors are optional. (PRD, user direction)

## Optional integrations (not started; never a dependency)

- **Google Calendar:** only after the handoff preview (A4) is validated. *Needs validation.* (PRD)
- **Spoonfed and Square:** complement-or-replace decision and data access are unresolved; historical Square sales may inform quantity guidance only after Pearl Island approves access. *Needs validation.* (PRD)
- **Restaurant website link:** the website may link to the catering entry point; no integration required. (PRD)

## Persistence and sharing (needs validation)

- **Description:** Today customer and staff views share state only inside one browser. A pilot would need orders shared across devices and people.
- **Acceptance criteria:** Defined with the user, including data access, retention and AI-provider boundaries, before any work.
- **Status:** Needs validation. Evidence: state is stored in the browser (`state/store.ts`).
- **Basis:** needs validation (the PRD asks for customer and staff to "see the same order" in the demo and lists data boundaries as an open question).

## Unresolved questions

From `PRD.md` and `SOBER_MEETING_QUESTIONS.md`. Each answer changes data or rules, not the journey.

1. Which menu items, prices, units, options and dietary descriptions are current and approved? Which items are really offered for catering?
2. What portion guidance and buffer apply by category, and may approved Square data inform it? (The 10–15% buffer is not a configured rule.)
3. What are the real minimums, lead times, availability, delivery terms and substitution rules? (Over 50 guests with five business days versus 48/72 hours.)
4. Which details make an order valid, and which exceptional orders may still be submitted for review?
5. What does Sober's wife transfer to Google Calendar, how are changes handled, and who owns each step?
6. Who confirms orders, maintains assistant knowledge and handles customer messages?
7. Which admin tabs and analytics are useful, given the admin view was not explored?
8. What customer-data access, retention and AI-provider boundaries will Pearl Island approve?
9. Should the product complement or replace Spoonfed, and what access or migration limits apply?
10. What measurable pilot outcome would justify continued use? No purchase, pilot or savings target is agreed.
11. When do customers give pickup or delivery time, and which customer questions still become phone calls?
12. Would customers prefer a customer-led menu with optional help, or guidance from the start? How should gluten-free and vegan needs be described, and who confirms them?
13. **Product owner:** exact customization controls for S1; the final admin tab set (A1); what the assistant should do with attached files (C9).

## Deferred

### D1. Colored icons inside pages
- **Description:** On October 28, 2026 the owner decided that colored icons belong inside pages and not in the sidebar. Each destination has one tile color from a shared list: Chat violet, Current orders indigo, Drafts teal, Messages sky, Past orders slate. Red, amber, green and blue stay reserved for status.
- **Acceptance criteria:**
  - The Chat page's account summaries and the empty states on Current orders, Past orders and Messages show a solid colored tile with a white icon.
  - The sidebar, top bar, composer, buttons, step line and form controls stay neutral.
  - Each tile color keeps a white glyph at 4.5:1 contrast or better.
  - Whether to color other in-page icons (for example the staff pages, order detail rows) is decided before any are added.
- **Status:** Done for the places above. Evidence: `destinationTones` in `components/destinationIcons.ts`, tile styles in `index.css`, applied in `ChatPage.tsx`, `CurrentOrdersPage.tsx`, `PastOrdersPage.tsx`, `CustomerMessagesPage.tsx`, `MessagesPage.tsx`; `tiles.test.tsx`. Staff summary tiles stay neutral because they show status.
- **Basis:** user direction.

### D2. Brand accent color
- **Description:** Whether a restaurant-specific accent color is used in the interface.
- **Acceptance criteria:** Decided together with S1; the earlier assistant-orb idea was dropped as not catering-related (`docs/color-plan.md`).
- **Status:** Deferred. Semantic status colors are already applied (`docs/color-plan.md`).
- **Basis:** user direction.

---

## Explicitly out of scope

Not added because the PRD and the product owner have not supported them: CRM pipelines, revenue or savings metrics, floor plans, staffing or scheduling tools, bulk editing, payments, a phone agent, live coaching or a knowledge-monetization product, and copying features from other products. ElevenLabs is used as a visual reference only; Spoonfed features appear here only where Sober said he values them (profiles, communication, easy order updates).

---

## Repository hygiene (future; do not start yet)

### H1. Lowercase the Markdown file names
- **Description:** Rename the project's Markdown files to lowercase, for example `PRD.md` to `prd.md`. Only Markdown files are in scope; code files keep their current names.
- **Acceptance criteria:**
  - The root files `PRD.md`, `PRODUCT.md`, `README.md`, `SOBER_MEETING_QUESTIONS.md`, `SOUL.md` and `WORKFLOW.md` become lowercase, along with the other first-party Markdown files (`app/README.md` and the `.md` files under `docs/` that have capitals).
  - A check for names that collide when case is ignored is run first, and any collision is resolved or reported.
  - Every reference to a renamed file (links in other Markdown files, the sources list in the PRD, comments in code, config) is updated.
  - Renames keep git history and work on a case-insensitive file system (macOS), which needs a two-step move.
  - Files whose names a tool requires, such as the `SKILL.md` files under `.agents/` and `.claude/`, stay as they are unless the owner confirms the tool allows lowercase.
  - Typecheck and tests still pass after the change.
- **Status:** Not started. Read-only check at the time of writing: no names collide when case is ignored; about 20 tracked Markdown files have capitals outside the archived and generated folders. Re-run the check when the work starts.
- **Basis:** user direction.

### H2. Stop tracking generated files
- **Description:** Browser screenshots and logs (`.playwright-mcp/`, 293 tracked files, added in commit `bd548d4`) and critique notes (`.impeccable/`, 3 tracked files) are in the repository even though a root `.gitignore` now excludes them for new files.
- **Acceptance criteria:** The owner decides whether to untrack them; if so, they are removed from the index and no longer appear in `git ls-files`, with no loss of anything the owner wants kept.
- **Status:** Needs validation.
- **Basis:** needs validation.

### H3. Refresh or archive stale documentation
- **Description:** Some documents describe things that no longer exist, for example `docs/linear-themes.md` describes the removed theme picker and dark mode; `docs/frontend-inventory.md` has not been checked against the current app.
- **Acceptance criteria:** Each doc is updated to match the app or moved to `docs/archive/`; no document describes removed features as current.
- **Status:** Not started.
- **Basis:** needs validation.
