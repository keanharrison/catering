Rebuild the Pearl Island demo’s frontend from official Tabler source and the supplied screenshots, starting with ONLY the shared application shell.

Execute the modules below in order. Complete Phase 1 and stop for visual review before rebuilding any product pages.

PROJECT AND BRANCH

Repository:
/Users/keanharrison/restaurant_demo

Application:
/Users/keanharrison/restaurant_demo/app

Required branch:
source-code-and-screenshot-rebuild

Read repository instructions first. Confirm the branch using Git, not the terminal’s visual indicator. Stop if the branch differs.

Do not push, deploy, merge, switch to main, discard changes, or overwrite unrelated work.

MODULE 1 — PRESERVE THE VERIFIED BASELINE

The last reported baseline:
- 121 tests passing across 15 files
- Clean typecheck
- Successful production build

Review and create a LOCAL checkpoint commit containing these three fixes if they remain uncommitted:
- app/src/components/StageGate.tsx
- app/src/journey.e2e.test.tsx
- app/src/regression.test.tsx

Check the diff before staging. If already committed, record the existing commit instead of creating a duplicate.

Preserve these behaviors:
- Submitted requests stay on Review instead of looping between Review and Details
- Account-switch tests open the submenu through separate keyboard actions
- Regression tests reset shared sample orders between tests

Record the checkpoint commit hash in the migration checklist.

MODULE 2 — READ THE ACTUAL REFERENCES

A. Existing source bundle

Directory:
/Users/keanharrison/.codex/.chatgpt-projects/g-p-6aa4118952fc8191a5d920f2a3bd25cd/references/tabler-dashboard/

Read:
- REPORT.md
- manifest.json
- LICENSE
- preview/pages/index.astro
- shared/layouts/DefaultLayout.astro
- shared/components/HomepageContent.astro
- shared/components/layout/HeaderActionsButtons.astro
- shared/components/cards/SmallStats.astro
- shared/components/cards/Invoices.astro
- core/scss/_variables.scss
- core/scss/_variables-dark.scss
- core/scss/layout/_navbar.scss
- core/scss/layout/_page.scss
- core/scss/ui/_cards.scss
- core/scss/ui/_buttons.scss
- core/scss/ui/_tables.scss

This is a PARTIAL source bundle, not a complete runnable Tabler project. Its manifest records the upstream commit and file origins. Do not assume it matches every byte of the deployed preview.

If this directory is inaccessible, retrieve the corresponding files from the official repository; do not substitute an approximation without reporting it.

B. Official source and live examples

Official repository:
https://github.com/tabler/tabler

Official package:
https://www.npmjs.com/package/@tabler/core

Dashboard:
https://preview.tabler.io/

Vertical sidebar:
https://preview.tabler.io/layout-vertical.html

Floating navbar:
https://preview.tabler.io/layout-navbar-floating.html

Light-mode reference:
https://preview.tabler.io/layout-navbar-floating.html?theme=light

Dark-mode reference:
https://preview.tabler.io/layout-navbar-floating.html?theme=dark

C. Repository screenshots

Find and open the actual files in the repository’s images directory:
- tabler_1
- tabler_2
- tabler_3
- tabler_nav_1
- tabler_nav_2
- tabler_nav_3
- tabler_nav_4
- tabler_requests_1
- tabler_requests_2
- tabler_requests_3

Resolve their actual extensions and record the filenames.

Reference mapping:
- tabler_nav_1: Vertical sidebar, including active navigation
- tabler_nav_2: Profile dropdown
- tabler_nav_3: Floating navbar and primary/secondary buttons
- tabler_nav_4: Light-mode navbar and buttons
- tabler_requests_1: Compact icon/count cards
- tabler_requests_2: Dark-mode invoice table
- tabler_requests_3: Light-mode invoice table
- tabler_1 through tabler_3: Overall visual context

VISUAL AUTHORITY

The screenshots are the sole authority for appearance where the relevant element is visible.
Official Tabler source supplies implementation details, assets, responsive rules, and interaction styling.
If the source differs from a screenshot, match the screenshot.
Existing application logic supplies product content and behavior.

Keep Pearl Island’s logo, product name, navigation labels, and catering data. Do not copy Tabler’s branding or fictional analytics.

