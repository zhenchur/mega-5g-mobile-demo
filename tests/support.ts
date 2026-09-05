import { test as base, expect, type Locator, type Page } from '@playwright/test'

// Surface browser exceptions in every scenario, including cleanup/remount.
export const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await use(errors)
    expect(errors, 'Unhandled browser errors').toEqual([])
  }, { auto: true }],
})
export { expect }

export function selectors(mobile: boolean) {
  return mobile ? {
    hero: '.mf-mobile-hero__button',
    profileSlot: '.mf-mobile-profile-reveal',
    profile: '.mf-mobile-profile',
    primary: '.mf-mobile-profile__connect',
    duration: '.mf-mobile-duration input',
    profiles: '#profiles',
    connect: '#connect',
    surface: '.mf-mobile-benefits',
    tabs: '.mf-mobile-connect-tab',
    panels: '.mf-mobile-connect-panel',
    root: '.mf-mobile-intro',
    header: 56,
  } : {
    hero: '.desktop-intro__hero-cta',
    profileSlot: '.desktop-profile-reveal',
    profile: '.desktop-profile-card',
    primary: '.desktop-profile-card__button--primary',
    duration: '.desktop-profile-card__duration-input',
    profiles: '#desktop-profiles',
    connect: '#desktop-connect',
    surface: '.desktop-intro__surface',
    tabs: '.dl-connect-tab',
    panels: '.dl-connect-panel',
    root: '.desktop-intro',
    header: 101,
  }
}

export async function ready(page: Page, url = '/') {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await document.fonts.ready
    // Decode every asset once so an image load cannot move the target mid-test.
    await Promise.all(Array.from(document.images, async image => {
      image.loading = 'eager'
      await image.decode().catch(() => undefined)
    }))
  })
  await page.waitForTimeout(350)
}

export async function scrollTo(page: Page, y: number, settle = 1_100) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(settle)
}

export async function show(page: Page, selector: string) {
  const y = await page.locator(selector).first().evaluate(element => {
    return element.getBoundingClientRect().top + window.scrollY - 250
  })
  await scrollTo(page, y)
}

// Opacity/visibility on ancestors matter: Playwright's visible flag by itself
// accepts an opacity-zero control and would miss the keyboard regression.
export async function visibleThroughAncestors(locator: Locator) {
  return locator.evaluate(element => {
    let opacity = 1
    let current: Element | null = element
    while (current) {
      const style = getComputedStyle(current)
      if (style.visibility === 'hidden' || style.display === 'none') return 0
      opacity *= Number(style.opacity)
      current = current.parentElement
    }
    return opacity
  })
}

export async function layoutTop(locator: Locator) {
  return locator.evaluate(element => {
    let top = 0
    let current: HTMLElement | null = element as HTMLElement
    while (current) {
      top += current.offsetTop
      current = current.offsetParent as HTMLElement | null
    }
    return top
  })
}

export async function touchDrag(page: Page, selector: string, dx: number, dy = 0) {
  const rect = await page.locator(selector).boundingBox()
  if (!rect) throw new Error('Missing gesture viewport: ' + selector)
  const x = rect.x + (dx < 0 ? rect.width - 35 : 35)
  const y = rect.y + Math.min(65, rect.height / 2)
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
    for (let frame = 1; frame <= 5; frame++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: [{ x: x + dx * frame / 5, y: y + dy * frame / 5, id: 1 }],
      })
      await page.waitForTimeout(18)
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(650)
  } finally {
    await session.detach()
  }
}
