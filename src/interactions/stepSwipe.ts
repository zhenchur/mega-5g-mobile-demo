const AXIS_LOCK_THRESHOLD = 10
const SWIPE_TRIGGER_THRESHOLD = 24

type SwipeDirection = -1 | 1
type GestureSource = 'pointer' | 'touch'
type StepSwipeOptions = {
  onStep: (direction: SwipeDirection) => void
  /** Keep the touch-event path for galleries that need it on mobile Safari. */
  preferTouchEvents?: boolean
}
type Gesture = {
  source: GestureSource
  id: number
  startX: number
  startY: number
  axis: 'x' | 'y' | null
  consumed: boolean
}

/**
 * Recognize one horizontal step per press, leaving vertical scroll and pinch
 * gestures to the browser. Movement/animation belongs to the caller.
 */
export function bindStepSwipe(viewport: HTMLElement, { onStep, preferTouchEvents = false }: StepSwipeOptions) {
  const document = viewport.ownerDocument
  const view = document.defaultView
  const useTouchEvents = preferTouchEvents && view !== null && 'ontouchstart' in view
  let gesture: Gesture | null = null
  let suppressClick = false

  const cancelGesture = () => {
    const previous = gesture
    gesture = null
    if (previous?.source === 'pointer' && viewport.hasPointerCapture(previous.id)) {
      viewport.releasePointerCapture(previous.id)
    }
  }

  const startGesture = (source: GestureSource, id: number, startX: number, startY: number) => {
    cancelGesture()
    suppressClick = false
    gesture = { source, id, startX, startY, axis: null, consumed: false }
  }

  const updateGesture = (
    source: GestureSource, id: number, clientX: number, clientY: number, event: Event,
  ) => {
    if (!gesture || gesture.source !== source || gesture.id !== id) return
    const dx = clientX - gesture.startX
    const dy = clientY - gesture.startY

    if (!gesture.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_THRESHOLD) return
      gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (gesture.axis === 'x' && event.type === 'pointermove' && !viewport.hasPointerCapture(id)) {
        viewport.setPointerCapture(id)
      }
    }
    if (gesture.axis !== 'x') return
    suppressClick = true
    // touchend is passive, and pointerup must not request capture after release.
    if (event.cancelable && (event.type === 'pointermove' || event.type === 'touchmove')) event.preventDefault()
    if (gesture.consumed || Math.abs(dx) < SWIPE_TRIGGER_THRESHOLD) return

    gesture.consumed = true
    onStep(dx < 0 ? 1 : -1)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || (useTouchEvents && event.pointerType === 'touch')) return
    startGesture('pointer', event.pointerId, event.clientX, event.clientY)
  }
  const onDocumentPointerDown = (event: PointerEvent) => {
    if (gesture?.source === 'pointer' && !event.isPrimary) cancelGesture()
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!gesture || gesture.source !== 'pointer' || gesture.id !== event.pointerId) return
    // The press may end outside the document before horizontal capture starts.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      cancelGesture()
      return
    }
    updateGesture('pointer', event.pointerId, event.clientX, event.clientY, event)
  }
  const finishPointer = (event: PointerEvent) => {
    // A label initially owns implicit touch capture. Losing that capture while
    // transferring it to the viewport is not the end of the active swipe.
    if (event.type === 'lostpointercapture' && event.target !== viewport) return
    if (!gesture || gesture.source !== 'pointer' || gesture.id !== event.pointerId) return
    if (event.type === 'pointerup') updateGesture('pointer', event.pointerId, event.clientX, event.clientY, event)
    cancelGesture()
  }

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return
    const touch = event.touches[0]
    startGesture('touch', touch.identifier, touch.clientX, touch.clientY)
  }
  const onDocumentTouchStart = (event: TouchEvent) => {
    if (gesture?.source === 'touch' && event.touches.length !== 1) cancelGesture()
  }
  const onTouchMove = (event: TouchEvent) => {
    if (!gesture || gesture.source !== 'touch') return
    if (event.touches.length !== 1) {
      cancelGesture()
      return
    }
    const touch = Array.from(event.touches).find(({ identifier }) => identifier === gesture?.id)
    if (touch) updateGesture('touch', touch.identifier, touch.clientX, touch.clientY, event)
  }
  const finishTouch = (event: TouchEvent) => {
    if (!gesture || gesture.source !== 'touch') return
    const touch = Array.from(event.changedTouches).find(({ identifier }) => identifier === gesture?.id)
    if (touch && event.type === 'touchend') updateGesture('touch', touch.identifier, touch.clientX, touch.clientY, event)
    if (touch || event.type === 'touchcancel') cancelGesture()
  }

  const onClick = (event: MouseEvent) => {
    // A swipe must not activate the card under the release point. A fresh press
    // resets suppression; keyboard activation always passes through.
    if (!suppressClick || event.detail === 0) return
    event.preventDefault()
    event.stopImmediatePropagation()
    suppressClick = false
  }
  const onVisibilityChange = () => {
    if (document.hidden) cancelGesture()
  }

  viewport.addEventListener('pointerdown', onPointerDown, true)
  viewport.addEventListener('click', onClick, true)
  // Track a press beyond the viewport even before its axis is known/captured.
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
  document.addEventListener('pointerup', finishPointer, true)
  document.addEventListener('pointercancel', finishPointer, true)
  document.addEventListener('lostpointercapture', finishPointer, true)
  document.addEventListener('visibilitychange', onVisibilityChange)
  view?.addEventListener('blur', cancelGesture)
  if (useTouchEvents) {
    viewport.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    document.addEventListener('touchstart', onDocumentTouchStart, { capture: true, passive: true })
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    document.addEventListener('touchend', finishTouch, { capture: true, passive: true })
    document.addEventListener('touchcancel', finishTouch, { capture: true, passive: true })
  }

  return () => {
    cancelGesture()
    viewport.removeEventListener('pointerdown', onPointerDown, true)
    viewport.removeEventListener('click', onClick, true)
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('pointermove', onPointerMove, true)
    document.removeEventListener('pointerup', finishPointer, true)
    document.removeEventListener('pointercancel', finishPointer, true)
    document.removeEventListener('lostpointercapture', finishPointer, true)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    view?.removeEventListener('blur', cancelGesture)
    if (useTouchEvents) {
      viewport.removeEventListener('touchstart', onTouchStart, true)
      document.removeEventListener('touchstart', onDocumentTouchStart, true)
      document.removeEventListener('touchmove', onTouchMove, true)
      document.removeEventListener('touchend', finishTouch, true)
      document.removeEventListener('touchcancel', finishTouch, true)
    }
  }
}
