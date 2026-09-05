import { test, expect, ready, show, touchDrag } from './support'

const boost = '.mf-mobile-boost__viewport'
const durations = '.mf-mobile-profile__durations'
const radio = '.mf-mobile-duration input'
const secondPage = '.mf-mobile-boost__pagination button:nth-child(2)'
const scrollLeft = (page: import('@playwright/test').Page) => page.locator(durations).evaluate(element => element.scrollLeft)

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Only the mobile layout has swipe galleries')
  await ready(page)
})

for (const viewport of [boost, durations]) {
  test(`releasing outside before axis lock cannot turn hover into a swipe: ${viewport}`, async ({ page }) => {
    await show(page, viewport)
    const rect = (await page.locator(viewport).boundingBox())!
    // Leave before the 10px axis lock; there is no explicit pointer capture.
    await page.mouse.move(rect.x + rect.width - 2, rect.y + 50)
    await page.mouse.down()
    await page.mouse.move(rect.x + rect.width + 2, rect.y + 50)
    await page.mouse.up()
    await page.mouse.move(rect.x + 20, rect.y + 50)
    await page.waitForTimeout(650)
    await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
    expect(await scrollLeft(page)).toBe(0)
    await expect(page.locator(radio).first()).toBeChecked()
  })
}

test('boost supports discrete touch swipes, threshold, pagination and keyboard', async ({ page }) => {
  await show(page, boost)
  await touchDrag(page, boost, -18)
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
  await touchDrag(page, boost, -100)
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'true')
  await touchDrag(page, boost, 100)
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
  await page.locator(secondPage).tap()
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'true')
  await page.locator(boost).focus()
  await page.keyboard.press('Home')
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('End')
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
})

test('duration swipe advances one fixed step without selecting; tap and keyboard select', async ({ page }) => {
  await show(page, durations)
  await touchDrag(page, durations, -18)
  expect(await scrollLeft(page)).toBe(0)
  await touchDrag(page, durations, -40)
  const shortStep = await scrollLeft(page)
  expect(shortStep).toBeGreaterThan(0)
  await expect(page.locator(radio).first()).toBeChecked()
  await touchDrag(page, durations, 40)
  expect(await scrollLeft(page)).toBe(0)
  await touchDrag(page, durations, -160)
  expect(Math.abs(await scrollLeft(page) - shortStep)).toBeLessThan(1)
  await expect(page.locator(radio).first()).toBeChecked()
  await touchDrag(page, durations, 160)

  // The drag above must suppress its click but not swallow the next real tap.
  await page.locator('.mf-mobile-duration').nth(1).tap()
  await expect(page.locator(radio).nth(1)).toBeChecked()
  await expect.poll(() => scrollLeft(page)).toBeCloseTo(shortStep, 0)
  await page.keyboard.press('End')
  await expect(page.locator(radio).nth(2)).toBeChecked()
  await page.keyboard.press('Home')
  await expect(page.locator(radio).first()).toBeChecked()
  await expect.poll(() => scrollLeft(page)).toBe(0)
})

for (const viewport of [boost, durations]) {
  test(`vertical touch keeps native page scrolling: ${viewport}`, async ({ page }) => {
    await show(page, viewport)
    const before = await page.evaluate(() => scrollY)
    await touchDrag(page, viewport, -8, -150)
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before + 50)
    expect(await scrollLeft(page)).toBe(0)
    await expect(page.locator(secondPage)).toHaveAttribute('aria-pressed', 'false')
  })
}
