import gsap from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

export const CARD_REVEAL_TIMING = {
  duration: 0.84,
  ease: 'power3.out',
} as const

export const CARD_REVEAL_RISE = 120
export const NESTED_CARD_REVEAL = { rise: 32, stagger: 0.08, parentProgress: 0.3 } as const

type CardRevealItem = {
  rise: HTMLElement
  card: HTMLElement
}

type CardRevealOptions = {
  items: CardRevealItem[]
  scrollTrigger: ScrollTrigger.Vars
  stagger?: number
}

// Call inside useGSAP/matchMedia so the timeline and both transform layers
// are reverted together. The trigger must be a separate, unanimated slot.
export function createCardReveal({ items, scrollTrigger, stagger = 0 }: CardRevealOptions) {
  const timeline = gsap.timeline({ scrollTrigger })

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
      autoAlpha: 0,
      rotationX: -68,
      z: -36,
      transformPerspective: 900,
      transformOrigin: '50% 0%',
      willChange: 'transform,opacity',
    }, {
      autoAlpha: 1,
      rotationX: 0,
      z: 0,
      transformPerspective: 900,
      ...CARD_REVEAL_TIMING,
      immediateRender: true,
      clearProps: 'willChange',
    }, position)
  })

  return timeline
}
