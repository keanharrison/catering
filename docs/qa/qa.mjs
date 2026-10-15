// QA suite for the Pearl Island demo. Needs: npm i playwright @axe-core/playwright; npx playwright install chromium;
// dev server on :5173 and `vite preview --port 4173`. Reads from a fresh browser context per check.
// Note: Playwright's waitForURL resolves on the URL change, before React finishes rendering, so each
// navigation is followed by a short wait before asserting on page content.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = 'http://127.0.0.1:5173'
const results = []
const problems = new Set()

async function newPage(browser, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  page.setDefaultTimeout(6000)
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.add(`console ${m.type()}: ${m.text().slice(0, 140)}`))
  page.on('pageerror', (e) => problems.add(`pageerror: ${String(e).slice(0, 140)}`))
  page.on('requestfailed', (r) => problems.add(`requestfailed: ${r.url().slice(0, 100)}`))
  page.on('response', (r) => r.status() >= 400 && problems.add(`http ${r.status()}: ${r.url().slice(0, 100)}`))
  return page
}
async function t(id, name, fn) {
  try { results.push({ id, name, status: 'PASS', note: (await fn()) ?? '' }) }
  catch (e) { results.push({ id, name, status: 'FAIL', note: String(e.message).split('\n')[0].slice(0, 200) }) }
}
const expect = (c, msg) => { if (!c) throw new Error(msg) }
const btn = (p, name) => p.getByRole('button', { name })
const total = (p) => p.getByLabel('Estimated total').textContent()
const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('pi2go-demo')).state)

async function fresh(page, scenario = 'routine') {
  await page.goto(BASE + '/customer')
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE + '/customer')
  if (scenario !== 'routine') await page.getByLabel('Scenario').selectOption(scenario)
}
const toMenu = async (p) => { await btn(p, 'Choose your menu').click(); await p.waitForURL('**/customer/menu'); await p.waitForTimeout(150) }
const suggest = async (p) => { await btn(p, 'Help me choose').click(); await btn(p, 'Use these').click() }
const toSupplies = async (p) => { await btn(p, 'Continue to supplies').click(); await p.waitForURL('**/customer/supplies'); await p.waitForTimeout(150) }
const noSupplies = (p) => p.getByRole('radio', { name: /No cutlery/ }).check()
const toDetails = async (p) => { await btn(p, 'Continue to details').click(); await p.waitForURL('**/customer/details'); await p.waitForTimeout(150) }
const toReview = async (p) => { await btn(p, 'Review your request').click(); await p.waitForURL('**/customer/review'); await p.waitForTimeout(150) }
async function toReviewFlow(p, scenario) { await fresh(p, scenario); await toMenu(p); await suggest(p); await toSupplies(p); await noSupplies(p); await toDetails(p); await toReview(p) }
const submit = (p) => btn(p, 'Submit request').click()
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth)

const browser = await chromium.launch()
const page = await newPage(browser)

// ---------- A. Event form
await t('A1', 'Empty guest count is rejected, stays on page, focuses the field', async () => {
  await fresh(page); await page.getByLabel('Number of guests').fill(''); await btn(page, 'Choose your menu').click()
  expect((await page.getByRole('alert').first().textContent()).includes('whole number'), 'no error text')
  expect(page.url().endsWith('/customer'), 'navigated away')
  expect(await page.evaluate(() => document.activeElement?.id) === 'guestCount', 'focus not on guests')
})
await t('A2', 'Bad guest counts (0, -5, 1.5, 6000) are rejected', async () => {
  const bad = []
  for (const v of ['0', '-5', '1.5', '6000']) {
    await fresh(page); await page.getByLabel('Number of guests').fill(v); await btn(page, 'Choose your menu').click()
    if (!page.url().endsWith('/customer')) bad.push(v)
  }
  expect(bad.length === 0, 'accepted: ' + bad.join(','))
})
await t('A3', 'Past date rejected', async () => {
  await fresh(page); await page.getByLabel('Event date').fill('2026-10-01'); await btn(page, 'Choose your menu').click()
  expect(page.url().endsWith('/customer'), 'accepted past date')
})
await t('A4', 'Missing event type rejected', async () => {
  await fresh(page); await page.getByLabel('Event type').selectOption(''); await btn(page, 'Choose your menu').click()
  expect(page.url().endsWith('/customer'), 'accepted empty type')
})
await t('A5', 'Budget: text rejected, $1,200 accepted', async () => {
  await fresh(page); await page.getByLabel('Budget (optional)').fill('lots'); await btn(page, 'Choose your menu').click()
  expect(page.url().endsWith('/customer'), 'accepted "lots"')
  await page.getByLabel('Budget (optional)').fill('$1,200'); await btn(page, 'Choose your menu').click()
  await page.waitForURL('**/customer/menu'); await page.waitForTimeout(150)
})
await t('A6', 'Date picker blocks dates before the demo clock', async () => {
  await fresh(page); const min = await page.getByLabel('Event date').getAttribute('min'); return `min=${min}`
})
await t('A7', 'Dietary needs start unchecked? (prefilled from scenario)', async () => {
  await fresh(page); const checked = await page.locator('input[name=dietary]:checked').count(); return `${checked} pre-checked (routine scenario prefills vegetarian)`
})

