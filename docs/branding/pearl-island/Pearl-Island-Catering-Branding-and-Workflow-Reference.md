# Pearl Island catering: branding and workflow reference

Inspected October 15, 2026 through Safari Web Inspector (Elements, computed styles, and read-only console queries of the live DOM). Values below are observed browser values, not an official brand manual. No demo source files changed.

## Scope and provenance

- Marketing site: https://pearlislandcatering.com/ and https://pearlislandcatering.com/catering
- Ordering platform linked by the catering page: https://api.getspoonfed.com/1438/pearl-island/
- Menu observed with Standard Order, pickup, default date October 22, 2026, noon–12:30 p.m. No items added and no order submitted. Availability can depend on date, fulfillment, or order type; Group Order was not explored.
- The “Observed CSS” section below contains a small verbatim theme excerpt plus reconstructed CSS from computed values. The “Suggested demo tokens” section provides suggested token names using those observations; it is not copied site source. All reference material is consolidated in this document.

## Exact observed colors

| Role | Value | Evidence |
|---|---|---|
| Primary turquoise | `#00A1CA` / `rgb(0,161,202)` | Marketing body/footer; Spoonfed `--web-theme-primary` and primary actions |
| Ordering hover token | `#00708D` | Spoonfed inline `:root` declaration |
| Active marketing navigation | `#206B8D` / `rgb(32,107,141)` | Active HOME/CATERING links |
| Marketing inline-link accent | `#F5A742` / `rgb(245,167,66)` | Catering “Contact us” / “Reach out” links |
| Marketing button ink/border | `#1C1C1C` | Outlined catering buttons |
| Marketing header surface | `#FFFFFF` | Computed header background |
| Marketing body text | `rgba(0,0,0,.78)` | Catering paragraphs |
| Inactive marketing navigation | `rgba(0,0,0,.49)` | Navigation links |
| Marketing heading ink | `#000000` | Catering H2 |
| Marketing image-overlay text | `#FFFFFF` | Image caption |
| Footer contact text | `rgba(255,255,255,.8)` | Email link |
| Footer muted text | `rgba(234,230,230,.44)` | Footer / attribution |
| Ordering main text | `#212529` | H2, time selection |
| Ordering primary-action text | `#FDFDFD` | View basket / Add to Order |
| Inactive ordering tab | `#706B76` | Group Order tab |

Transparent backgrounds and alpha colors must retain their compositing context; do not convert alpha text colors into arbitrary solid hex values. Bootstrap also defines stock blue, green, red, etc.; their mere presence does not make them Pearl Island brand colors.

## Typography and components

| Element | Observed settings |
|---|---|
| Marketing navigation | Raleway, 14px, 700, 14px line-height, 2px tracking, uppercase; padding 10.5px 14px |
| Marketing catering buttons | Raleway, 15px, 700, 3px tracking, uppercase; transparent fill; 2px solid #1C1C1C; 3px radius; padding 21px 34px |
| Homepage hero heading | Raleway, 64px, 800, 6.4px tracking; #00A1CA |
| Catering section H2 | Pompiere, 42px, 400, 63px line-height |
| Marketing paragraphs | Pompiere, 54px, 400, approximately 86.4px line-height, .4px tracking |
| Ordering interface | `Inter, Helvetica, Arial, sans-serif`; setup H2 32px, order tabs 16px |
| Ordering primary actions | Turquoise fill, #FDFDFD text, 6px radius, 1px transparent border |
| Ordering time selector | Transparent fill, #212529 text, 1px turquoise border, 6px radius |

These sizes are desktop observations, not a recommended form typography scale. Pompiere and the large marketing paragraph sizing are optional references; the live ordering product already uses Inter. Preserve readable form text and your working interaction design. No exact responsive breakpoint or marketing hover behavior was verified.

## Catering services versus online menu categories

The marketing page describes corporate lunch buffets and wedding plated dinners; service styles are **buffet, family style, and plated events**. Menus can be customized, with **a la carte and bulk pricing** and a quote/contact route. These are service descriptions, not the online menu's category hierarchy.

The actual online categories are:

| Category | Source ID | Offerings observed |
|---|---|---|
| Sides | 12950 | Under “Vegan Rice Options:” — Tropical Fried Rice; Rice w/ Pigeon Peas; Brown Rice, Red Quinoa & Lima Beans; Yellow Rice; White Rice. Under “More Sides:” — Pearl Island Mac and Cheese; Roasted Vegetables; Tostones; Amarillos; Pikliz - 2oz; Aioli - 16oz Bottle; Vegan Aioli - 16oz Bottle; Southern Roasted Vegetables; PI Collard Greens |
| Salads | 12951 | Kale Salad; Medley Salad |
| Entrees | 12953 | Caribbean Entrees Options: Slow Roasted Pork; Sous Poulet Chicken; Curry Chicken; Jerk Chicken; Curry Tofu; Creole Beans; Jerk Tofu |
| Disposable Catering Supplies | 13067 | Required group “Cutlery, Plates, Serving Utensils”; explicit no-supplies option; Plates, Cutlery, Cups; Plates & Cutlery; Cups; Cutlery Pack; Serving Spoons; Serving Tongs; Disposable Chaffing Set (source spelling) |

Category links follow `https://api.getspoonfed.com/1438/pearl-island/menus/?c=ID`. These are observed platform identifiers, not recommended internal application IDs.

