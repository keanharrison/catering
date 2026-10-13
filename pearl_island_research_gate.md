# Pearl Island2GO Prototype Research Brief

Bottom line: build an assumption-based prototype now, clearly label the assumptions, and use the Sober call to validate or replace the unknowns.

## Mission

Create a rough Pearl Island2GO catering prototype that shows one customer intake flow, one staff review workspace, and one simulated kitchen/Spoonfed-style handoff.

The prototype is not meant to prove we know Pearl Island's workflow yet. It is meant to give Sober something concrete to react to so he can quickly say what is right, wrong, missing, or worth building.

## What We Know Concretely

Pearl Island Catering is led by Sober Pierre, described by Pearl Island as the founding member and president of Pearl Island Foods. Source: https://pearlislandcatering.com/ourstory

Pearl Island offers catering for pickup, drop-off, full-service catering, buffets, boxed lunches, bar service, corporate events, weddings, festivals, concessions, and special events. Source: https://www.cvillechamber.com/2024/03/04/chamber-spotlight-pearl-island-catering/

Pearl Island's catering page describes buffet, family-style, and plated events, with a la carte and bulk pricing depending on event size and budget. Source: https://pearlislandcatering.com/catering

Pearl Island already links to Spoonfed as its online catering ordering path. Public Spoonfed terms mention accounts, delivery zones, minimum order value, delivery/pickup date and time, order notes, delivery notes, billing address, card or on-account payment, email confirmation, taxes, and fees. Source: https://api.getspoonfed.com/1438/pearl-island/terms/

Public Spoonfed terms say online Traditional Caribbean Menu orders require 48 business hours lead time, and custom items, appetizers, and box lunches require 72 business hours. Changes may be refused within 24 hours of order time; perceived deficiencies must be reported within 2 business days; a 10% cancellation fee may apply after the ordering window closes. Source: https://api.getspoonfed.com/1438/pearl-island/terms/

Public sample menus include items such as slow roasted pork, Sous Poulet, Creole Beans, curry chicken, jerk chicken, curry tofu, jerk tofu, rice with pigeon peas, kale salad, fried plantains, pikliz, boxed sandwiches/wraps, and salad box options. Sources: https://pearlislandcatering.com/s/2022-Pearl-Island-Menu.pdf and https://rsvp-prod.s3.amazonaws.com/rsvp/pearlislandcatering/spree/Pearl-Island-Catering-Menu-Brochure.pdf

Uber Eats gives limited Pearl Island 2GO context but is not enough for catering logic. Useful anchors: family meals appear as platters of 4; orders greater than 12 servings / 3 family meals are routed to catering; fixed family meals include protein, rice with pigeon peas, kale salad, fried plantains, pikliz, and aioli. Source: https://www.ubereats.com/store/pearl-island-cafe-%26-catering/dk5mLnjYWnWQ3vKkwZWfPQ

Spoonfed supports dynamic menus, pickup vs delivery menus, item rules, minimum quantities, custom checkout fields, attachments, delivery details, order statuses, quotes, approvals, on-account/payment-card flows, PO/cost-center fields, invoicing, order calendar, production notes, and delivery assignment sheets. Sources: https://www.getspoonfed.com/solutions/online-ordering and https://www.getspoonfed.com/faqs

## Working Assumptions For The Prototype

Assume the core pain is turning customer catering requests into accurate estimates and staff-ready handoffs without repeated manual back-and-forth.

Assume the first useful flow is:

Customer intake -> estimate/review-ready submission -> staff review -> edit/request clarification/approve -> simulated kitchen or Spoonfed-style handoff.

Assume there are two scenarios:

- Routine order: customer submits a standard catering order that mostly fits known rules.
- Difficult order: customer has timing, guest count, dietary, delivery, or custom-menu issues that require staff review.

Assume all menu/pricing/portion rules are illustrative until Sober confirms them.

Assume this prototype does not replace Spoonfed; it explores whether a better intake/review layer or staff workspace is useful around the existing process.

## Unknowns To Validate With Sober

- Current menu, prices, serving units, and portion rules.
- Current lead times, minimums, delivery rules, and change/cancellation handling.
- One routine order walkthrough from inquiry to final handoff.
- One difficult order walkthrough from inquiry to final handoff.
- What Spoonfed already handles well.
- Where staff work around Spoonfed.
- Which customer fields, statuses, quotes, approvals, production notes, delivery sheets, and invoicing flows staff actually use.
- Whether Pearl Island wants a replacement, intake assistant, staff review layer, or prototype only.
- Whether illustrative rules are acceptable in the first prototype if clearly labeled.

