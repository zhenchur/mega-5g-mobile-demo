import { useRef, type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import './desktop-intro.css'

const introAsset = (name: string) => publicAsset(`assets/desktop/intro/${name}`)
const HERO_SURFACE_OVERLAP = 32
const HERO_SURFACE_SIDE_INSET = 50
const HERO_CONTENT_RISE = -48
const HERO_CONTENT_END_SCALE = 0.88
const TECHNOLOGY_ENTRANCE_VIEWPORT_INSET = 0.15

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

const benefits = [
  { label: <>Быстрая<br />загрузка игр</>, secondIcon: 'benefit-headphones.svg' },
  { label: <>Фильмы и сериалы<br />без ограничений</>, secondIcon: 'benefit-plus.svg' },
  { label: <>Раздача скоростного<br />интернета</>, secondIcon: 'benefit-headphones.svg' },
  { label: <>Загружайте файлы<br />быстрее</>, secondIcon: 'benefit-plus.svg' },
]

const technologies = [
  {
    title: 'Приоритет сети 5G',
    description: <>Вы всегда на связи,<br />даже в переполненной сети</>,
    image: 'technology-priority.png',
    modifier: 'priority',
  },
  {
    title: 'Ускорение 60%',
    description: <>Интернет работает<br />на 60% быстрее, чем 4G</>,
    image: 'technology-speed.png',
    modifier: 'speed',
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
              src={introAsset('promo-5g.png')}
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
                <p>Скоростной интернет, который настроен<br />под вашу жизнь</p>
              </div>
              <a className="desktop-intro__hero-cta" href="#desktop-profiles">Выбрать профиль</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section className="desktop-intro__benefits" aria-labelledby="desktop-benefits-title">
      <h2 className="desktop-intro__visually-hidden" id="desktop-benefits-title">
        Преимущества Мега 5G
      </h2>
      <div className="desktop-intro__rail desktop-intro__benefits-grid">
        {benefits.map(({ label, secondIcon }, index) => (
          <article className="desktop-intro__benefit" key={index}>
            <p>{label}</p>
            <div className="desktop-intro__benefit-icons" aria-hidden="true">
              <img src={introAsset('benefit-5g.svg')} alt="" width="45" height="45" />
              <img
                className={secondIcon === 'benefit-plus.svg' ? 'is-plus' : undefined}
                src={introAsset(secondIcon)}
                alt=""
                width={secondIcon === 'benefit-plus.svg' ? '46' : '43'}
                height={secondIcon === 'benefit-plus.svg' ? '42' : '43'}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Technologies() {
  return (
    <section className="desktop-intro__technologies" aria-labelledby="desktop-technologies-title">
      <div className="desktop-intro__rail desktop-intro__technologies-inner">
        <h2 id="desktop-technologies-title">Технологии будущего во всех профилях</h2>
        <div className="desktop-intro__technology-grid">
          {technologies.map(({ title, description, image, modifier }) => (
            <article className={`desktop-intro__technology desktop-intro__technology--${modifier}`} key={title}>
              <div className="desktop-intro__technology-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <div className="desktop-intro__technology-visual" aria-hidden="true">
                <img src={introAsset(image)} alt="" loading="lazy" decoding="async" />
              </div>
            </article>
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

    if (technologyCards.length === 0) return

    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        const surfaceHeight = surface.offsetHeight
        const surfaceTop = surface.getBoundingClientRect().top
        const technologyTopInSurface = technologyCards[0].getBoundingClientRect().top - surfaceTop
        const getSurfaceTravel = () => hero.offsetTop + hero.offsetHeight - HERO_SURFACE_OVERLAP

        root.style.setProperty('--desktop-surface-height', `${surfaceHeight}px`)
        root.style.setProperty('--desktop-surface-travel', `${getSurfaceTravel()}px`)
        root.classList.add('is-motion-ready')

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'desktop-hero-motion',
            trigger: stage,
            start: 'top top',
            end: () => `+=${window.innerHeight}`,
            pin: stage,
            pinSpacing: true,
            scrub: 0.25,
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
              clipPath: `inset(0px ${HERO_SURFACE_SIDE_INSET}px 0px ${HERO_SURFACE_SIDE_INSET}px round 32px)`,
            },
            {
              y: 0,
              clipPath: 'inset(0px 0px 0px 0px round 32px)',
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
        const pinEnd = () => timeline.scrollTrigger?.end ?? pinStart() + window.innerHeight
        const entranceStart = (topInSurface: number, viewportInset: number) => {
          const surfaceTravel = getSurfaceTravel()
          const viewportLine = window.innerHeight * (1 - viewportInset)
          const crossingTravel = surfaceTravel + topInSurface - viewportLine

          if (crossingTravel <= 0) return pinStart()
          if (crossingTravel <= surfaceTravel) {
            return pinStart() + (pinEnd() - pinStart()) * crossingTravel / surfaceTravel
          }

          return pinEnd() + crossingTravel - surfaceTravel
        }
        const technologyEntranceStart = () => entranceStart(
          technologyTopInSurface,
          TECHNOLOGY_ENTRANCE_VIEWPORT_INSET,
        )
        const createCardEntrance = (
          cards: HTMLElement[],
          start: () => number,
          stagger: number,
          id: string,
        ) => {
          gsap.set(cards, {
            autoAlpha: 0,
            rotationX: -68,
            z: -36,
            transformPerspective: 900,
            transformOrigin: '50% 0%',
            willChange: 'transform,opacity',
          })

          gsap.to(cards, {
            autoAlpha: 1,
            rotationX: 0,
            z: 0,
            transformPerspective: 900,
            duration: 0.84,
            stagger,
            ease: 'power3.out',
            clearProps: 'willChange',
            scrollTrigger: {
              id,
              trigger: stage,
              start,
              end: () => Math.max(start() + 1, pinEnd()),
              invalidateOnRefresh: true,
              toggleActions: 'play none none reverse',
            },
          })
        }

        createCardEntrance(
          technologyCards,
          technologyEntranceStart,
          0.06,
          'desktop-technology-cards-entrance',
        )

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
            <Benefits />
            <Technologies />
          </div>
        </div>
      </div>
    </div>
  )
}
