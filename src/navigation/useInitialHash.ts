import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Resolve a fresh deep link after React, fonts and scroll-pin layout are ready. */
export function useInitialHash(viewportMode: string) {
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current || !window.location.hash) return
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    // Reload/back retain the browser's saved position, even away from the hash.
    if (navigation?.type === 'reload' || navigation?.type === 'back_forward') return

    let id: string
    try { id = decodeURIComponent(window.location.hash.slice(1)) }
    catch { return }

    let cancelled = false
    let frame = 0
    const cancelForUser = () => { handled.current = true; cancelled = true }
    const inputs = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const
    inputs.forEach(type => window.addEventListener(type, cancelForUser, { passive: true, once: true }))

    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = window.requestAnimationFrame(() => {
        if (cancelled) return
        const target = document.getElementById(id)
        if (!target) return
        ScrollTrigger.refresh()
        target.scrollIntoView({ block: 'start', behavior: 'instant' })
        handled.current = true
      })
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      inputs.forEach(type => window.removeEventListener(type, cancelForUser))
    }
  }, [viewportMode])
}
