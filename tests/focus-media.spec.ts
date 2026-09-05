import { test, expect, ready, scrollTo, show, visibleThroughAncestors } from './support'

test('focused duration survives media recreation and layout refresh, then resets and replays', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const card = page.locator(mobile ? '.mf-mobile-profile--premium' : '.desktop-profile-card--timed')
  const radio = card.locator('input[type="radio"]').first()
  const rowSelector = mobile ? '.mf-mobile-profile__durations' : '.desktop-profile-card__duration-group'
  const nested = page.locator(mobile ? '.mf-mobile-duration__rise' : '.desktop-profile-card__duration-rise')
  const assertFocusedSurface = async () => {
    await expect(radio).toBeFocused()
    await expect.poll(() => visibleThroughAncestors(radio)).toBeGreaterThan(0.99)
    const transform = await card.evaluate(element => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)
      const rise = new DOMMatrixReadOnly(getComputedStyle(element.parentElement!).transform)
      return { rotationTerms: [matrix.m23, matrix.m32], scaleY: matrix.m22, depth: matrix.m43, rise: rise.m42 }
    })
    // Opacity alone missed the original stale -68deg / -36px start state.
    expect(transform.rotationTerms.every(value => Math.abs(value) < 0.001)).toBe(true)
    expect(transform.scaleY).toBeCloseTo(1, 3)
    expect(transform.depth).toBeCloseTo(0, 3)
    expect(transform.rise).toBeCloseTo(0, 3)
    for (const item of await nested.all()) {
      expect(await item.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBeCloseTo(0, 3)
    }
  }

  await ready(page)
  const pins = await page.locator('.pin-spacer').count()
  await radio.focus()
  await scrollTo(page, 0)
  await assertFocusedSurface()
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
    await assertFocusedSurface()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await expect(page.locator('.pin-spacer')).toHaveCount(pins)
    await assertFocusedSurface()
  }

  const viewport = page.viewportSize()!
  await page.setViewportSize({ ...viewport, height: viewport.height - 80 })
  // ScrollTrigger debounces native resize; inspect after the geometry refresh.
  await page.waitForTimeout(400)
  await assertFocusedSurface()
  await radio.scrollIntoViewIfNeeded()
  await assertFocusedSurface()
  await page.screenshot({ path: info.outputPath('focused-card-after-media.png') })

  await scrollTo(page, 0)
  await radio.evaluate(element => (element as HTMLElement).blur())
  await expect.poll(() => visibleThroughAncestors(card)).toBeLessThan(0.01)
  for (const item of await nested.all()) await expect(item).toHaveCSS('opacity', '0')
  await show(page, rowSelector)
  await expect.poll(() => visibleThroughAncestors(card)).toBeGreaterThan(0.99)
  for (const item of await nested.all()) {
    await expect.poll(() => visibleThroughAncestors(item)).toBeGreaterThan(0.99)
  }
})
