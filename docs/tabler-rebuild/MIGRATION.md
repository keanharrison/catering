# Tabler shell rebuild: Phase 1 record

Branch: `source-code-and-screenshot-rebuild` (local only, nothing pushed).
Baseline checkpoint commit: `3620567` (submitted-request route loop fix, account-switch test, sample-queue reset).

## Sources

| Item | Value |
|---|---|
| `@tabler/core` | 1.6.1, pinned exactly (`app/package.json`, lockfile). Matches the `v1.6.1` footer in the reference screenshots. CSS only; no Tabler or Bootstrap JavaScript is loaded. |
| `@tabler/icons-react` | 3.49.0, pinned exactly. Tabler's own icon set. |
| Markup source | Rendered DOM of https://preview.tabler.io/layout-vertical.html (sidebar, page header, buttons), plus the saved source bundle (`SmallStats.astro`, `Invoices.astro`, `HeaderActionsButtons.astro`, `DefaultLayout.astro`). |
| Reference snapshot | Official repo commit `4aef709014978884ad627dd5681a09bd45fec895` (from the saved bundle's `manifest.json`). |
| License | MIT, kept at `app/third_party/tabler/LICENSE` with `NOTICE.md`. |
| Screenshots used | `images/tabler_nav_1..4.png`, `images/tabler_requests_1..3.png` (`tabler_1..3.png` are overall context). |

## What exists

- Preview URL: http://localhost:5173/tabler-preview.html (second Vite HTML entry; the original app is untouched at `/`, `/customer`, `/staff`, ...).
- Code: `app/src/tabler/` (entry, React-controlled sidebar and dropdown, theme bridge, read-only card and table examples), `app/tabler-preview.html`, `vite.config.ts` (second build input).
- Isolation: the preview imports only `@tabler/core` CSS. Verified on the production build: 0 Tailwind or shadcn markers in the preview CSS, 0 Tabler markers in the app CSS, no Bootstrap JS in any chunk.
- Reused without change: `ThemeProvider` (same `vite-ui-theme` key), `DemoAccountProvider` (same `pi2go-demo-account` key), `useDemoStore`, `routes`, `buildOrderSummary`.
- Preview routes are hash routes (`#/customer`, `#/staff`, ...) so the shell can show active-route state without leaving the page. The "Open current screen" button links to the real route.

## Verification (Phase 1)

- Tests: 121 passed in 15 files. Typecheck clean. Production build succeeds.
- Computed styles compared against the live official page at 1440px, light and dark: sidebar, brand, section titles, nav rows, page title, buttons, cards, square avatars, fonts, surfaces. All measured values match.
- Checked in the browser: 1440, 820 and 390 widths; light and dark; mobile menu open and close; account menu by pointer and keyboard; account switching from desktop and mobile; theme persistence after reload; collapsed rail persistence; focus rings; reduced motion; no horizontal overflow at 390; 44px touch targets in the collapsed layout.
- Screenshots: `docs/tabler-rebuild/*.png`.

## Known differences from the screenshots

1. Navigation rows are flat links, so there are no chevrons. The reference rows are expandable groups. Fake chevrons would suggest sub-menus that do not exist.
2. An active leaf row gets Tabler's own tinted background. The screenshots show only an active expandable parent, which is transparent and bolder.
3. Pearl Island logo and product labels replace Tabler's mark, the sample user and the "Customize" row. The theme switch sits where "Customize" sits.
4. The profile trigger uses an icon avatar, not a photo.
5. No charts, sparklines, welcome illustration, flags, row checkboxes, page-size selector or pagination. None has a product function yet.
6. The reference page has a thin strip above the layout; it is not reproduced.
7. DOM order puts the account menu before the nav links (Tabler's structure, needed for the mobile top bar), so Tab reaches it first.

## Migration checklist (product pages)

Order: Staff Requests, Event, Menu, Supplies, Details, Review, Current orders, Past orders, Messages, Settings, Handoff/print.

For every page:
- [ ] Rebuild with Tabler classes inside the shell; keep the existing store actions, validation and copy.
- [ ] Check light and dark at 1440 and 390; keyboard path; focus rings.
- [ ] Keep the existing tests green; port the page's assertions if markup roles change.

Page notes:
- [ ] Staff Requests: promote the preview's stat cards and table; add real filters, row selection, detail pane and mobile sheet.
- [ ] Event, Details: Tabler form controls, validation states, step progress (`ui/_steps.scss`).
- [ ] Menu, Supplies: item rows, dietary badges, quantity controls, sticky estimate card.
- [ ] Review: card header/body/footer; submitted-state banner; keep the StageGate fix intact.
- [ ] Current/Past orders, Messages: list-group and activity patterns using recorded data only.
- [ ] Settings: form cards.
- [ ] Handoff/print: re-verify the `@media print` rules (`.handoff-page`, `#main`, sidebar hiding) against Tabler markup.

Cross-cutting before the old frontend can be removed:
- [ ] Single navigation config shared by the old sidebar and `src/tabler/navigation.ts`.
- [ ] Decide on the route switch: serve the Tabler shell at the real routes, then retire `index.css`, shadcn UI components and the old shell.
- [ ] Code-split the main bundle (596 kB, over the 500 kB warning).
