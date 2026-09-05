import { test, expect, ready, selectors, show } from './support'

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`Connect tabs support rapid reversal, keyboard and inactive panel isolation (${reducedMotion})`, async ({ page }, info) => {
    const mobile = info.project.name === 'mobile'
    const s = selectors(mobile)
    await page.emulateMedia({ reducedMotion })
    await ready(page)
    await show(page, s.connect)
    const tabs = page.locator(s.tabs)
    const panels = page.locator(s.panels)
    const initialHeight = await page.locator(s.connect).evaluate(element => element.clientHeight)
    const assertActive = async (index: number) => {
      await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true')
      await expect(tabs.nth(1 - index)).toHaveAttribute('aria-selected', 'false')
      await expect(panels.nth(index)).toHaveAttribute('aria-hidden', 'false')
      await expect(panels.nth(1 - index)).toHaveAttribute('aria-hidden', 'true')
      await expect.poll(() => panels.nth(index).evaluate(element => (element as HTMLElement).inert)).toBe(false)
      await expect.poll(() => panels.nth(1 - index).evaluate(element => (element as HTMLElement).inert)).toBe(true)
      await expect(panels.nth(index)).toHaveCSS('opacity', '1')
      await expect(panels.nth(1 - index)).toHaveCSS('opacity', '0')
    }
    await tabs.nth(1).click()
    await assertActive(1)
    if (mobile) {
      expect(await page.locator(s.connect).evaluate(element => element.clientHeight)).toBeGreaterThan(initialHeight + 80)
    }
    await tabs.nth(0).click()
    await page.waitForTimeout(50)
    await tabs.nth(1).click()
    await page.waitForTimeout(50)
    await tabs.nth(0).click()
    await assertActive(0)
    await expect.poll(() => page.locator(s.connect).evaluate(element => element.clientHeight)).toBe(initialHeight)
    await tabs.nth(0).focus()
    for (const [key, index] of [['ArrowRight', 1], ['Home', 0], ['End', 1], ['ArrowLeft', 0]] as const) {
      await page.keyboard.press(key)
      await expect(tabs.nth(index)).toBeFocused()
      await assertActive(index)
    }
    await page.keyboard.press('Tab')
    expect(await panels.nth(0).evaluate(element => element.contains(document.activeElement))).toBe(true)
    expect(await panels.nth(1).evaluate(element => element.contains(document.activeElement))).toBe(false)
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 800 })
      await tabs.nth(1).click()
      await assertActive(1)
      const customerHeight = () => panels.nth(1).evaluate(element => (element as HTMLElement).offsetHeight)
      const containerHeight = () => page.locator('.mf-mobile-connect-panels')
        .evaluate(element => (element as HTMLElement).offsetHeight)
      await expect.poll(async () => (await containerHeight()) - (await customerHeight())).toBe(0)
      await page.setViewportSize({ width: 320, height: 800 })
      await expect.poll(async () => (await containerHeight()) - (await customerHeight())).toBe(0)
      await assertActive(1)
    }
  })
}
