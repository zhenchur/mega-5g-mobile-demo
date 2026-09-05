import { test, expect, ready, selectors, scrollTo, layoutTop, visibleThroughAncestors } from './support'

test('both technology cards are visible after scrolling in either direction and restoring motion', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const cards = page.locator(mobile ? '.mf-mobile-technology' : '.desktop-intro__technology')
  await ready(page)
  await expect(cards).toHaveCount(2)

  for (const reducedMotion of ['no-preference', 'reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion })
    await scrollTo(page, 750)
    await scrollTo(page, 550)
    for (const card of await cards.all()) {
      await expect(card).toBeInViewport()
      await expect.poll(() => visibleThroughAncestors(card)).toBeGreaterThan(0.99)
    }
  }
})

test('the first profile reveals at the approved viewport line and reverses above it', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const s = selectors(mobile)
  await ready(page)
  const slot = page.locator(s.profileSlot).first()
  const card = page.locator(s.profile).first()
  const trigger = await layoutTop(slot) - page.viewportSize()!.height * (mobile ? 0.95 : 0.85)
  await scrollTo(page, trigger - 18)
  expect(await visibleThroughAncestors(card)).toBeLessThan(0.01)
  await scrollTo(page, trigger + 18, 150)
  const entering = await visibleThroughAncestors(card)
  expect(entering).toBeGreaterThan(0)
  expect(entering).toBeLessThan(1)
  await expect.poll(() => visibleThroughAncestors(card)).toBeGreaterThan(0.99)
  await scrollTo(page, trigger - 18)
  expect(await visibleThroughAncestors(card)).toBeLessThan(0.01)
})

test('sections remain joined during continuous forward and backward scrolling', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const s = selectors(mobile)
  await ready(page)
  await page.evaluate(({ surface, profiles }) => {
    const surfaceElement = document.querySelector(surface)!
    const nextSection = document.querySelector(profiles)!
    const sample = { running: true, gaps: [] as number[], widths: [] as number[] }
    Object.assign(window, { seamSample: sample })
    const frame = () => {
      if (!sample.running) return
      const bounds = surfaceElement.getBoundingClientRect()
      sample.gaps.push(nextSection.getBoundingClientRect().top - bounds.bottom)
      sample.widths.push(bounds.width)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, s)
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(1_250)
  await page.mouse.wheel(0, -900)
  await page.waitForTimeout(1_250)
  const sample = await page.evaluate(() => {
    const sample = (window as typeof window & {
      seamSample: { running: boolean; gaps: number[]; widths: number[] }
    }).seamSample
    sample.running = false
    return sample
  })
  expect(sample.gaps.length).toBeGreaterThan(10)
  expect(Math.max(...sample.gaps.map(Math.abs))).toBeLessThan(0.2)
  expect(Math.max(...sample.widths) - Math.min(...sample.widths)).toBeLessThan(0.2)
  if (mobile) {
    await expect(page.locator(s.surface)).toHaveCSS('transform', 'none')
    await expect(page.locator(s.surface)).toHaveCSS('position', 'relative')
  }
})

test('reduced motion and tablet transitions clean up pins and preserve usable controls', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  const s = selectors(mobile)
  await ready(page)
  const initialPins = await page.locator('.pin-spacer').count()
  expect(initialPins).toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect.poll(() => visibleThroughAncestors(page.locator(s.primary).first())).toBeGreaterThan(0.99)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.pin-spacer')).toHaveCount(initialPins)
  await page.setViewportSize({ width: 1_024, height: 800 })
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator(s.hero)).toHaveCount(0)
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1_280, height: 720 })
  await expect(page.locator(s.hero)).toHaveCount(1)
  await expect(page.locator('.pin-spacer')).toHaveCount(initialPins)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width)
})

test('layout width matrix has no horizontal page overflow or broken assets', async ({ page }, info) => {
  const widths = info.project.name === 'mobile' ? [320, 360, 390, 430, 767] : [1_280, 1_440, 1_920]
  await ready(page)
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 })
    await page.waitForTimeout(400)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}px`).toBe(width)
  }
  expect(await page.evaluate(() => Array.from(document.images)
    .filter(image => !image.complete || image.naturalWidth === 0)
    .map(image => image.getAttribute('src')))).toEqual([])
})
