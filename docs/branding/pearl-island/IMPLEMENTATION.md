# Pearl Island branding: implementation record

Written October 15, 2026, for the catering demo in `app/`. This records what was observed on Pearl Island's sites, what the demo chose to use (and why it differs), and how it was checked. Source observations: [Pearl-Island-Catering-Branding-and-Workflow-Reference.md](Pearl-Island-Catering-Branding-and-Workflow-Reference.md) (observed October 15, 2026 with Safari Web Inspector; not an official brand manual). Pearl Island's captured branding is the visual source for the customer-facing demo; layout patterns should follow `SOUL.md`.

## 1. Observed values versus demo values

| Role | Observed on Pearl Island | Demo value | Why it differs |
|---|---|---|---|
| Primary turquoise | `#00A1CA` (marketing text, Spoonfed primary) | `#00A1CA` as `accent` | Same. Used for decoration and selection marks only. |
| Primary button fill | `#00A1CA` with `#FDFDFD` text (Spoonfed) | `#00708D` with `#FDFDFD` text as `action` | White on `#00A1CA` is 2.97:1, below the 4.5:1 needed for text. `#00708D` (Spoonfed's own hover token) passes at 5.58:1. |
| Button hover / pressed | `#00708D` is the observed hover | `#005B73` hover, `#004A5E` pressed | Derived, because our base fill is already `#00708D`. |
| Active navigation | `#206B8D` | `#206B8D` as `nav-active` | Same (5.92:1 on white). |
| Marketing accent | `#F5A742` (contact links) | Token `marketing-accent`, not used in the UI | Observed as a link accent, not an action color; 2.00:1 on white, so unusable for text. |
| Canvas and panels | `#FFFFFF` | `#FFFFFF` | Same. |
| Secondary surface | none observed | `#EEF8FB` as `ivory-deep` | Demo adaptation: a subtle turquoise tint. |
| Main text | `#212529` (ordering) | `#212529` | Same (15.43:1). |
| Muted text | `#706B76` inactive tab; marketing alphas | `#626260` | Kept from the earlier theme; passes 6.11:1. Alpha colors were not flattened into brand hex values. |
| Decorative borders | not captured | `#DDDDD8` | Kept from the earlier theme. Decorative only (1.36:1). |
| Control borders | 1px turquoise on the time selector | `#767B80` | Demo adaptation so inputs and steppers meet 3:1 (4.27:1). |
| Status colors | Bootstrap stock colors (not brand) | green `#25683F`, amber `#8A5A00`, red `#B3261E` | Demo choice, darkened so the pill text passes 4.5:1 (5.79, 5.13, 5.53). Never replaced by brand turquoise. |
| Control radius | 6px (ordering buttons and selector) | 6px for buttons and form controls | Same. The marketing site's 3px outlined buttons were not used. |
| Logo | Site-served transparent WebP, 1500x1457 | Same artwork, resized to 320px PNG | See section 4. |

## 2. Token-to-component mapping

All tokens live in one theme in `app/src/index.css`. Older token names were kept so components inherit changes: `ivory` is now the white canvas and `ivory-deep` the turquoise tint (a naming debt that a later rename can clear).

| Token | Where it appears |
|---|---|
| `accent` `#00A1CA` | Progress bar fill, active-tab top bar, label marker squares, checkbox and radio ticks |
| `action` `#00708D` family | Primary buttons, secondary button text and outline, selected filter chips, selected role switch, focus ring |
| `nav-active` `#206B8D` | Active header link (also underlined and bold) |
| `ivory-deep` tint | Demo bar, secondary side panels, active tab background, assistant greeting, expanded item details |
| `line` / `control-line` | Panel and divider borders / inputs, steppers, filter chips, role switch |
| `charcoal`, `muted` | Body text, secondary text |
| `status-*` | Status pills and tags only |

Files changed for the branding pass: `app/src/index.css`, `app/index.html`, `app/package.json` and lockfile (Source Serif dependency removed); components `Button`, `Field`, `QuantityStepper`, `DemoBar`, `AppShell`, `CornerSquares` (comment), `OrderSummaryPanel`; views `MenuPage`, `SuppliesPage`, `orderSummary.ts` (captured category label "Disposable catering supplies") and the Panel corner-decoration removals in the customer, staff and handoff views; assets `app/public/branding/pearl-island-logo.png` (added) and `app/public/favicon.svg` (removed). Change history is available in Git commits.

## 3. Typography and accessibility decisions

- **Type:** Inter Tight for body and headings (replacing Source Serif 4 for body), JetBrains Mono kept only for small labels. Pearl Island's marketing site uses Raleway and Pompiere and Spoonfed uses Inter; Inter Tight is an intentional demo choice (a slightly tighter relative of Spoonfed's Inter). No new fonts were added, and Pompiere and oversized marketing paragraph sizes were not used.
- **Contrast:** buttons use the darker turquoise for fills; bright turquoise is limited to non-text marks (3.02:1 on white). Status text and control borders were darkened to pass.
- **Focus and keyboard:** 2px dark-turquoise focus ring; skip link is first in Tab order; active navigation and selected tabs use an underline or bar as well as color.
- **Touch:** controls are at least 44px on phones, except the header links and demo-bar controls (open warning).

## 4. Logo

The logo in the header is the artwork served on pearlislandcatering.com. The JPEG supplied by the team is the same artwork flattened onto white, so the transparent site version was used (better on tinted surfaces). **Both files contain a tiny stray line of text near the center ("Vegan Platters: Creole Beans, Curry Tofu")**, invisible at header size but visible at large sizes. The logo was not edited. The same image is used as the browser icon. The header shows "Pearl Island Catering" (the logo's wording); the product/ordering name "Pearl Island2GO" appears nowhere on screen now.

## 5. Validation

- Typecheck, lint, 110 automated tests and the production build pass.
- Real Chromium at 1280px and 390px: header logo shares a left edge with the page content; 9 screens (event, menu, supplies, details, review, submitted, staff, accepted, handoff) show no horizontal overflow; 38-check QA suite 37 pass, 0 fail, 1 warning; axe (WCAG 2.1 A/AA) reports no violations. Details: `docs/qa/QA_REPORT.md`.
- Contrast ratios above were computed, not estimated.
- **Not verified:** a side-by-side visual comparison with the live Pearl Island sites; Safari and Firefox; real phones; screen readers.

## 6. Open items and questions for Sober

The current visual guidance is in `SOUL.md`; current product requirements are in `PRD.md`. The internal component Gallery may still mention the old orange look and should be checked when that page is next updated.

Questions for Sober:
1. Is this turquoise (and the darker button shade) how he wants the brand to look in ordering, or does he have a brand guide?
2. Does he want the logo's stray text artifact fixed at the source, and does he have a cleaner or vector version?
3. Should the demo use "Pearl Island Catering" or "Pearl Island2GO" as the visible name?
4. Does he want the marketing orange anywhere, or should it stay marketing-only?
5. Does he have the Raleway or Pompiere fonts licensed for web use, or is Inter fine for ordering?
