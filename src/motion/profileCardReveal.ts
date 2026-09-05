import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CARD_REVEAL_TIMING, createCardReveal, NESTED_CARD_REVEAL } from './cardReveal'
import { completeOnFocus } from './completeOnFocus'

type ProfileCardRevealOptions = {
  slot: HTMLElement
  rise: HTMLElement
  card: HTMLElement
  id: string
  start: string
  nestedItems: HTMLElement[]
  nestedScope: HTMLElement | null
  nestedId: string
  // Tall mobile cards wait for the inner row to enter the viewport as well.
  nestedViewportRatio?: number
  nestedTriggerId?: string
}

function layoutTop(element: HTMLElement) {
  let top = 0
  let current: HTMLElement | null = element
  while (current) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return top
}

/** Parent entrance plus an independent, staggered inner row. Run in a GSAP context. */
export function createProfileCardReveal({
  slot, rise, card, id, start, nestedItems, nestedScope, nestedId,
  nestedViewportRatio, nestedTriggerId,
}: ProfileCardRevealOptions) {
  const nestedReveal = nestedItems.length && nestedScope
    ? gsap.timeline({ id: nestedId, paused: true })
    : null

  nestedItems.forEach((item, index) => {
    nestedReveal?.fromTo(item, {
      y: NESTED_CARD_REVEAL.rise,
      opacity: 0,
      pointerEvents: 'none',
    }, {
      y: 0,
      opacity: 1,
      pointerEvents: 'auto',
      ...CARD_REVEAL_TIMING,
      immediateRender: true,
      clearProps: 'pointerEvents',
    }, index * NESTED_CARD_REVEAL.stagger)
  })

  let nestedStarted = false
  const resetNested = () => {
    if (nestedScope?.contains(document.activeElement)) return
    nestedStarted = false
    nestedReveal?.pause(0)
  }

  const parentReveal = createCardReveal({
    items: [{ rise, card }],
    scrollTrigger: {
      id, trigger: slot, start,
      toggleActions: 'play none none reverse',
      onLeaveBack: nestedReveal ? resetNested : undefined,
    },
  })

  if (!nestedReveal || !nestedScope) return

  let nestedTrigger: ScrollTrigger | null = null
  const revealNested = () => {
    const withinViewport = nestedViewportRatio === undefined
      || (nestedTrigger && nestedTrigger.scroll() >= nestedTrigger.start)
    if (!nestedStarted && !parentReveal.reversed()
      && parentReveal.progress() >= NESTED_CARD_REVEAL.parentProgress && withinViewport) {
      nestedStarted = true
      nestedReveal.play(0)
    }
  }

  if (nestedViewportRatio !== undefined) {
    nestedTrigger = ScrollTrigger.create({
      id: nestedTriggerId,
      trigger: slot,
      // Layout offsets exclude the parent's animated rise/rotation.
      start: () => layoutTop(nestedScope) - window.innerHeight * nestedViewportRatio,
      end: '+=1',
      invalidateOnRefresh: true,
      onEnter: revealNested,
      onLeaveBack: resetNested,
    })
  }

  const updateParent = parentReveal.eventCallback('onUpdate')
  parentReveal.eventCallback('onUpdate', () => {
    updateParent?.()
    revealNested()
  })
  completeOnFocus(nestedReveal, [nestedScope], {
    onFocus: () => { nestedStarted = true },
    onLeave: () => {
      // Leaving the viewport while focused defers the reset. Recheck after
      // blur because onLeaveBack has already fired by this point.
      const trigger = nestedTrigger ?? parentReveal.scrollTrigger
      if (trigger && trigger.scroll() < trigger.start) resetNested()
    },
  })
  revealNested()
}
