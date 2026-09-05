import { useEffect, useRef, type RefObject } from 'react'
import { bindStepSwipe } from '../../interactions/stepSwipe'

// Taps and swipes share the same card-aligned scroll positions.
export function useHorizontalSlider(viewportRef: RefObject<HTMLElement | null>, cardSelector: string) {
  const targetIndexRef = useRef(0)
  const scrollToCardRef = useRef<(index: number, animate?: boolean) => void>(() => undefined)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const cards = Array.from(viewport.querySelectorAll<HTMLElement>(cardSelector))
    if (!cards.length) return
    const getTarget = (index: number) => {
      const paddingLeft = Number.parseFloat(getComputedStyle(viewport).paddingLeft) || 0
      return Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth, cards[index].offsetLeft - paddingLeft))
    }
    const scrollToCard = (index: number, animate = true) => {
      targetIndexRef.current = Math.max(0, Math.min(cards.length - 1, index))
      viewport.scrollTo({
        left: getTarget(targetIndexRef.current),
        behavior: animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',
      })
    }
    scrollToCardRef.current = scrollToCard

    const step = (direction: number) => {
      const current = getTarget(targetIndexRef.current)
      const indexes = cards.map((_, index) => index)
      if (direction < 0) indexes.reverse()
      // The last cards can share a position when the remaining row fits.
      const next = indexes.find(index => (getTarget(index) - current) * direction > 0.5)
      if (next !== undefined) scrollToCard(next)
    }

    const unbindSwipe = bindStepSwipe(viewport, { onStep: step })
    const resizeObserver = new ResizeObserver(() => scrollToCard(targetIndexRef.current, false))
    resizeObserver.observe(viewport)
    return () => {
      unbindSwipe()
      resizeObserver.disconnect()
      scrollToCardRef.current = () => undefined
    }
  }, [viewportRef, cardSelector])

  return (index: number) => scrollToCardRef.current(index)
}