## Prototype Scope

Build:

- One customer-facing catering intake journey.
- One staff review workspace.
- Two sample scenarios: routine and difficult.
- One simulated handoff: order summary, calendar event preview, and kitchen/prep sheet (a Spoonfed-style summary is acceptable for the order summary). The calendar preview stays because the manual Google Calendar step is a reported problem in the PRD.
- Clearly visible assumption labels wherever rules, pricing, or portions are not confirmed.

Do not build:

- Live payments.
- Live Spoonfed integration.
- Routing optimization.
- Real analytics or invented business metrics.
- Testimonials or fake proof.
- Claims that the estimate is accurate without staff review.

## Sober Call Agenda

1. Show the prototype as an assumption-based concept, not a finished product.
2. Ask Sober to point out what is wrong first.
3. Walk through one routine catering order using his real process.
4. Walk through one difficult catering order using his real process.
5. Review which parts of the prototype would be useful, useless, or dangerous.
6. Review Spoonfed's current role and staff workarounds.
7. Ask what artifacts he can share: current menu, price sheet, quote, anonymized order, prep sheet, Spoonfed screenshots, kitchen handoff, delivery sheet.

## Questions For Sober

Customer journey:

- Where does a catering customer usually start: website, phone, email, referral, repeat account, or Spoonfed?
- What makes an order easy enough for self-serve?
- What makes an order require staff review?
- What information is most often missing or wrong?
- What should the prototype never promise automatically?

Menu and rules:

- What menu items are currently available for catering?
- What sides are included by default with each package?
- Which rules are strict and which require staff judgment?
- Which items have dietary, allergen, spice, seasonal, or size constraints?
- How are beverages, sauces, serving utensils, labels, chafers, and disposables handled?

Pricing:

- Is pricing per person, tray, package, item, or custom quote?
- What are current prices and minimum quantities?
- Which fees exist: delivery, service, staffing, equipment, tax, processing, gratuity, deposit?
- What makes an estimate become a quote?
- What makes a quote become a confirmed order?

Operations:

- Who reviews new orders?
- Who decides if the kitchen can accept an order?
- Who communicates with the customer?
- What gets sent to the kitchen?
- What gets sent to delivery or service staff?
- How are late changes and cancellations handled?
- What happens if a customer orders above the 2GO/family-meal threshold?

Spoonfed:

- What customer fields are configured today?
- What menus and statuses do staff actually use?
- Are quotes, approvals, production notes, delivery sheets, invoicing, and custom fields used?
- What does staff still do manually after an order is in Spoonfed?
- What should a prototype complement rather than duplicate?

## Data Template For Sober

| Field | Example | Sober input needed |
|---|---|---|
| Item name | Sous Poulet Chicken | Current name |
| Category | Entree | Entree / side / drink / box lunch / add-on |
| Service style | Buffet | Buffet / boxed / family / plated / custom |
| Unit | Per person | Person / tray / platter / box / serving / bottle |
| Price | Illustrative | Current price |
| Minimum | Illustrative | Min servings / min dollars / min order |
| Included sides | Rice, kale, plantains, pikliz, aioli | Exact included items |
| Portion rule | Illustrative | Real portion rule |
| Dietary tags | Illustrative | Vegan / GF / DF / allergens / spicy |
| Lead time | 48 or 72 business hours public rule | Real lead time by order type |
| Change cutoff | 24 hours public rule | Real cutoff and exceptions |
| Staff review trigger | Illustrative | Real triggers |
| Notes | Fixed package | Operational caveats |

## Design Direction

UI and frontend source of truth: `fin_marketing_reference_report.md` and `images/`; tokens are in PRD section 8. Use the Fin references as visual inspiration, not source material. Keep the prototype operational and PRD-first.

Use warm off-white, black/charcoal, an orange accent, serif body pairing, mono eyebrows, light technical borders, corner registration squares, dotted fills, and product UI as the hero.

Do not add invented proof sections, performance charts, testimonials, or routing dashboards.

## Cursor Instruction

Proceed with an assumption-based prototype. Keep all unverified business logic replaceable, visibly label assumptions, and design the Sober call around correction and validation.

