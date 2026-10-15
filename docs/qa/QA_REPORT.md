# QA report: customer journey and staff workspace

Run October 15, 2026 against commit `8e26394` using real Chromium (Playwright) on the dev server (desktop 1280px, phone 390px, plus 320/768/1024px overflow sweeps), the production build (`vite preview`), and an axe accessibility audit. Reproducible script: [qa.mjs](qa.mjs). Nothing was changed in the app during this pass.

## Result

38 checks: **33 pass, 4 fail (confirmed bugs), 1 warning.** No console errors or failed requests during normal use. axe (WCAG 2.1 A/AA) found no violations on 9 screens. Production deep links load.

## Bugs

| # | Severity | Bug | Repro | Likely fix |
|---|---|---|---|---|
| QA-1 | Medium | The skip link and header navigation are skipped by the first Tab press. | Load any page, press Tab once: focus lands on the first item inside the page, not "Skip to main content". | On first page load, don't focus `<main>`; only do it on later route changes ([AppShell.tsx](../../app/src/components/AppShell.tsx)). |
| QA-2 | Medium | A long unbroken string in the custom-request field widens the page to about 7,400px on the review and staff pages. | Details: type 400 "B" characters in "Would you like to request an item…", then Review (or Submit and open Staff). | Let long text wrap (`break-words` / `overflow-wrap: anywhere`, `min-w-0` on the grid columns) in the review values and the flag list. |
| QA-3 | Low | "Start over" lands on the Menu page (empty), not the Event page. | Submit a request, click Start over. | Navigate before resetting (the stage guard redirects first today) in [ReviewPage.tsx](../../app/src/views/customer/ReviewPage.tsx). |
| QA-4 | Low | Corrupted or partial saved state (for example `order: null`) white-screens the app, and there is no error boundary. | Set `localStorage['pi2go-demo']` to `{"state":{"order":null},"version":2}`, reload. | Validate persisted state when loading it, and add a React error boundary with a reset action. |

## Warning

- **Touch targets under 44px on phones:** header links are about 20px tall, and the demo bar's role switch, scenario select and Reset are 25–36px. Menu steppers, buttons and form fields pass. The skip link being 1px is expected (it is hidden until focused).

## Observations (not bugs)

- Dietary needs: the routine scenario pre-checks "Vegetarian" because the demo prefills the event basics. Whether a first-time customer should start with nothing checked is a product decision.
- Typed quantities: "-3" becomes 0, "2.5" becomes 2, empty becomes 0, and over 5000 is capped at 5000.
- Both scenarios, both staff flows (ask a question, edit then customer approval then accept), the simulated-only assistants, and the empty states all behaved as designed.

## Checks that passed (by area)

Event form validation (8), menu browsing, quantities, filters, tabs, suggestions and undo (8), supplies pricing and rules (2), details validation and markup safety (2 of 3), review and submit including double-click (3 of 4), navigation and deep links (2 of 3), scenarios and reset (2), staff flows (4), production build (1), no overflow at 320/768/1024px except QA-2's input (1), accessibility audit (1).

## Not covered

Safari, Firefox and real iOS or Android devices; screen readers; slow or offline networks; two browser tabs sharing one saved state; the live Vercel deployment; performance; contrast of disabled controls (axe skips them).

## Test-script note

Playwright's `waitForURL` resolves when the address changes, before React finishes drawing the page. Early runs reported four false failures for that reason; the script now waits briefly after each navigation, and each finding above was reproduced by hand.
