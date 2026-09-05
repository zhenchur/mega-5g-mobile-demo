import gsap from 'gsap'
import { completeOnFocus } from './completeOnFocus'

export const CARD_REVEAL_TIMING = {
  duration: 0.84,
  ease: 'power3.out',
} as const

const CARD_REVEAL_RISE = 120
export const NESTED_CARD_REVEAL = { rise: 32, stagger: 0.08, parentProgress: 0.3 } as const

type CardRevealItem = {
  rise: HTMLElement
  card: HTMLElement
}

type CardRevealOptions = {
  items: CardRevealItem[]
  scrollTrigger: Omit<ScrollTrigger.Vars, 'invalidateOnRefresh'>
  stagger?: number
}

// Call inside useGSAP/matchMedia so the timeline and both transform layers
// are reverted together. The trigger must be a separate, unanimated slot.
export function createCardReveal({ items, scrollTrigger, stagger = 0 }: CardRevealOptions) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      ...scrollTrigger,
      // These tween values are constant; only the trigger geometry changes.
      // Invalidating fromTo during refresh would repaint its hidden start state
      // while the focus handler is completing the same timeline.
      invalidateOnRefresh: false,
    },
  })

  items.forEach(({ rise, card }, index) => {
    const position = index * stagger

    timeline.fromTo(rise, {
      y: CARD_REVEAL_RISE,
      willChange: 'transform',
    }, {
      y: 0,
      ...CARD_REVEAL_TIMING,
      immediateRender: true,
      clearProps: 'willChange',
    }, position)

    timeline.fromTo(card, {
      opacity: 0,
      pointerEvents: 'none',
      rotationX: -68,
      z: -36,
      transformPerspective: 900,
      transformOrigin: '50% 0%',
      willChange: 'transform,opacity',
    }, {
      opacity: 1,
      pointerEvents: 'auto',
      rotationX: 0,
      z: 0,
      transformPerspective: 900,
      ...CARD_REVEAL_TIMING,
      immediateRender: true,
      clearProps: 'willChange,pointerEvents',
    }, position)
  })

  completeOnFocus(timeline, items.map(({ card }) => card))
  return timeline
}