// ---------- B. Menu
await t('B1', 'Menu starts empty; Continue disabled', async () => {
  await fresh(page); await toMenu(page)
  expect(await btn(page, 'Continue to supplies').isDisabled(), 'continue enabled with empty order')
  expect((await page.getByTestId('coverage').textContent()).includes('40 more'), 'coverage wrong')
})
await t('B2', 'Stepper + increments; - disabled at 0', async () => {
  await fresh(page); await toMenu(page)
  expect(await page.getByRole('button', { name: 'Decrease quantity of Jerk Chicken' }).isDisabled(), '- enabled at 0')
  await page.getByRole('button', { name: 'Increase quantity of Jerk Chicken' }).click()
  expect(await page.getByRole('spinbutton', { name: 'Quantity of Jerk Chicken' }).inputValue() === '1', 'no increment')
})
await t('B3', 'Typed quantities: huge capped, negative, decimal, empty', async () => {
  await fresh(page); await toMenu(page)
  const q = page.getByRole('spinbutton', { name: 'Quantity of Jerk Chicken' }); const out = []
  for (const v of ['99999', '-3', '2.5', '']) { await q.fill(v); out.push(`${JSON.stringify(v)}->${await q.inputValue()}`) }
  return out.join(' | ')
})
await t('B4', 'Dietary filters narrow the list; no-match message', async () => {
  await fresh(page); await toMenu(page)
  const g = page.getByRole('group', { name: 'Show only' })
  await g.getByRole('button', { name: 'Vegan' }).click()
  expect(await page.getByRole('spinbutton').count() === 2, 'vegan entrees != 2')
  await g.getByRole('button', { name: 'Dairy-free' }).click()
  expect(await page.getByText('No items match').count() === 1, 'no empty message')
})
await t('B5', 'Menu tabs work with arrow keys', async () => {
  await fresh(page); await toMenu(page); await page.getByRole('tab', { name: 'Entrees' }).focus(); await page.keyboard.press('ArrowRight')
  expect(await page.getByRole('tab', { name: 'Sides' }).getAttribute('aria-selected') === 'true', 'Sides not selected')
})
await t('B6', 'Suggestions: appear only on request; apply and undo', async () => {
  await fresh(page); await toMenu(page)
  expect(await page.getByText(/Suggested for/).count() === 0, 'shown unasked')
  await suggest(page); expect((await page.getByTestId('coverage').textContent()).includes('everyone covered'), 'not applied')
  await btn(page, 'Undo').click(); expect((await page.getByTestId('coverage').textContent()).includes('40 more'), 'undo failed')
})
await t('B7', 'Item descriptions match Pearl Island wording', async () => {
  await fresh(page); await toMenu(page); await page.getByText('About this item').first().click()
  expect(await page.getByText(/award-winning slow roasted pork/i).isVisible(), 'description missing')
})
await t('B8', 'Prices formatted per serving', async () => {
  await fresh(page); await toMenu(page); await page.getByRole('tab', { name: 'Sides' }).click()
  expect(await page.getByText('$2.76 per serving').count() > 0, 'rice price format')
})

