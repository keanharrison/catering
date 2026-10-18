# Pearl Island2GO frontend inventory

Snapshot date: 2026-10-16

## Rebuild status

The pre-rebuild frontend source, assets, configuration, product notes, and this inventory are preserved in `docs/archive/frontend-before-rebuild-2026-10-16/`. The active customer Event route now uses the official shadcn Base/Nova Field, Input, Select, Checkbox, Radio Group, and Button source. It presents the original Event questions and requirements while retaining intake validation, draft persistence, and the order update path. Other page routes are blank for the planned one-page-at-a-time rebuild; client-side order data and logic remain in `app/src/data/`, `app/src/engine/`, `app/src/state/`, and the customer helper modules.

This is a reference for rebuilding the presentation layer one selected component at a time. The app's routes and customer/staff workflows are currently implemented in React; there is no server backend. Order state, rules, and sample data run in the browser.

## Routes and screens

| Route | Screen | Current purpose |
| --- | --- | --- |
| `/customer` | Event details | Collect event type, guest count, date, pickup/delivery, dietary needs, and optional budget. |
| `/customer/menu` | Menu | Browse entrees, sides, salads; filter dietary tags; change quantities; view/apply/undo recommendations and inspect the estimate. |
| `/customer/supplies` | Supplies | Choose no supplies or select disposable supplies and serving utensils. |
| `/customer/details` | Final details | Choose pickup/delivery time; enter contact name, organization, custom request, and notes. |
| `/customer/review` | Review | Edit submitted details, inspect order and estimate, submit a simulated request, approve staff revisions, or start over. |
| `/staff` | Staff workspace | Review status, event details, order, flags, messages; ask for clarification, reply, revise, accept, or reject. |
| `/handoff` | Handoff | Read-only summary after staff acceptance; otherwise explains that nothing is ready to hand off. |
| `/gallery` | Component gallery | Internal visual inventory of tabs, status pills, panels, and a guided form. |

Routes are declared in `app/src/App.tsx` and `app/src/routes.ts`. Customer stage paths and completion gates are in `app/src/views/customer/journey.ts` and `app/src/components/StageGate.tsx`.

## Current component gallery

| Component | File | Role |
| --- | --- | --- |
| App shell | `app/src/components/AppShell.tsx` | Pearl Island logo/name header, skip link, presenter toolbar, main landmark. |
| Presenter toolbar | `app/src/components/DemoBar.tsx` | Show/hide demo controls, Customer/Staff/Handoff/Gallery navigation, scenario selection, Reset. |
| Band | `app/src/components/Band.tsx` | Full-width page section with centered max-width content and light/white surfaces. |
| Panel | `app/src/components/Panel.tsx` | Bordered content surface, optional deep tone and corner decoration. |
| Button | `app/src/components/Button.tsx` | Primary and secondary actions, small and medium sizes, disabled state. |
| Eyebrow | `app/src/components/Eyebrow.tsx` | Small uppercase section label; optional turquoise marker. |
| Journey navigation | `app/src/components/JourneyNav.tsx` | Five-step Event → Menu → Supplies → Details → Review navigation and progress. |
| Progress bar | `app/src/components/ProgressBar.tsx` | Animated progress indicator with reduced-motion handling. |
| Step tabs | `app/src/components/StepTabs.tsx` | Selectable row or vertical tabs; used for menu categories and gallery examples. |
| Field / inputs | `app/src/components/ui/field.tsx`, `input.tsx` | Customer form composition, labels, descriptions, errors, and input/select/textarea primitives. The current pass aligns rendered Field typography, spacing, and control dimensions to shadcn's live Field example; native HTML controls retain the demo's existing behavior. |
| Choices | `app/src/components/Choices.tsx` | Fieldset/legend grouping for radio and checkbox choices. |
| Quantity stepper | `app/src/components/QuantityStepper.tsx` | Accessible decrement, numeric input, increment control. |
| Order summary | `app/src/components/OrderSummaryPanel.tsx` | Selected items, category grouping, estimated total, optional coverage and exception flags. |
| Pill / tags | `app/src/components/Pill.tsx`, `Tags.tsx` | Status labels, assumption tags, and preview/simulated integration tags. |
| Assistant preview | `app/src/components/AssistantPanel.tsx` | Disclosure showing an unavailable-in-demo assistant state. |
| Stat line | `app/src/components/StatLine.tsx` | Compact label/value metrics. |
| Error boundary | `app/src/components/ErrorBoundary.tsx` | Error fallback and Start over recovery action. |
| Corner squares | `app/src/components/CornerSquares.tsx` | Decorative corner marks used by panels. |

`app/src/views/Gallery.tsx` is the in-app gallery and renders examples of the shared patterns. The live customer/staff screens compose the shared components listed above.

