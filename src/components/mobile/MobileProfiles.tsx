import { useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { NESTED_CARD_REVEAL } from '../../motion/cardReveal'
import { createMobileCardReveal, MOBILE_CARD_REVEAL_START, MOBILE_CARD_REVEAL_TIMING, MOBILE_CARD_REVEAL_VIEWPORT_RATIO } from './mobileCardReveal'
import { useStackSwipe } from './useStackSwipe'
import { useHorizontalSlider } from './useHorizontalSlider'
import './mobile-profiles.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// These exports are byte-identical in the mobile and desktop Figma frames.
const sharedAsset = (filename: string) => publicAsset('assets/desktop/final/profiles/' + filename)
const mobileAsset = (filename: string) => publicAsset('assets/mobile/final/profile-' + filename)
const turboBadge = '4 слота турбо-ускорения в 2 раза'

type Profile = {
  id: string
  title: string
  description: ReactNode
  badges: string[]
  price: string
  oldPrice?: string
  image: string
}

const profiles: Profile[] = [
  {
    id: 'base',
    title: 'Мега 5G Базовый',
    description: <>Для тех, кому просто<br />нужна высокая скорость</>,
    badges: [turboBadge],
    price: '199 ₽',
    oldPrice: '249 ₽',
    image: sharedAsset('profile-base.png'),
  },
  {
    id: 'city',
    title: 'Для города',
    description: <>Настройки интернета<br />для активных горожан</>,
    badges: ['+50 ГБ', 'Подписка Whoosh', '+100 SMS', 'Безлимиты на городские карты', turboBadge],
    price: '219',
    image: sharedAsset('profile-city.png'),
  },
  {
    id: 'cinema',
    title: 'Для кино и видео',
    description: <>Фильмы и сериалы без пауз<br />и в высоком качестве</>,
    badges: ['+50 ГБ', 'Подписка на кинотеатр START', 'Безлимиты на онлайн-кинотеатры', turboBadge],
    price: '299 ₽',
    image: mobileAsset('cinema.png'),
  },
]

const durations = [
  { id: '6-hours', label: '6 часов', price: '120 ₽' },
  { id: '12-hours', label: '12 часов', price: '190 ₽' },
  { id: '24-hours', label: '24 часа', price: '190 ₽' },
]

function SpeedTag() {
  return (
    <span className="mf-mobile-profile__speed" aria-label="Скорость в 1,6 раза выше">
      <span>Скорость</span>
      <img src={sharedAsset('speed-factor.svg')} alt="" width="22" height="20" />
    </span>
  )
}

function ProfileActions({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className="mf-mobile-profile__actions">
      <a className="mf-mobile-profile__connect" href="#connect" aria-label={'Подключить профиль «' + title + '»'}>
        Подключить
      </a>
      <button className="mf-mobile-profile__details" type="button" aria-disabled="true" aria-label={'Подробнее о профиле «' + title + '»'}>
        <img src={sharedAsset('arrow-' + (dark ? 'dark' : 'light') + '.svg')} alt="" width="20" height="20" />
      </button>
    </div>
  )
}

function ProfileBadges({ badges }: { badges: string[] }) {
  return (
    <ul className="mf-mobile-profile__badges" aria-label="Возможности профиля">
      {badges.map((badge) => <li key={badge}>{badge}</li>)}
    </ul>
  )
}

function ProfileVisual({ image, variant }: { image: string; variant: string }) {
  return (
    <div className={'mf-mobile-profile__visual mf-mobile-profile__visual--' + variant} aria-hidden="true">
      <img className="mf-mobile-profile__image" src={image} alt="" width="3200" height="1800" loading="lazy" decoding="async" />
      <SpeedTag />
    </div>
  )
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <article className={'mf-mobile-profile mf-mobile-profile--' + profile.id}>
      <ProfileVisual image={profile.image} variant={profile.id} />
      <div className="mf-mobile-profile__content">
        <div className="mf-mobile-profile__copy">
          <h3>{profile.title}</h3>
          <p>{profile.description}</p>
        </div>
        <ProfileBadges badges={profile.badges} />
        <div className="mf-mobile-profile__price">
          <span>{profile.price}</span>
          {profile.oldPrice && <s>{profile.oldPrice}</s>}
          <span className="mf-mobile-profile__period">за 30 дней</span>
        </div>
        <ProfileActions title={profile.title} />
      </div>
    </article>
  )
}

function BoostIcon({ shape = 'circle', glyph }: { shape?: string; glyph: string }) {
  return (
    <span className="mf-mobile-boost__icon">
      <img className="mf-mobile-boost__icon-base" src={shape === 'circle' ? mobileAsset('boost-circle.svg') : sharedAsset('boost-' + shape + '.svg')} alt="" width="48" height="48" />
      <img className={'mf-mobile-boost__glyph mf-mobile-boost__glyph--' + glyph} src={glyph === 'plus' ? mobileAsset('boost-plus.svg') : sharedAsset('boost-' + glyph + '.svg')} alt="" width="24" height="24" />
    </span>
  )
}