// ---------- C. Supplies
await t('C1', 'Supplies required; none enables; add-with-nothing blocked', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await toSupplies(page)
  expect(await btn(page, 'Continue to details').isDisabled(), 'enabled before choice')
  await page.getByRole('radio', { name: 'Add supplies' }).check()
  expect(await btn(page, 'Continue to details').isDisabled(), 'enabled with no supply chosen')
  await noSupplies(page); expect(!(await btn(page, 'Continue to details').isDisabled()), 'still disabled after none')
})
await t('C2', 'Supply pricing: per-person x guests; switching to none removes it', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await toSupplies(page)
  const before = await total(page)
  await page.getByRole('radio', { name: 'Add supplies' }).check(); await page.getByRole('checkbox', { name: 'Add Plates & Cutlery' }).check()
  expect(await total(page) === '$672.90', 'expected $672.90 got ' + await total(page))
  await noSupplies(page); expect(await total(page) === before, 'supplies not cleared')
})

// ---------- D. Details
await t('D1', 'Blank pickup time and blank name are rejected', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await toSupplies(page); await noSupplies(page); await toDetails(page)
  await page.getByLabel('Pickup time').fill(''); await btn(page, 'Review your request').click()
  expect(page.url().endsWith('/customer/details'), 'accepted blank time')
  await page.getByLabel('Pickup time').fill('12:00'); await page.getByLabel('Your name').fill(''); await btn(page, 'Review your request').click()
  expect(page.url().endsWith('/customer/details'), 'accepted blank name')
})
await t('D2', 'Markup in text fields is shown as text, not run', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await toSupplies(page); await noSupplies(page); await toDetails(page)
  await page.getByLabel('Is there anything else we should know about your order?').fill('<img src=x onerror="window.__xss=1"><b>bold</b>')
  await toReview(page)
  expect(await page.evaluate(() => window.__xss) === undefined, 'script executed')
  expect(await page.getByText('<b>bold</b>', { exact: false }).count() > 0, 'markup not shown literally')
})
await t('D3', 'Very long unbroken text does not break the layout', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await toSupplies(page); await noSupplies(page); await toDetails(page)
  await page.getByLabel('Is there anything else we should know about your order?').fill('A'.repeat(400))
  await page.getByLabel('Would you like to request an item that isn\'t on the menu?').fill('B'.repeat(400))
  await toReview(page)
  expect(!(await overflow(page)), 'horizontal overflow on review')
  await submit(page); await page.getByRole('link', { name: 'Staff', exact: true }).first().click()
  expect(!(await overflow(page)), 'horizontal overflow on staff page')
})

// ---------- E. Review and submit
await t('E1', 'Edit links go to the right stage and keep the menu', async () => {
  await toReviewFlow(page); await page.getByRole('button', { name: 'Edit' }).first().click()
  await page.waitForURL('**/customer'); await page.waitForTimeout(150); await btn(page, 'Choose your menu').click(); await page.waitForURL('**/customer/menu'); await page.waitForTimeout(150)
  expect((await page.getByTestId('coverage').textContent()).includes('everyone covered'), 'menu lost after editing event')
})
await t('E2', 'Double-click on Submit records one submission', async () => {
  await toReviewFlow(page); await btn(page, 'Submit request').dblclick().catch(() => {})
  const s = await stored(page); const n = s.order.history.filter((h) => h.to === 'submitted' || h.to === 'needs_review').length
  expect(n === 1, 'submissions recorded: ' + n)
})
await t('E3', 'After submit, going back to edit pages is redirected to review', async () => {
  await page.goto(BASE + '/customer/menu'); await page.waitForTimeout(400); expect(page.url().endsWith('/customer/review'), 'not redirected: ' + page.url())
})
await t('E4', 'Refresh keeps the submitted request; Start over resets', async () => {
  await page.reload(); expect(await page.getByRole('heading', { level: 1, name: 'Request recorded.' }).count() === 1, 'lost on refresh')
  await btn(page, 'Start over').click(); await page.waitForTimeout(500); expect(page.url().endsWith('/customer'), 'Start over landed on ' + page.url())
  expect((await stored(page)).order.status === 'draft', 'not reset')
})

