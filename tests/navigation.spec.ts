import { test, expect, ready, selectors, scrollTo, show, visibleThroughAncestors } from './support'

test('Tab reaches the first profile and nested duration controls from the promo', async ({ page }, info) => {
  const s = selectors(info.project.name === 'mobile')
  await ready(page)
  await page.locator(s.hero).focus()
  await page.keyboard.press('Tab')
  const firstProfileAction = page.locator(s.primary).first()
  await expect(firstProfileAction).toBeFocused()
  await expect.poll(() => visibleThroughAncestors(firstProfileAction)).toBeGreaterThan(0.99)

  let reachedRadio = false
  for (let index = 0; index < 18; index++) {
    await page.keyboard.press('Tab')
    reachedRadio = await page.locator(s.duration).evaluateAll(inputs => inputs.some(input => input === document.activeElement))
    if (reachedRadio) break
  }
  expect(reachedRadio, 'The duration fieldset must stay in the natural Tab order').toBe(true)
  const radio = page.locator(s.duration).first()
  await expect(radio).toBeFocused()
  await expect.poll(() => visibleThroughAncestors(radio)).toBeGreaterThan(0.99)
  await page.keyboard.press('ArrowRight')
  await expect(page.locator(s.duration).nth(1)).toBeChecked()
  await expect.poll(() => visibleThroughAncestors(page.locator(s.duration).nth(1))).toBeGreaterThan(0.99)
})

test('focused duration stays visible during reverse; blur resets and scrolling back replays it', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const s = selectors(mobile)
  const card = page.locator(mobile ? '.mf-mobile-profile--premium' : '.desktop-profile-card--timed')
  const row = mobile ? '.mf-mobile-profile__durations' : '.desktop-profile-card__duration-group'
  const nested = page.locator(mobile ? '.mf-mobile-duration__rise' : '.desktop-profile-card__duration-rise')
  const radio = page.locator(s.duration).first()
  await ready(page)
  await radio.focus()
  await expect(radio).toBeFocused()
  await expect.poll(() => visibleThroughAncestors(radio)).toBeGreaterThan(0.99)

  await scrollTo(page, 0)
  await expect(radio).toBeFocused()
  await expect.poll(() => visibleThroughAncestors(radio)).toBeGreaterThan(0.99)
  await radio.evaluate(element => (element as HTMLElement).blur())
  await expect(radio).not.toBeFocused()
  await expect.poll(() => visibleThroughAncestors(card)).toBeLessThan(0.01)
  for (const item of await nested.all()) await expect(item).toHaveCSS('opacity', '0')

  await show(page, row)
  await expect.poll(() => visibleThroughAncestors(card)).toBeGreaterThan(0.99)
  for (const item of await nested.all()) {
    await expect.poll(() => visibleThroughAncestors(item)).toBeGreaterThan(0.99)
  }
})

for (const target of ['profiles', 'connect'] as const) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`fresh #${target} navigation resolves after React mounts (${reducedMotion})`, async ({ page }, info) => {
      const s = selectors(info.project.name === 'mobile')
      await page.emulateMedia({ reducedMotion })
      await ready(page, '/' + s[target])
      await expect.poll(async () => Math.abs(await page.locator(s[target]).evaluate(element => element.getBoundingClientRect().top) - s.header))
        .toBeLessThan(2)
    })
  }
}

test('reload preserves the restored position after scrolling away from a hash target', async ({ page }, info) => {
  const s = selectors(info.project.name === 'mobile')
  await ready(page, '/' + s.connect)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1_000)
  await scrollTo(page, 180, 500)
  const previous = await page.evaluate(() => scrollY)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  expect(await page.evaluate(() => location.hash)).toBe(s.connect)
  expect(Math.abs(await page.evaluate(() => scrollY) - previous)).toBeLessThan(3)
})
