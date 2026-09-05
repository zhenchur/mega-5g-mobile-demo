import gsap from 'gsap'

type FocusCallbacks = {
  onFocus?: () => void
  onLeave?: () => void
}

// Entrance opacity must never remove controls from the Tab order. A focused
// control completes its entrance immediately and stays visible during reverse.
// Call inside the same GSAP context as the timeline so listeners are reverted.
export function completeOnFocus(
  timeline: gsap.core.Timeline,
  scopes: HTMLElement[],
  { onFocus, onLeave }: FocusCallbacks = {},
) {
  const containsFocus = () => scopes.some(scope => scope.contains(document.activeElement))
  let completing = false
  let disposed = false
  const complete = () => {
    if (completing) return
    completing = true
    onFocus?.()
    timeline.progress(1).pause()
    completing = false
  }
  const previousUpdate = timeline.eventCallback('onUpdate')
  timeline.eventCallback('onUpdate', () => {
    if (!completing && containsFocus() && timeline.progress() < 1) complete()
    previousUpdate?.()
  })
  const onFocusOut = (event: FocusEvent) => {
    if (scopes.some(scope => event.relatedTarget instanceof Node && scope.contains(event.relatedTarget))) return
    // focusout fires before the browser updates activeElement.
    queueMicrotask(() => {
      if (disposed || containsFocus()) return
      onLeave?.()
      const trigger = timeline.scrollTrigger
      if (trigger && trigger.scroll() < trigger.start) timeline.reverse()
    })
  }
  scopes.forEach(scope => {
    scope.addEventListener('focusin', complete)
    scope.addEventListener('focusout', onFocusOut)
  })
  gsap.context()?.add(() => () => {
    disposed = true
    scopes.forEach(scope => {
      scope.removeEventListener('focusin', complete)
      scope.removeEventListener('focusout', onFocusOut)
    })
  })
  if (containsFocus()) complete()
}