Observed side guidance: 6oz for each spooned item; plantains two per serving. Pikliz and bottled aioli have their own size labels. Entrées say priced per serving, serving size “6oz Spoon.” Do not infer that every item is 6oz or that a serving equals an entire meal.

Dietary badges include Vegetarian, Vegan, Gluten Free, and Dairy Free. Source grouping and badges are not fully consistent: the “Vegan Rice Options” heading contains items labeled Vegetarian, and Jerk Tofu is labeled Vegetarian/Gluten Free. Preserve observed labels and verify with Sober; do not infer allergen safety.

Supplies require an explicit decision; the platform's no-supplies path says quantity 1 plus “No Cutlery, Plates, Serving Utensils Needed.” This is a Spoonfed interaction detail, not a requirement to copy its awkward quantity mechanism. Other observed options include Standard/Group Order, Delivery/Pick-up, time slots, and Add Time Slot. Orders above 50 guests are directed to email the team with five business days' notice.

## Source code and assets worth reusing

Marketing CSS observed in the inspector:
https://static1.squarespace.com/static/sitecss/5c7ffc0290f9042269f771ec/108/52e96934e4b0ea14d0f64568/5c7ffc0290f9042269f77201/1142/site.css?nocustom=true

Custom stylesheet reference:
https://static1.squarespace.com/static/custom-css/5c7ffc0290f9042269f771ec/5c7ffc0290f9042269f77201/0/custom.css

Ordering stylesheets:
https://api.getspoonfed.com/theme/widget/framework.css
https://api.getspoonfed.com/styles/widgetv3-b5.css

Observed marketing logo source:
https://images.squarespace-cdn.com/content/v1/5c7ffc0290f9042269f771ec/4d4c2e58-74fa-41e9-b7ca-ebc56c73eeaa/catering_01_final.png?format=1500w

Observed ordering background source:
https://spoonimg.imgix.net/1438/images/logo/pearlislandbg6.png?auto=format&max-w=2000&max-h=2000&q=80&fit=clip

Special events PDF linked by marketing site (located, not parsed in this task):
https://pearlislandcatering.com/s/2026-Pearl-Island-Catering-Menu-WOP_1_8_2026-Google-Docs-fjbj.pdf

These are public asset references, not downloaded assets. The logo is a raster image; its internal lettering and colors were not separately measured. Computed font families above refer to page text, not logo lettering. Front-end inspection cannot reveal private server-side source or checkout business logic.

## Brief for Claude

Use the primary turquoise, verified dark hover token, existing logo, and restrained Raleway accents to align the demo. Keep readable workflow typography (Inter is already used by the real ordering product). Treat the orange as an observed marketing accent, not a new primary-action requirement. Use the four real online categories and preserve an explicit supplies decision. Keep custom event service styles separate from food categories. Reconcile these observations with the menu already in the demo rather than overwriting it blindly. No pricing, portion, dietary, or operational rule is client-confirmed solely because it appears on a public page. Avoid importing entire Squarespace/Spoonfed bundles, tracking scripts, marketing navigation, or unrelated website content. Apply branding without expanding the agreed demo scope.

## Observed CSS

The theme excerpt is observed source; the component selectors below are reference names reconstructed from computed styles. They are not selectors copied from the original stylesheets.

```css
/* Observed Oct 15, 2026 via Safari Web Inspector.
   First block: excerpt of Spoonfed inline source declarations.
   Remaining blocks: reconstructed from computed styles, not verbatim source.
   Reference only; not installed in the demo. */
:root {
  --web-theme-primary: #00a1ca;
  --web-theme-primary-hover: #00708D;
  --web-theme-primary-r: 0;
  --web-theme-primary-g: 161;
  --web-theme-primary-b: 202;
}

/* Marketing site .sqs-block-button-element */
.observed-marketing-button {
  font-family: Raleway;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #1c1c1c;
  background-color: transparent;
  border: 2px solid #1c1c1c;
  border-radius: 3px;
  padding: 21px 34px;
}

/* Ordering platform .btn-primary */
.observed-ordering-button {
  font-family: Inter, Helvetica, Arial, sans-serif;
  color: #fdfdfd;
  background-color: #00a1ca;
  border: 1px solid transparent;
  border-radius: 6px;
}
```

## Suggested demo tokens

These proposed token names are implementation guidance, not existing website source. When using Tailwind, integrate the values into the existing theme instead of creating competing token definitions.

```css
/* Suggested semantic mapping of observed values; new token names.
   No font files are bundled or loaded. See the Scope and provenance section above. */
:root {
  --pearl-brand: #00a1ca;
  --pearl-brand-hover: #00708d;
  --pearl-marketing-active-link: #206b8d;
  --pearl-marketing-accent: #f5a742;
  --pearl-surface: #ffffff;
  --pearl-text: #212529;
  --pearl-marketing-text: rgba(0, 0, 0, .78);
  --pearl-marketing-nav-muted: rgba(0, 0, 0, .49);
  --pearl-on-action: #fdfdfd;
  --pearl-font-ui: Inter, Helvetica, Arial, sans-serif;
  --pearl-font-brand: Raleway, sans-serif;
  --pearl-font-marketing: Pompiere, sans-serif;
  --pearl-control-radius: 6px;
  --pearl-marketing-button-radius: 3px;
}
```