function BoostCard() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const { page, onKeyDown, selectPage } = useStackSwipe(viewportRef, '.mf-mobile-boost__item')

  return (
    <article className="mf-mobile-boost" aria-labelledby="mf-mobile-boost-title">
      <h3 id="mf-mobile-boost-title">А если и этого мало, в каждом профиле есть дополнительное ускорение</h3>
      <div
        ref={viewportRef}
        className="mf-mobile-boost__viewport"
        role="region"
        aria-roledescription="карусель"
        aria-label="Дополнительное ускорение: листайте преимущества"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="mf-mobile-boost__item" role="group" aria-roledescription="слайд" aria-label="1 из 3" aria-hidden={page > 0}>
          <div className="mf-mobile-boost__item-rise">
            <p>Активируйте<br />турбо-режим<br />на 3 часа</p>
            <div className="mf-mobile-boost__icons" aria-hidden="true">
              <BoostIcon glyph="plus" /><BoostIcon glyph="hand" />
            </div>
          </div>
        </div>
        <div className="mf-mobile-boost__item" role="group" aria-roledescription="слайд" aria-label="2 из 3">
          <div className="mf-mobile-boost__item-rise">
            <p>4 бесплатных слота в месяц, далее – 49 ₽ за раз</p>
            <div className="mf-mobile-boost__icons" aria-hidden="true">
              <BoostIcon glyph="slots" /><BoostIcon shape="hexagon" glyph="bag" />
            </div>
          </div>
        </div>
        <div className="mf-mobile-boost__item" role="group" aria-roledescription="слайд" aria-label="3 из 3" aria-hidden={page === 0}>
          <div className="mf-mobile-boost__item-rise">
            <p>Скорость ещё выше, почти вдвое от стандартной</p>
            <div className="mf-mobile-boost__icons" aria-hidden="true">
              <BoostIcon glyph="chart" /><BoostIcon shape="diamond" glyph="rocket" />
            </div>
          </div>
        </div>
      </div>
      <div className="mf-mobile-boost__pagination" aria-label="Страницы преимуществ">
        <button type="button" aria-label="Первая страница преимуществ" aria-pressed={page === 0} onClick={() => selectPage(0)} />
        <button type="button" aria-label="Вторая страница преимуществ" aria-pressed={page === 1} onClick={() => selectPage(1)} />
        <span className="visually-hidden" role="status" aria-live="polite">Положение {page + 1} из 2</span>
      </div>
    </article>
  )
}

