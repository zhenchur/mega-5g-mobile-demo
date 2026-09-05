import { useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONNECT_TAB_TIMING } from '../motion/tokens'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type ConnectTabsOptions = {
  panelSelector: string
  // Mobile panels have different intrinsic heights. Desktop keeps a fixed grid.
  heightContainerSelector?: string
}

/** Two subscriber tabs with keyboard selection and one reversible crossfade. */
export function useConnectTabs(
  sectionRef: RefObject<HTMLElement | null>,
  { panelSelector, heightContainerSelector }: ConnectTabsOptions,
) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const fadeRef = useRef<gsap.core.Timeline | null>(null)
  const reducedMotionRef = useRef(false)
  const activeTabRef = useRef(0)
  const [activeTab, setActiveTab] = useState(0)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const panels = Array.from(section.querySelectorAll<HTMLElement>(panelSelector))
    const container = heightContainerSelector
      ? section.querySelector<HTMLElement>(heightContainerSelector)
      : null
    if (panels.length !== 2 || (heightContainerSelector && !container)) return

    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      reducedMotionRef.current = Boolean(context.conditions?.reduce)
      let refreshFrame = 0
      let resizeFrame = 0
      const refreshLayout = () => {
        if (!container) return
        window.cancelAnimationFrame(refreshFrame)
        refreshFrame = window.requestAnimationFrame(() => {
          refreshFrame = 0
          ScrollTrigger.refresh()
        })
      }

      // Height and opacity share a playhead: rapid input reverses from the
      // current position, and reduced motion seeks directly to the selected tab.
      const fade = gsap.timeline({
        paused: true,
        defaults: CONNECT_TAB_TIMING,
        onComplete: refreshLayout,
        onReverseComplete: refreshLayout,
      })
        .fromTo(panels[0], { autoAlpha: 1 }, { autoAlpha: 0 }, 0)
        .fromTo(panels[1], { autoAlpha: 0 }, { autoAlpha: 1 }, 0)

      if (container) {
        fade.fromTo(container,
          { height: () => panels[0].offsetHeight },
          { height: () => panels[1].offsetHeight },
          0,
        )
      }

      fade.progress(activeTabRef.current, true).pause()
      fadeRef.current = fade

      // Observe only intrinsic panels to catch wrapping/font changes without
      // observing the animated height and causing a refresh loop.
      let observer: ResizeObserver | undefined
      if (container) {
        let sizes = panels.map((panel) => panel.offsetHeight)
        const panelObserver = new ResizeObserver(() => {
          const nextSizes = panels.map((panel) => panel.offsetHeight)
          if (nextSizes.every((size, index) => size === sizes[index])) return
          sizes = nextSizes
          window.cancelAnimationFrame(resizeFrame)
          resizeFrame = window.requestAnimationFrame(() => {
            resizeFrame = 0
            const progress = fade.progress()
            // Seeking to an unchanged endpoint can skip GSAP's render. Move
            // away and restore in this same frame so cached height endpoints
            // are recalculated even when the crossfade has already finished.
            fade.invalidate().progress(progress === 0 ? 1 : 0, true).progress(progress, true)
            refreshLayout()
          })
        })
        observer = panelObserver
        panels.forEach((panel) => panelObserver.observe(panel))
      }

      return () => {
        observer?.disconnect()
        window.cancelAnimationFrame(resizeFrame)
        window.cancelAnimationFrame(refreshFrame)
        fadeRef.current = null
      }
    })

    return () => media.revert()
  }, { scope: sectionRef, dependencies: [panelSelector, heightContainerSelector], revertOnUpdate: true })

  function selectTab(index: number) {
    if ((index !== 0 && index !== 1) || index === activeTabRef.current) return
    activeTabRef.current = index
    setActiveTab(index)

    const fade = fadeRef.current
    if (!fade) return
    if (reducedMotionRef.current) fade.progress(index).pause()
    else if (index === 1) fade.play()
    else fade.reverse()
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = 1 - index
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 1
    else return

    event.preventDefault()
    tabsRef.current[next]?.focus()
    selectTab(next)
  }

  return { activeTab, tabsRef, selectTab, handleTabKeyDown }
}
