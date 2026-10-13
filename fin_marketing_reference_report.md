Boom boom boom # Fin Marketing Page Reference for Pearl Island2GO Demo

> **Overrides (October 13, 2026):** This report is the UI source of truth, with two exceptions decided later. The accent is warm orange per the screenshots, not teal/mango, and the build is PRD-first (customer intake, then staff review, then handoff), not staff-dashboard-first. Ops metrics (on-time, margin, staffing, routing), testimonials, and logo bands are out of scope. See PRD section 8 for the current tokens.

Bottom line: Use Fin as a polish benchmark, not a blueprint; borrow the calm hierarchy, spacious rhythm, crisp data UI, and product-in-context storytelling, then translate it into Pearl Island's catering operations brand.

## Screenshot References

Reference the six screenshots in the project `images/` folder. Treat them as visual notes for the major page sections: opening hero/navigation, brand proof/logo band, capability/product UI area, performance/data charts, testimonials/integrations, and pricing/footer.

Do not recreate the screenshots directly. Use them to understand visual rhythm, density, hierarchy, spacing, and component behavior.

## Directly Observed

Typography: oversized, high-contrast display headings; small uppercase eyebrow labels; compact body text; numeric/data labels with a utilitarian, mono-like feel. Text is mostly black or near-black on warm white/off-white, with muted gray secondary copy.

Color: mostly off-white/cream surfaces, near-black text, pale gray borders, compact black primary buttons, outline secondary buttons, muted pastel media accents, and small status colors inside product UI.

Spacing and layout: generous vertical section spacing, centered max-width content, wide gutters, and sections that feel like full-width bands rather than nested cards. Product UI is large, crisp, and allowed to crop at the edges for depth.

Cards and borders: subtle 1px borders, low-radius rectangles, light dividers, restrained shadows, and functional product panels. Buttons are compact, low-radius, and clearly primary/secondary.

Interaction patterns: top navigation with a few CTAs, tabbed feature selectors, carousel-like proof modules, pricing-style option cards, embedded chat/help affordance, and clean data charts with emphasized outcomes.

## Interpretation for Catering Operations

Use the same confidence level, but make the demo feel like a living operations console: orders moving through inquiry, quote, confirmation, prep, delivery, and follow-up. Replace AI-support proof with catering proof: fulfillment reliability, prep readiness, customer approvals, route status, staffing coverage, and menu profitability.

Reusable component mappings:

- Capability tabs -> customer flow stages: `Plan`, `Quote`, `Confirm`, `Prep`, `Deliver`, `Follow up`.
- Product media tile -> live catering workspace: order board, quote builder, kitchen prep list, delivery route panel.
- Performance charts -> ops metrics: on-time deliveries, order margin, prep completion, unresolved customer questions.
- Testimonial carousel -> customer/event examples: corporate lunch, wedding drop-off, recurring office catering.
- Integration section -> connected tools: website orders, calendar, POS, SMS/email, driver routing, kitchen display.
- Pricing cards -> demo packaging or service tiers; otherwise convert into “Today’s workload” cards.

## Original Pearl Island Direction

Brand feel: tropical hospitality plus serious operations. Use warm ivory, charcoal, sea-glass teal, ripe mango, banana-leaf green, and small coral accents. Keep the restraint and polish, but avoid Fin’s exact palette, assets, copy, and layout.

Layout proposal: first screen should be the demo workspace, not a marketing hero. Use a left staff nav, a top operations bar, and a main dashboard with three zones: catering pipeline, active order detail, and kitchen/delivery readiness. Add a narrow customer-facing preview panel to show how staff actions affect the customer journey.

Component style: low-radius panels, fine borders, dense but breathable tables, pill status tags, compact icon buttons, segmented controls for order stage, and calm charts. Use food/catering imagery sparingly as small contextual thumbnails, not large decorative hero art.

Copy direction: write original operational labels: `New inquiry`, `Menu approval`, `Deposit pending`, `Prep list`, `Driver assigned`, `Guest count changed`, `Ready for pickup`. Do not reuse Fin wording or customer-service claims.

## Implementation Checklist for Claude

- Reference the six screenshots in `images/` for visual direction only.
- Build an original catering operations dashboard, not a Fin page clone.
- Use approximate tokens: ivory background, charcoal text, teal primary, mango highlight, light gray borders, 4-8px radius, generous spacing.
- Prioritize real UI: pipeline, order detail, prep checklist, delivery timeline, customer messages, metrics.
- Include segmented stage controls, compact primary/secondary buttons, status pills, and simple charts.
- Keep typography sharp: large page title, small uppercase labels, compact table text.
- Avoid copying Fin source, assets, exact text, exact colors, exact layout, logo marks, or customer marks.
