import { useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createDesktopCardReveal } from './desktopCardReveal'
import './desktop-intro.css'

const introAsset = (name: string) => publicAsset(`assets/desktop/intro/${name}`)
const finalIntroAsset = (name: string) => publicAsset(`assets/desktop/final/intro/${name}`)
const HERO_CONTENT_RISE = -48
const HERO_CONTENT_END_SCALE = 0.88

gsap.registerPlugin(useGSAP, ScrollTrigger)

const serviceLinks = [
  'Частным лицам',
  'Интернет-магазин',
  'Бизнесу',
  'Малому бизнесу',
  'Госзаказчикам',
]

const primaryLinks = [
  { label: 'Тарифы', expandable: true },
  { label: 'Услуги', expandable: true },
  { label: 'Оплата', expandable: true },
  { label: 'Акции', expandable: true },
  { label: 'Поддержка', expandable: true },
  { label: 'Приложение', expandable: false },
]

const technologies = [
  {
    title: <>Скорость интернета<br />на 60% больше</>,
    description: <>Контент, видео и файлы загружаются почти вдвое<br />быстрее</>,
    image: 'technology-internet.png',
    modifier: 'internet',
  },
  {
    title: 'Умное ускорение',
    description: 'Интеллектуальное управление траффиком и распределение нагрузки сети',
    image: 'technology-smart.png',
    modifier: 'smart',
  },
]

function DesktopBrand() {
  return (
    <a className="desktop-intro__brand" href={publicAsset('')} aria-label="МегаФон — главная">
      <img src={introAsset('logo-mark.svg')} alt="" width="24" height="24" />
      <img src={introAsset('logo-wordmark.svg')} alt="" width="104" height="15" />
    </a>
  )
}

function DesktopHeader() {
  return (
    <header className="desktop-intro__header">
      <div className="desktop-intro__header-top">
        <div className="desktop-intro__rail desktop-intro__header-top-rail">
          <div className="desktop-intro__service-cluster">
            <DesktopBrand />
            <nav className="desktop-intro__service-nav" aria-label="Разделы сайта">
              {serviceLinks.map((label, index) => (
                <a
                  className={index === 0 ? 'desktop-intro__service-link is-active' : 'desktop-intro__service-link'}
                  href="#"
                  key={label}
                  aria-current={index === 0 ? 'page' : undefined}
                >
                  {label}
                </a>
              ))}
              <button className="desktop-intro__service-more" type="button">
                Ещё
                <img src={introAsset('more-chevron.svg')} alt="" width="18" height="18" />
              </button>
            </nav>
          </div>

          <button className="desktop-intro__location" type="button">
            <img src={introAsset('location.svg')} alt="" width="16" height="16" />
            <span>Республика Карачаево-Черкесия</span>
          </button>
        </div>
      </div>

      <div className="desktop-intro__header-bottom">
        <div className="desktop-intro__rail desktop-intro__header-bottom-rail">
          <nav className="desktop-intro__primary-nav" aria-label="Основная навигация">
            {primaryLinks.map(({ label, expandable }) => (
              <a className="desktop-intro__primary-link" href="#" key={label}>
                <span>{label}</span>
                {expandable && (
                  <img src={introAsset('nav-chevron.svg')} alt="" width="20" height="20" />
                )}
              </a>
            ))}
          </nav>

          <div className="desktop-intro__header-actions">
            <button className="desktop-intro__search" type="button" aria-label="Поиск">
              <img src={introAsset('search.svg')} alt="" width="32" height="32" />
            </button>
            <a className="desktop-intro__login" href="#">Войти</a>
          </div>
        </div>
      </div>
    </header>
  )
}

