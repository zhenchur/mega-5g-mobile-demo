import { useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { bindStepSwipe } from '../../interactions/stepSwipe'

// Keep the existing two-page stack layout; gesture recognition is shared.
const STACK_STEP = 8
const MAX_PAGE = 1

gsap.registerPlugin(useGSAP)

export function useStackSwipe(viewportRef: RefObject<HTMLElement | null>, cardSelector: string) {
  const pageRef = useRef(0)
  const goToPageRef = useRef<(page: number, animate?: boolean) => void>(() => undefined)
  const [page, setPage] = useState(0)

  useGSAP(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const media = gsap.matchMedia()
    media.add({
      mobile: '(max-width: 767px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      if (!context.conditions?.mobile) return
      const reduceMotion = context.conditions.reduceMotion
      const cards = Array.from(viewport.querySelectorAll<HTMLElement>(cardSelector))
      if (!cards.length) return

      const measureStep = () => Number.parseFloat(getComputedStyle(cards[0]).width)
        + Number.parseFloat(getComputedStyle(viewport).columnGap)
      let cardStep = measureStep()
      viewport.scrollLeft = 0

      // Bind event tweens to this media context; the outer hook context would
      // create a parent/child context cycle during StrictMode cleanup.
      const goToPage = context.add('goToPage', (requestedPage: number, animate = true) => {
        const nextPage = gsap.utils.clamp(0, MAX_PAGE, Math.round(requestedPage))
        if (animate && nextPage === pageRef.current) return
        const stackTravel = cardStep - STACK_STEP
        const stackAnchorOffset = -nextPage * STACK_STEP

        pageRef.current = nextPage
        setPage(nextPage)
        gsap.killTweensOf(cards)

        const target = {
          x: (index: number) => index <= nextPage
            ? -stackTravel * index + stackAnchorOffset
            : -stackTravel * nextPage + stackAnchorOffset,
          scale: (index: number) => 1 - Math.max(0, nextPage - index) * 0.06,
          autoAlpha: (index: number) => index === nextPage - 1 ? 0.5 : 1,
        }

        if (reduceMotion || !animate) {
          gsap.set(cards, target)
        } else {
          gsap.to(cards, { ...target, duration: 0.52, ease: 'power3.out', overwrite: true })
        }
      }) as (requestedPage: number, animate?: boolean) => void

      goToPageRef.current = goToPage
      goToPage(pageRef.current, false)

      const unbindSwipe = bindStepSwipe(viewport, {
        preferTouchEvents: true,
        onStep: direction => goToPage(pageRef.current + direction),
      })

      let resizeFrame = 0
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame)
        resizeFrame = requestAnimationFrame(() => {
          cardStep = measureStep()
          goToPage(pageRef.current, false)
        })
      })
      resizeObserver.observe(viewport)

      return () => {
        unbindSwipe()
        resizeObserver.disconnect()
        cancelAnimationFrame(resizeFrame)
        gsap.killTweensOf(cards)
        gsap.set(cards, { clearProps: 'transform,opacity,visibility' })
        goToPageRef.current = () => undefined
      }
    })

    return () => media.revert()
  }, { scope: viewportRef, dependencies: [cardSelector], revertOnUpdate: true })

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let nextPage: number | null = null
    if (event.key === 'ArrowRight') nextPage = pageRef.current + 1
    if (event.key === 'ArrowLeft') nextPage = pageRef.current - 1
    if (event.key === 'Home') nextPage = 0
    if (event.key === 'End') nextPage = MAX_PAGE
    if (nextPage === null) return
    event.preventDefault()
    goToPageRef.current(nextPage)
  }

  return { page, onKeyDown, selectPage: (nextPage: number) => goToPageRef.current(nextPage) }
}