// ---------- F. Navigation
await t('F1', 'Deep links and unknown URLs are handled', async () => {
  await fresh(page); await page.goto(BASE + '/customer/supplies'); await page.waitForTimeout(400); expect(page.url().endsWith('/customer/menu'), 'supplies deep link -> ' + page.url())
  await page.goto(BASE + '/nope'); await page.waitForTimeout(400); expect(page.url().endsWith('/customer'), '/nope -> ' + page.url())
})
await t('F2', 'Browser back/forward and logo link', async () => {
  await fresh(page); await toMenu(page); await page.goBack(); expect(page.url().endsWith('/customer'), 'back failed')
  await page.goForward(); expect(page.url().endsWith('/customer/menu'), 'forward failed')
  await page.getByRole('link', { name: 'Pearl Island Catering' }).click(); expect(page.url().endsWith('/customer'), 'logo link')
})
await t('F3', 'Skip link is first tab stop and moves focus to main', async () => {
  await fresh(page); await page.keyboard.press('Tab')
  expect((await page.evaluate(() => document.activeElement?.textContent)) === 'Skip to main content', 'skip link not first')
  await page.keyboard.press('Enter'); expect(await page.evaluate(() => document.activeElement?.id) === 'main', 'focus not on main')
})

// ---------- G. Scenarios
await t('G1', 'Unusual scenario: flags shown, routes to Needs review, visible to staff', async () => {
  await toReviewFlow(page, 'unusual'); expect(await page.getByText(/over the 50-guest limit/).count() > 0, 'no large-order flag on review')
  await submit(page); expect((await stored(page)).order.status === 'needs_review', 'status not needs_review')
  await page.getByRole('link', { name: 'Staff', exact: true }).first().click()
  expect(await page.getByText(/over the 50-guest limit/).count() > 0, 'flag missing on staff page')
})
await t('G2', 'Switching scenario or pressing Reset mid-journey clears the order', async () => {
  await fresh(page); await toMenu(page); await suggest(page); await page.getByLabel('Scenario').selectOption('unusual')
  expect((await stored(page)).order.lines.length === 0, 'lines kept after scenario switch')
  await suggest(page); await btn(page, 'Reset').click(); expect((await stored(page)).order.lines.length === 0, 'lines kept after Reset')
})

// ---------- H. Staff
await t('H1', 'Staff and handoff empty states', async () => {
  await fresh(page); await page.goto(BASE + '/staff'); expect(await page.getByText('No requests yet.').count() === 1, 'staff empty')
  await page.goto(BASE + '/handoff'); expect(await page.getByText('Nothing to hand off yet.').count() === 1, 'handoff empty')
})
await t('H2', 'Ask customer: draft, simulated send, log; accept still works', async () => {
  await toReviewFlow(page); await submit(page); await page.getByRole('link', { name: 'Staff', exact: true }).first().click()
  await btn(page, 'Ask customer a question').click(); expect(await btn(page, 'Simulate send').isDisabled(), 'empty draft sendable')
  await page.getByLabel('Question for the customer').fill('Can pickup move to 11:30?'); await btn(page, 'Simulate send').click()
  expect(await page.getByText(/Nothing was sent to the customer/).count() > 0, 'no simulated notice')
  expect(await page.getByText(/Can pickup move to 11:30/).count() > 0, 'message not logged')
  await btn(page, 'Accept request').click(); expect((await stored(page)).order.status === 'confirmed', 'accept failed')
})
await t('H3', 'Edit request: revise, accept blocked, customer approves, accept works, edit locks', async () => {
  await toReviewFlow(page); await submit(page); await page.getByRole('link', { name: 'Staff', exact: true }).first().click()
  await btn(page, 'Edit request').click(); expect(await btn(page, 'Save changes').isDisabled(), 'save enabled unchanged')
  await page.getByRole('button', { name: 'Increase quantity of Sous Poulet Chicken' }).click(); await btn(page, 'Save changes').click()
  expect(await btn(page, 'Accept request').isDisabled(), 'accept enabled before approval')
  await page.getByRole('link', { name: 'Customer', exact: true }).first().click(); await page.waitForURL('**/customer/review'); await page.waitForTimeout(150)
  await btn(page, 'Approve changes').click()
  await page.getByRole('link', { name: 'Staff', exact: true }).first().click(); await btn(page, 'Accept request').click()
  expect((await stored(page)).order.status === 'confirmed', 'not confirmed')
  expect(await btn(page, 'Edit request').isDisabled(), 'edit enabled after accept')
})
await t('H4', 'Assistants (customer and staff) are inert', async () => {
  await toReviewFlow(page); await submit(page); await page.getByRole('link', { name: 'Staff', exact: true }).first().click()
  const a = page.getByRole('region', { name: /staff assistant/i }); expect(await a.locator('input:not([disabled])').count() === 0, 'enabled input'); expect(await a.locator('button:not([disabled])').count() === 0, 'enabled button')
})