function DesktopHero({
  sectionRef,
  contentRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <section ref={sectionRef} className="desktop-intro__hero" aria-labelledby="desktop-hero-title">
      <div className="desktop-intro__hero-canvas">
        <nav className="desktop-intro__breadcrumbs" aria-label="Хлебные крошки">
          <ol>
            <li><a href="#">МегаФон</a></li>
            <li><a href="#">Услуги и опции</a></li>
            <li aria-current="page">Мега 5G</li>
          </ol>
        </nav>

        <div ref={contentRef} className="desktop-intro__hero-content-motion">
          <div className="desktop-intro__hero-image-frame" aria-hidden="true">
            <img
              className="desktop-intro__hero-image"
              src={finalIntroAsset('promo-5g.png')}
              alt=""
              width="1304"
              height="734"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <div className="desktop-intro__hero-copy">
            <div className="desktop-intro__hero-copy-motion">
              <div className="desktop-intro__hero-heading">
                <h1 id="desktop-hero-title">Мега 5G</h1>
                <p>Оцените первыми новый уровень скорости мобильного интернета</p>
              </div>
              <a className="desktop-intro__hero-cta" href="#desktop-profiles">Подключить</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Technologies() {
  return (
    <section className="desktop-intro__technologies" aria-labelledby="desktop-technologies-title">
      <div className="desktop-intro__rail desktop-intro__technologies-inner">
        <h2 id="desktop-technologies-title">Как работает ускорение</h2>
        <div className="desktop-intro__technology-grid">
          {technologies.map(({ title, description, image, modifier }) => (
            <div className="desktop-intro__technology-slot" key={modifier}>
              <div className="desktop-intro__technology-rise">
                <article className={`desktop-intro__technology desktop-intro__technology--${modifier}`}>
                  <div className="desktop-intro__technology-copy">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <div className="desktop-intro__technology-visual" aria-hidden="true">
                    <img src={finalIntroAsset(image)} alt="" loading="lazy" decoding="async" width="3200" height="1800" />
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DesktopIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const hero = heroRef.current
    const content = contentRef.current
    const surface = surfaceRef.current

    if (
      !root
      || !stage
      || !hero
      || !content
      || !surface
    ) return

    const technologyCards = gsap.utils.toArray<HTMLElement>('.desktop-intro__technology', surface)
    const technologyGrid = surface.querySelector<HTMLElement>('.desktop-intro__technology-grid')

    if (technologyCards.length === 0 || !technologyGrid) return

    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        const surfaceHeight = surface.getBoundingClientRect().height
        const getSurfaceTravel = () => hero.offsetTop + hero.offsetHeight

        root.style.setProperty('--desktop-surface-height', `${surfaceHeight}px`)
        root.style.setProperty('--desktop-surface-travel', `${getSurfaceTravel()}px`)
        root.classList.add('is-motion-ready')

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'desktop-hero-motion',
            trigger: stage,
            start: 'top top',
            // Match pin spacing to the surface travel so the shorter RTB section
            // stays joined to profiles throughout the pinned transition.
            end: () => `+=${getSurfaceTravel()}`,
            pin: stage,
            pinSpacing: true,
            // Lenis already smooths the page. An extra scrub delay would make
            // this surface lag behind the profiles in the normal document flow.
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        timeline
          .fromTo(
            stage,
            { '--desktop-hero-underlay-clip': '0px' },
            {
              '--desktop-hero-underlay-clip': () => `${getSurfaceTravel()}px`,
              duration: 1,
            },
            0,
          )
          .fromTo(
            surface,
            {
              y: getSurfaceTravel,
            },
            {
              y: 0,
              duration: 1,
            },
            0,
          )
          .fromTo(
            content,
            { y: 0, scale: 1, transformOrigin: '50% 50%' },
            {
              y: HERO_CONTENT_RISE,
              scale: HERO_CONTENT_END_SCALE,
              duration: 0.68,
              ease: 'power1.in',
            },
            0.04,
          )

        const pinStart = () => timeline.scrollTrigger?.start ?? 0
        const pinEnd = () => timeline.scrollTrigger?.end ?? pinStart() + getSurfaceTravel()
        // The surface moves 1:1 with scroll. Keep this threshold negative when
        // cards are already in view on load: clamping to 0 waits for a first scroll.
        // Measure the unanimated grid on every refresh, not the rotated cards.
        const technologyEntranceStart = () => pinStart()
          + getSurfaceTravel()
          + technologyGrid.getBoundingClientRect().top - surface.getBoundingClientRect().top
          - window.innerHeight
        createDesktopCardReveal({
          items: technologyCards.map(card => ({ card, rise: card.parentElement! })),
          stagger: 0.06,
          scrollTrigger: {
            id: 'desktop-technology-cards-entrance',
            trigger: stage,
            start: technologyEntranceStart,
            end: () => Math.max(technologyEntranceStart() + 1, pinEnd()),
            invalidateOnRefresh: true,
            toggleActions: 'play none none reverse',
          },
        })

        return () => {
          root.classList.remove('is-motion-ready')
          root.style.removeProperty('--desktop-surface-height')
          root.style.removeProperty('--desktop-surface-travel')
          stage.style.removeProperty('--desktop-hero-underlay-clip')
        }
      },
    )

    return () => media.revert()
  }, { scope: rootRef })

  return (
    <div ref={rootRef} className="desktop-intro">
      <DesktopHeader />
      <div className="desktop-intro__motion-scene">
        <div ref={stageRef} className="desktop-intro__motion-stage">
          <div className="desktop-intro__header-spacer" aria-hidden="true" />
          <DesktopHero
            sectionRef={heroRef}
            contentRef={contentRef}
          />
          <div ref={surfaceRef} className="desktop-intro__surface">
            <Technologies />
          </div>
        </div>
      </div>
    </div>
  )
}