MODULE 3 — ESTABLISH THE SOURCE-BASED FOUNDATION

Inspect the current application entry, router, theme provider, account provider, state store, and stylesheet imports.

Obtain the official @tabler/core package:
- Check available versions and select the version corresponding to the inspected reference where available
- Pin the exact version in the dependency manifest and lockfile
- Record the selected version
- Preserve the applicable license

Use Tabler’s actual CSS and component markup as the foundation.
Translate Astro/HTML templates into React.
Do not recreate Tabler by merely adjusting default shadcn classes.

Create a separate Vite HTML entry at:
app/tabler-preview.html

Use a dedicated React entry and stylesheet for that page.
The preview must not import the current app’s global Tailwind/shadcn stylesheet, directly or through another module.
Reuse business state/providers through imports that do not pull in the old presentation.

The intended preview URL:
http://localhost:5173/tabler-preview.html

Keep the existing application accessible at its current routes.

Use React to control dropdowns, sidebar state, account switching, and other interactions.
Do not load Bootstrap/Tabler JavaScript that also controls those same elements.

MODULE 4 — IMPLEMENT THE SHARED SHELL

A. Sidebar
Reference: tabler_nav_1
- Match the sidebar surface, border, width, row spacing, icon alignment, labels, and active-row treatment
- Use existing customer/staff navigation destinations
- Keep correct active-route semantics
- Support expanded desktop navigation and mobile drawer behavior
- Include collapsed desktop mode if supported by the chosen official layout; otherwise preserve that capability as an explicit migration task rather than inventing an unreferenced design

B. Header
References: tabler_nav_3 and tabler_nav_4
- Match header-control styling, spacing, icons, separators, and buttons
- Keep the existing sidebar-plus-header arrangement
- Preserve useful existing breadcrumbs and theme switching
- Do not add notification, language, or app-launcher controls without existing functionality

C. Profile/account menu
Reference: tabler_nav_2
- Match the trigger, dropdown surface, spacing, separators, hover, and focus states
- Reuse the existing account context and switching actions
- Preserve current customer/staff account choices and navigation outcomes
- Do not create real authentication or new account behavior

D. Page heading/actions
References: navbar screenshots
- Match heading/action alignment and primary/secondary button styling
- Use our product text and functional navigation actions

E. Representative components
References: tabler_requests_1 through tabler_requests_3
- Render a compact example of the official card and table treatments inside the preview
- Use existing sample request data read-only
- Treat these as styling verification examples, not a migrated Staff Requests page
- Do not add approval, editing, or order mutations to this preview phase

F. Themes and responsiveness
- Preserve the current theme preference through the existing theme provider
- Bridge that preference to Tabler’s required theme attributes
- Match light/dark reference surfaces and controls
- Prevent overflow and preserve accessible touch targets on mobile
- Respect reduced-motion preferences

MODULE 5 — VERIFY BEFORE EXPANDING SCOPE

Use one running development server, reusing port 5173.
Do not silently switch to another port.

Check:
- Desktop at 1440px wide
- Mobile at 390px wide
- Light and dark themes
- Sidebar opening/closing
- Profile menu by pointer and keyboard
- Account switching and resulting destinations
- Theme switching and persistence after refresh
- Visible focus, readable labels, and absence of clipping
- Original application still accessible and functioning

Capture the preview at the same theme and comparable viewport as each applicable reference.
Compare alignment, dimensions, typography, colors, borders, icons, and spacing.
Correct visible discrepancies before calling the shell complete.

Run:
- Relevant focused tests during implementation
- Full test suite once the shell is ready
- Typecheck
- Production build

If a run stalls, terminate only its verified project workers and investigate; do not leave overlapping test runs.
Do not skip tests, weaken assertions, or call an interrupted run a pass.

MODULE 6 — DELIVER AND STOP

Provide:
- Local checkpoint commit hash
- Pinned Tabler version and source locations
- Working preview URL
- Desktop light/dark and mobile screenshots
- Verification results
- Remaining visual differences
- A short migration checklist for the product pages

Future migration order:
Staff Requests → Event → Menu → Supplies → Details → Review → Current orders → Past orders → Messages → Settings → Handoff/print

Do not migrate those pages yet.
Do not remove the old frontend.
Do not push any commits.
Do not invoke design skills or commands automatically.