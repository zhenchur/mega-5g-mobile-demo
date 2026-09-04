import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createMobileCardReveal, MOBILE_CARD_REVEAL_START } from './mobileCardReveal'
import './mobile-intro.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const HEADER_HEIGHT = 56
const HERO_CONTENT_END_SCALE = 0.88

const technologies = [
  {
    title: <>Скорость интернета<br />на 60% больше</>,
    description: 'Контент, видео и файлы загружаются почти вдвое быстрее',
    image: 'assets/desktop/final/intro/technology-internet.png',
    modifier: 'internet',
  },
  {
    title: 'Умное ускорение',
    description: 'Интеллектуальное управление траффиком и распределение нагрузки сети',
    image: 'assets/desktop/final/intro/technology-smart.png',
    modifier: 'smart',
  },
]

export function MobileIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const hero = heroRef.current
    const heroContent = heroContentRef.current
    if (!root || !stage || !hero || !heroContent) return

    const media = gsap.matchMedia()
    media.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      // Only the promo is pinned. Benefits and profiles share native scrolling,
      // so compositor scrolling cannot outrun a JS-driven section transform.
      const getHeroHeight = () => hero.offsetHeight
      root.classList.add('is-motion-ready')

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'mobile-hero-motion',
          trigger: stage,
          start: `top ${HEADER_HEIGHT}px`,
          end: () => `+=${getHeroHeight()}`,
          pin: stage,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .fromTo(stage, { '--mf-mobile-hero-underlay-clip': '0%' }, {
          '--mf-mobile-hero-underlay-clip': '100%',
          duration: 1,
        }, 0)
        .fromTo(heroContent, { scale: 1, transformOrigin: '50% 50%' }, {
          scale: HERO_CONTENT_END_SCALE,
          duration: 0.68,
          ease: 'power1.in',
        }, 0.04)

      root.querySelectorAll<HTMLElement>('.mf-mobile-technology-slot').forEach((slot, index) => {
        const rise = slot.querySelector<HTMLElement>('.mf-mobile-technology-rise')
        const card = slot.querySelector<HTMLElement>('.mf-mobile-technology')
        if (!rise || !card) return
        createMobileCardReveal({
          items: [{ rise, card }],
          scrollTrigger: {
            id: `mobile-technology-card-entrance-${index}`,
            trigger: slot,
            start: MOBILE_CARD_REVEAL_START,
            invalidateOnRefresh: true,
            toggleActions: 'play none none reverse',
          },
        })
      })

      return () => {
        root.classList.remove('is-motion-ready')
        gsap.set(heroContent, { clearProps: 'transform,transformOrigin' })
        stage.style.removeProperty('--mf-mobile-hero-underlay-clip')
      }
    })

    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
      media.revert()
    }
  }, { scope: rootRef })

  return (
    <div ref={rootRef} className="mf-mobile-intro">
      <div ref={stageRef} className="mf-mobile-intro__stage">
        <section ref={heroRef} className="mf-mobile-hero" aria-labelledby="promo-title">
          <nav className="mf-mobile-hero__breadcrumbs" aria-label="Хлебные крошки">
            <ol>
              <li>МегаФон</li>
              <li>Услуги и опции</li>
              <li aria-current="page">Мега 5G</li>
            </ol>
          </nav>
          <div ref={heroContentRef} className="mf-mobile-hero__content">
            <div className="mf-mobile-hero__copy">
              <h1 id="promo-title">Мега 5G</h1>
              <p>Оцените первыми новый уровень скорости мобильного интернета</p>
              <a className="mf-mobile-hero__button" href="#profiles">Подключить</a>
            </div>
            <div className="mf-mobile-hero__visual" aria-hidden="true">
              <img
                src={publicAsset('assets/desktop/final/intro/promo-5g.png')}
                alt=""
                width="578"
                height="325"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </section>
      </div>
      <section id="details" className="mf-mobile-benefits" aria-labelledby="details-title">
        <h2 id="details-title">Как работает ускорение</h2>
        <div className="mf-mobile-benefits__cards">
          {technologies.map((technology) => (
            <div className="mf-mobile-technology-slot" key={technology.modifier}>
              <div className="mf-mobile-technology-rise">
                <article className={`mf-mobile-technology mf-mobile-technology--${technology.modifier}`}>
                  <div className="mf-mobile-technology__copy">
                    <h3>{technology.title}</h3>
                    <p>{technology.description}</p>
                  </div>
                  <div className="mf-mobile-technology__visual" aria-hidden="true">
                    <img src={publicAsset(technology.image)} alt="" width="320" height="180" decoding="async" />
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
