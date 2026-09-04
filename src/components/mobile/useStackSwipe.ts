import { useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Preserve the paging and gesture settings from ExperienceCarousel.
const STACK_STEP = 8
const AXIS_LOCK_THRESHOLD = 10
const SWIPE_TRIGGER_THRESHOLD = 24
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

      let suppressClick = false
      let gesture: {
        source: 'pointer' | 'touch'
        id: number
        startX: number
        startY: number
        axis: 'x' | 'y' | null
        consumed: boolean
      } | null = null

      const updateGesture = (
        source: 'pointer' | 'touch', id: number, clientX: number, clientY: number, event: Event,
      ) => {
        if (!gesture || gesture.source !== source || gesture.id !== id) return
        const deltaX = clientX - gesture.startX
        const deltaY = clientY - gesture.startY
        const absoluteX = Math.abs(deltaX)
        const absoluteY = Math.abs(deltaY)

        if (!gesture.axis) {
          if (Math.max(absoluteX, absoluteY) < AXIS_LOCK_THRESHOLD) return
          gesture.axis = absoluteX > absoluteY ? 'x' : 'y'
          if (gesture.axis === 'x' && source === 'pointer' && !viewport.hasPointerCapture(id)) {
            viewport.setPointerCapture(id)
          }
        }
        if (gesture.axis !== 'x') return
        suppressClick = true
        if (event.cancelable && (event.type === 'touchmove' || event.type === 'pointermove')) event.preventDefault()
        if (gesture.consumed || absoluteX < SWIPE_TRIGGER_THRESHOLD) return

        gesture.consumed = true
        goToPage(pageRef.current + (deltaX < 0 ? 1 : -1))
      }

      const prefersTouchEvents = 'ontouchstart' in window
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary || (prefersTouchEvents && event.pointerType === 'touch')) return
        suppressClick = false
        gesture = { source: 'pointer', id: event.pointerId, startX: event.clientX, startY: event.clientY, axis: null, consumed: false }
      }
      const onPointerMove = (event: PointerEvent) => {
        updateGesture('pointer', event.pointerId, event.clientX, event.clientY, event)
      }
      const finishPointer = (event: PointerEvent) => {
        if (!gesture || gesture.source !== 'pointer' || gesture.id !== event.pointerId) return
        if (event.type === 'pointerup') updateGesture('pointer', event.pointerId, event.clientX, event.clientY, event)
        if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
        gesture = null
      }

      const onTouchStart = (event: TouchEvent) => {
        suppressClick = false
        if (event.touches.length !== 1) {
          gesture = null
          return
        }
        const touch = event.touches[0]
        gesture = { source: 'touch', id: touch.identifier, startX: touch.clientX, startY: touch.clientY, axis: null, consumed: false }
      }
      const onTouchMove = (event: TouchEvent) => {
        if (!gesture || gesture.source !== 'touch') return
        if (event.touches.length !== 1) {
          gesture = null
          return
        }
        const touch = Array.from(event.touches).find(({ identifier }) => identifier === gesture?.id)
        if (touch) updateGesture('touch', touch.identifier, touch.clientX, touch.clientY, event)
      }
      const finishTouch = (event: TouchEvent) => {
        if (!gesture || gesture.source !== 'touch') return
        const touch = Array.from(event.changedTouches).find(({ identifier }) => identifier === gesture?.id)
        if (touch && event.type === 'touchend') updateGesture('touch', touch.identifier, touch.clientX, touch.clientY, event)
        if (touch || event.type === 'touchcancel') gesture = null
      }

      // Swiping interactive cards must not activate the label/button released
      // beneath the pointer. A fresh press resets this; keyboard clicks pass.
      const onClick = (event: MouseEvent) => {
        if (!suppressClick || event.detail === 0) return
        event.preventDefault()
        event.stopImmediatePropagation()
        suppressClick = false
      }

      viewport.addEventListener('click', onClick, { capture: true })
      viewport.addEventListener('pointerdown', onPointerDown, { capture: true })
      viewport.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
      viewport.addEventListener('pointerup', finishPointer, { capture: true })
      viewport.addEventListener('pointercancel', finishPointer, { capture: true })
      viewport.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
      viewport.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
      viewport.addEventListener('touchend', finishTouch, { capture: true, passive: true })
      viewport.addEventListener('touchcancel', finishTouch, { capture: true, passive: true })

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
        if (gesture?.source === 'pointer' && viewport.hasPointerCapture(gesture.id)) viewport.releasePointerCapture(gesture.id)
        gesture = null
        viewport.removeEventListener('click', onClick, true)
        viewport.removeEventListener('pointerdown', onPointerDown, true)
        viewport.removeEventListener('pointermove', onPointerMove, true)
        viewport.removeEventListener('pointerup', finishPointer, true)
        viewport.removeEventListener('pointercancel', finishPointer, true)
        viewport.removeEventListener('touchstart', onTouchStart, true)
        viewport.removeEventListener('touchmove', onTouchMove, true)
        viewport.removeEventListener('touchend', finishTouch, true)
        viewport.removeEventListener('touchcancel', finishTouch, true)
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