// ---------- I. Cross-cutting
await t('I1', 'Corrupt saved state does not crash the app', async () => {
  await fresh(page); await page.evaluate(() => localStorage.setItem('pi2go-demo', '{not json')); await page.reload()
  expect(await page.getByRole('heading', { level: 1 }).count() === 1, 'garbage JSON: app did not render')
  await page.evaluate(() => localStorage.setItem('pi2go-demo', JSON.stringify({ state: { order: null }, version: 2 }))); await page.reload()
  expect(await page.getByRole('heading', { level: 1 }).count() === 1, 'order:null state: app did not render')
})
await t('I2', 'Production build serves deep links', async () => {
  const p = await newPage(browser); const r = await p.goto('http://127.0.0.1:4173/customer/menu'); expect(r.status() === 200, 'status ' + r.status())
  expect(await p.getByRole('heading', { level: 1 }).count() === 1, 'no h1 in production build'); await p.context().close()
})

// widths
const widthIssues = []
for (const width of [320, 768, 1024]) {
  const p = await newPage(browser, { width, height: 800 })
  const check = async (label) => { if (await overflow(p)) widthIssues.push(`${width}px ${label}`) }
  await fresh(p); await check('event'); await toMenu(p); await suggest(p); await check('menu')
  await toSupplies(p); await p.getByRole('radio', { name: 'Add supplies' }).check(); await check('supplies'); await noSupplies(p)
  await toDetails(p); await check('details'); await toReview(p); await check('review'); await submit(p); await check('submitted')
  await p.getByRole('link', { name: 'Staff', exact: true }).first().click(); await check('staff'); await btn(p, 'Edit request').click(); await check('staff-edit')
  await p.context().close()
}
results.push({ id: 'I3', name: 'No horizontal overflow at 320/768/1024px', status: widthIssues.length ? 'FAIL' : 'PASS', note: widthIssues.join('; ') })

// touch targets on mobile
{
  const p = await newPage(browser, { width: 390, height: 844 }); await fresh(p); await toMenu(p); await suggest(p)
  const small = await p.evaluate(() => [...document.querySelectorAll('button,a,input,select,textarea,summary,[role=tab]')]
    .filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.visibility !== 'hidden' && !e.disabled && (r.height < 44 || r.width < 44) && e.type !== 'checkbox' && e.type !== 'radio' })
    .map((e) => `${(e.getAttribute('aria-label') || e.textContent || e.id || e.tagName).trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`))
  results.push({ id: 'I4', name: 'Touch targets >= 44px on mobile menu page', status: small.length ? 'WARN' : 'PASS', note: small.slice(0, 8).join('; ') + (small.length > 8 ? ` (+${small.length - 8} more)` : '') })
  await p.context().close()
}

// axe accessibility audit across screens
const axeRows = []
{
  const p = await newPage(browser)
  const audit = async (label) => {
    const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    for (const v of r.violations) axeRows.push(`${label}: ${v.id} (${v.impact}) x${v.nodes.length} - ${v.nodes[0].target.join(' ').slice(0, 60)}`)
  }
  await fresh(p); await audit('event'); await toMenu(p); await suggest(p); await audit('menu')
  await toSupplies(p); await p.getByRole('radio', { name: 'Add supplies' }).check(); await audit('supplies'); await noSupplies(p)
  await toDetails(p); await audit('details'); await toReview(p); await audit('review'); await submit(p); await audit('submitted')
  await p.getByRole('link', { name: 'Staff', exact: true }).first().click(); await audit('staff')
  await btn(p, 'Accept request').click(); await p.getByRole('link', { name: 'View handoff summary' }).click(); await audit('handoff')
  await p.goto(BASE + '/gallery'); await audit('gallery')
  await p.context().close()
}
results.push({ id: 'I5', name: 'Automated accessibility audit (axe, WCAG 2.1 A/AA) on 9 screens', status: axeRows.length ? 'FAIL' : 'PASS', note: axeRows.join(' || ') })

await browser.close()
console.log(JSON.stringify({ results, problems: [...problems] }, null, 1))