## Colors, type, and shape

Tokens are declared in `app/src/index.css` with Tailwind v4 `@theme`.

| Token | Value | Use |
| --- | --- | --- |
| `ivory` | `#ffffff` | Main canvas |
| `ivory-deep` | `#eef8fb` | Subtle tinted surface |
| `panel` | `#ffffff` | Panels and controls |
| `charcoal` | `#212529` | Main text |
| `on-action` | `#fdfdfd` | Text on primary action |
| `muted` | `#626260` | Secondary text |
| `line` | `#ddddd8` | Dividers and panel borders |
| `control-line` | `#767b80` | Interactive control border |
| `accent` | `#00a1ca` | Pearl Island turquoise; accents and selection |
| `action` | `#00708d` | Primary action and focus color |
| `action-hover` | `#005b73` | Hover action |
| `action-active` | `#004a5e` | Pressed action |
| `nav-active` | `#206b8d` | Active navigation |
| `marketing-accent` | `#f5a742` | Brand marketing accent; not used for actions |
| `status-confirmed` | `#25683f` | Confirmed state |
| `status-review` | `#8a5a00` | Review state |
| `status-blocked` | `#b3261e` | Blocked/error state |

Typography at the archive point: Inter Tight Variable for the Pearl Island interface; Geist Variable for the selected shadcn Field composition; JetBrains Mono Variable for compact uppercase metadata. Base text is 16px with 1.55 line height. Headings use Inter Tight, normal weight, `-0.03em` tracking and tight line height. Radii: `sm=2px`, `md=4px`, `lg=6px`; Field controls use the shadcn reference's 10px radius locally. Reduced motion shortens the progress transition.

Customer Field controls at the archive point used neutral grayscale styling and Geist typography, 20px field-group spacing, 32px input height, and 10px control radius. The active rebuild now uses the official shadcn Base/Nova component source and theme imported from the shadcn CLI.

## Data shapes

Types are in `app/src/data/types.ts`.

- Menu source records: `MenuItem` includes ID/name/category, service styles, unit, servings per unit, price in cents, minimum units, dietary tags, included side IDs, lead-time class, optional description/serving note, and provenance (`illustrative` or `approved`, with assumption/source metadata).
- Event and operating rules: `EventType`, `PortionRule`, `LeadTimeRule`, `ChangePolicy`, `ExceptionThresholds`, and `RecommendationDefaults`; these include provenance and currently remain illustrative unless marked approved.
- Customer intent: `OrderIntent` stores contact/organization, event type, nullable guest count, local event date/time, pickup or delivery, dietary tags, nullable budget in cents, notes, and custom request.
- Order: `Order` includes ID/status, intent, `OrderLine[]` (`itemId`, `units`), nullable supplies choice, exception flags, revision state, messages, and status history.
- Lifecycle enums: order status (`draft`, `submitted`, `needs_review`, `awaiting_customer_approval`, `confirmed`, `rejected`); message author (`customer`, `staff`, `system`); revision (`none`, `pending`, `approved`); actor (`customer`, `staff`).
- Scenarios: repeatable Routine event and Unusual request data with fixed demo clock and expected exception flags.

Menu data, rules, and scenarios live in `app/src/data/`; calculations and recommendation/exception logic live in `app/src/engine/`. The order state machine is `app/src/state/orderMachine.ts`; the Zustand store is `app/src/state/store.ts`.

## Existing behavior and persistence

- The customer journey is gated in order; incomplete earlier stages redirect to the first incomplete stage.
- Event form values are converted between string-form state and typed `OrderIntent`, validated, and preserved in `sessionStorage` while navigating between customer stages (`pi2go-customer-form-draft`).
- The active demo scenario, order, clock, messages, revisions, and history are persisted in browser `localStorage` under `pi2go-demo`.
- Menu quantities and supplies choices update the shared order draft; estimates, coverage, recommendation output, and exception flags derive from order state and catalog/rules.
- Submit, clarification, reply, revise, approve, accept, and reject are simulated state-machine actions. They do not send data externally or create a real order/payment.
- Menu values, rules, dietary tags, and sample customers/events are illustrative and unconfirmed. Dietary tags are not allergy/nutrition assurances.

## Rebuild boundary

The actual “backend” is client-side logic: `data/`, `engine/`, `state/`, route definitions, and the pure customer helpers under `views/customer/` are reusable. Some form/controller behavior is embedded in route view components. The archive preserves the previous custom Field implementation for reference; the active Event rebuild replaces it with official shadcn source and keeps the existing intake validation and draft logic.

Primary brand/product references: `PRODUCT.md`, `docs/branding/pearl-island/IMPLEMENTATION.md`, and `docs/branding/pearl-island/Pearl-Island-Catering-Branding-and-Workflow-Reference.md`.
