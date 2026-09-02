import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { DesktopIntro } from './DesktopIntro'
import { DesktopLower } from './DesktopLower'
import { DesktopProfiles } from './DesktopProfiles'
import './desktop-shell.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function DesktopExperience() {
  useGSAP(() => {
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    })

    const updateLenis = (time: number) => lenis.raf(time * 1000)
    const scrollToAnchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) return

      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]')
      const targetId = anchor?.hash ? decodeURIComponent(anchor.hash.slice(1)) : ''
      const target = targetId ? document.getElementById(targetId) : null

      if (!anchor || !target) return

      event.preventDefault()
      window.history.pushState(null, '', anchor.hash)
      lenis.scrollTo(target, { offset: 0 })
    }

    lenis.on('scroll', ScrollTrigger.update)
    document.addEventListener('click', scrollToAnchor)
    gsap.ticker.add(updateLenis)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      document.removeEventListener('click', scrollToAnchor)
      gsap.ticker.remove(updateLenis)
      lenis.destroy()
      gsap.ticker.lagSmoothing(500, 33)
    }
  })

  return (
    <main className="desktop-experience">
      <DesktopIntro />
      <DesktopProfiles />
      <DesktopLower />
    </main>
  )
}
