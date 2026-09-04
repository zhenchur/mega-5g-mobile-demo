import { useEffect, useRef, type RefObject } from 'react'

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

    let suppressClick = false
    let drag: { id: number; x: number; y: number; axis: 'x' | 'y' | null; consumed: boolean } | null = null

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) {
        if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id)
        drag = null
        return
      }
      suppressClick = false
      if (event.button !== 0) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null, consumed: false }
    }
    const updateGesture = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return
      if (event.type === 'pointermove' && event.pointerType === 'mouse' && (event.buttons & 1) === 0) {
        if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
        drag = null
        return
      }
      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      if (!drag.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (drag.axis === 'x' && event.type === 'pointermove') viewport.setPointerCapture(event.pointerId)
      }
      if (drag.axis !== 'x') return
      if (event.cancelable) event.preventDefault()
      suppressClick = true
      if (drag.consumed || Math.abs(dx) < 24) return
      drag.consumed = true
      step(dx < 0 ? 1 : -1)
    }
    const finishDrag = (event: PointerEvent) => {
      // Touch starts with implicit capture on the label. Ignore its loss when
      // capture moves to the viewport after the horizontal axis is locked.
      if (event.type === 'lostpointercapture' && event.target !== viewport) return
      if (!drag || drag.id !== event.pointerId) return
      if (event.type === 'pointerup') updateGesture(event)
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
      drag = null
    }
    const onClick = (event: MouseEvent) => {
      if (!suppressClick || event.detail === 0) return
      event.preventDefault()
      event.stopImmediatePropagation()
      suppressClick = false
    }

    viewport.addEventListener('pointerdown', onPointerDown, true)
    viewport.addEventListener('pointermove', updateGesture, { capture: true, passive: false })
    viewport.addEventListener('pointerup', finishDrag, true)
    viewport.addEventListener('pointercancel', finishDrag, true)
    viewport.addEventListener('lostpointercapture', finishDrag, true)
    viewport.addEventListener('click', onClick, true)
    const resizeObserver = new ResizeObserver(() => scrollToCard(targetIndexRef.current, false))
    resizeObserver.observe(viewport)
    return () => {
      if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id)
      viewport.removeEventListener('pointerdown', onPointerDown, true)
      viewport.removeEventListener('pointermove', updateGesture, true)
      viewport.removeEventListener('pointerup', finishDrag, true)
      viewport.removeEventListener('pointercancel', finishDrag, true)
      viewport.removeEventListener('lostpointercapture', finishDrag, true)
      viewport.removeEventListener('click', onClick, true)
      resizeObserver.disconnect()
      scrollToCardRef.current = () => undefined
    }
  }, [viewportRef, cardSelector])

  return (index: number) => scrollToCardRef.current(index)
}