function PremiumCard() {
  const [selectedDuration, setSelectedDuration] = useState(durations[0].id)
  const durationsRef = useRef<HTMLFieldSetElement>(null)
  const revealDuration = useHorizontalSlider(durationsRef, '.mf-mobile-duration')

  return (
    <article className="mf-mobile-profile mf-mobile-profile--premium">
      <ProfileVisual image={sharedAsset('profile-megaspeed.png')} variant="premium" />
      <div className="mf-mobile-profile__content">
        <div className="mf-mobile-profile__copy">
          <h3>Мегаскорость</h3>
          <p>Во время важного звонка или если хочется посмотреть фильм в высоком качестве</p>
        </div>
        <ProfileBadges badges={[turboBadge]} />
        <fieldset
          ref={durationsRef}
          className="mf-mobile-profile__durations"
          onKeyDown={(event) => {
            if (event.key !== 'Home' && event.key !== 'End') return
            event.preventDefault()
            const index = event.key === 'Home' ? 0 : durations.length - 1
            setSelectedDuration(durations[index].id)
            revealDuration(index)
            event.currentTarget.querySelectorAll<HTMLInputElement>('input')[index]?.focus({ preventScroll: true })
          }}
        >
          <legend className="visually-hidden">Выберите длительность ускорения</legend>
          {durations.map((duration, index) => {
            const isSelected = duration.id === selectedDuration
            return (
              <label
                className={'mf-mobile-duration' + (isSelected ? ' mf-mobile-duration--selected' : '')}
                key={duration.id}
                onClick={(event) => {
                  if (event.target instanceof HTMLInputElement) return
                  // Focus a partially hidden radio without the browser jumping
                  // to it before the slider can perform its smooth transition.
                  event.preventDefault()
                  setSelectedDuration(duration.id)
                  event.currentTarget.querySelector('input')?.focus({ preventScroll: true })
                  revealDuration(index)
                }}
              >
                <span className="mf-mobile-duration__rise">
                  <input
                    type="radio"
                    className="visually-hidden"
                    name="mf-mobile-profile-duration"
                    value={duration.id}
                    checked={isSelected}
                    onClick={() => revealDuration(index)}
                    onFocus={() => revealDuration(index)}
                    onChange={() => {
                      setSelectedDuration(duration.id)
                      revealDuration(index)
                    }}
                  />
                  <span className="mf-mobile-duration__top">
                    <span>{duration.label}</span>
                    <img src={sharedAsset('radio-' + (isSelected ? 'checked' : 'unchecked') + '.svg')} alt="" width="32" height="32" />
                  </span>
                  <span className="mf-mobile-duration__price">{duration.price}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
        <ProfileActions title="Мегаскорость" dark />
      </div>
    </article>
  )
}

function ProfileReveal({ children }: { children: ReactNode }) {
  return <div className="mf-mobile-profile-reveal"><div className="mf-mobile-profile-reveal__content">{children}</div></div>
}

export function MobileProfiles() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return
    const media = gsap.matchMedia()
    media.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      root.querySelectorAll<HTMLElement>('.mf-mobile-profile-reveal').forEach((slot, index) => {
        const rise = slot.querySelector<HTMLElement>('.mf-mobile-profile-reveal__content')
        const card = rise?.querySelector<HTMLElement>('.mf-mobile-profile, .mf-mobile-boost')
        if (!rise || !card) return
        // Inner surfaces reveal independently of the outer swipe/layout items.
        const nestedItems = card.querySelectorAll<HTMLElement>(
          '.mf-mobile-boost__item-rise, .mf-mobile-duration__rise',
        )
        const nestedViewport = card.querySelector<HTMLElement>(
          '.mf-mobile-boost__viewport, .mf-mobile-profile__durations',
        )
        const nestedReveal = nestedItems.length
          ? gsap.timeline({
            id: card.classList.contains('mf-mobile-boost')
              ? 'mobile-boost-items-entrance'
              : 'mobile-duration-items-entrance',
            paused: true,
          })
          : null
        nestedItems.forEach((item, itemIndex) => {
          nestedReveal!.fromTo(item, {
            y: NESTED_CARD_REVEAL.rise,
            autoAlpha: 0,
          }, {
            y: 0,
            autoAlpha: 1,
            ...MOBILE_CARD_REVEAL_TIMING,
            immediateRender: true,
          }, itemIndex * NESTED_CARD_REVEAL.stagger)
        })

        let nestedStarted = false
        const resetNested = () => {
          nestedStarted = false
          nestedReveal?.pause(0)
        }

        const parentReveal = createMobileCardReveal({
          items: [{ rise, card }],
          scrollTrigger: {
            id: 'mobile-profile-card-entrance-' + index,
            trigger: slot,
            start: MOBILE_CARD_REVEAL_START,
            invalidateOnRefresh: true,
            toggleActions: 'play none none reverse',
            onLeaveBack: nestedReveal ? resetNested : undefined,
          },
        })

        if (nestedReveal) {
          let nestedTrigger: ScrollTrigger | null = null
          const revealNested = () => {
            if (!nestedStarted && !parentReveal.reversed()
              && parentReveal.progress() >= NESTED_CARD_REVEAL.parentProgress
              && nestedTrigger && nestedTrigger.scroll() >= nestedTrigger.start) {
              nestedStarted = true
              nestedReveal.play(0)
            }
          }
          if (nestedViewport) {
            nestedTrigger = ScrollTrigger.create({
              id: 'mobile-nested-card-entrance-' + index,
              trigger: slot,
              start: () => {
                // Measure layout offsets, unaffected by the parent's entrance
                // transforms. Tall mobile cards reveal their inner row on sight.
                let top = 0
                let element: HTMLElement | null = nestedViewport
                while (element) {
                  top += element.offsetTop
                  element = element.offsetParent as HTMLElement | null
                }
                return top - window.innerHeight * MOBILE_CARD_REVEAL_VIEWPORT_RATIO
              },
              end: '+=1',
              invalidateOnRefresh: true,
              onEnter: revealNested,
              onLeaveBack: resetNested,
            })
          }
          parentReveal.eventCallback('onUpdate', revealNested)
          revealNested()
        }
      })
    })
    return () => media.revert()
  }, { scope: rootRef })

  return (
    <div ref={rootRef} className="mf-mobile-profiles-root">
      <section id="profiles" className="mf-mobile-profiles" aria-labelledby="mf-mobile-profiles-title">
        <h2 id="mf-mobile-profiles-title">Несколько профилей<br />под разные типы<br />ваших задач</h2>
        <div className="mf-mobile-profiles__cards">
          {profiles.map((profile) => <ProfileReveal key={profile.id}><ProfileCard profile={profile} /></ProfileReveal>)}
          <ProfileReveal><BoostCard /></ProfileReveal>
        </div>
      </section>
      <section className="mf-mobile-profiles mf-mobile-profiles--premium" aria-labelledby="mf-mobile-premium-title">
        <h2 id="mf-mobile-premium-title">Или выберите опцию<br />на несколько часов, чтобы<br />попробовать</h2>
        <ProfileReveal><PremiumCard /></ProfileReveal>
      </section>
    </div>
  )
}
