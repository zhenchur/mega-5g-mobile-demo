import { useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { NESTED_CARD_REVEAL } from '../../motion/cardReveal'
import { createDesktopCardReveal, DESKTOP_CARD_REVEAL_START, DESKTOP_CARD_REVEAL_TIMING } from './desktopCardReveal'
import './desktop-profiles.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const profileAsset = (filename: string) => publicAsset('assets/desktop/final/profiles/' + filename)
const turboBadge = '4 слота турбо-ускорения в 2 раза'

type StandardProfile = {
  id: string
  title: ReactNode
  accessibleTitle: string
  description: ReactNode
  price: string
  oldPrice?: string
  badges: string[]
  image: string
}

const standardProfiles: StandardProfile[] = [
  {
    id: 'base',
    title: <>Мега 5G<br />Базовый</>,
    accessibleTitle: 'Мега 5G Базовый',
    description: 'Для тех, кому просто нужна высокая скорость',
    price: '199 ₽',
    oldPrice: '249 ₽',
    badges: [turboBadge],
    image: 'profile-base.png',
  },
  {
    id: 'city',
    title: 'Для города',
    accessibleTitle: 'Для города',
    description: 'Настройки интернета для активных горожан',
    price: '219',
    badges: ['+50 ГБ', 'Подписка Whoosh', '+100 SMS', 'Безлимиты на городские карты', turboBadge],
    image: 'profile-city.png',
  },
  {
    id: 'cinema',
    title: 'Для кино и видео',
    accessibleTitle: 'Для кино и видео',
    description: <>Фильмы и сериалы без пауз<br />и в высоком качестве</>,
    price: '219',
    badges: ['+50 ГБ', 'Подписка Whoosh', '+100 SMS', 'Безлимиты на городские карты', turboBadge],
    image: 'profile-cinema.png',
  },
]

const durationOptions = [
  { id: '6-hours', label: '6 часов', price: '120 ₽' },
  { id: '12-hours', label: '12 часов', price: '190 ₽' },
  { id: '24-hours', label: '24 часа', price: '190 ₽' },
]

function SpeedTag() {
  return (
    <span className="desktop-profile-card__speed" aria-label="Скорость 1,6 раза">
      <span>Скорость</span>
      <img src={profileAsset('speed-factor.svg')} alt="" width="22" height="20" />
    </span>
  )
}

function ProfileActions({ profileTitle, dark = false }: { profileTitle: string; dark?: boolean }) {
  return (
    <div className="desktop-profile-card__actions">
      <button
        className="desktop-profile-card__button desktop-profile-card__button--primary"
        type="button"
        aria-label={'Подключить профиль «' + profileTitle + '»'}
      >
        Подключить
      </button>
      <button
        className="desktop-profile-card__button desktop-profile-card__button--secondary"
        type="button"
        aria-label={'Подробнее о профиле «' + profileTitle + '»'}
      >
        <img src={profileAsset('arrow-' + (dark ? 'dark' : 'light') + '.svg')} alt="" width="20" height="20" />
      </button>
    </div>
  )
}

function ProfileBadges({ badges }: { badges: string[] }) {
  return (
    <ul className="desktop-profile-card__badges" aria-label="Возможности профиля">
      {badges.map((badge, index) => (
        <li
          className={'desktop-profile-card__badge' + (index === 0 ? ' desktop-profile-card__badge--compact' : '')}
          key={badge}
        >
          {badge}
        </li>
      ))}
    </ul>
  )
}

function StandardProfileCard({ profile }: { profile: StandardProfile }) {
  return (
    <article className={'desktop-profile-card desktop-profile-card--' + profile.id}>
      <div className="desktop-profile-card__content">
        <div className="desktop-profile-card__summary">
          <div className="desktop-profile-card__copy">
            <div className="desktop-profile-card__title-row">
              <h3 className="desktop-profile-card__title">{profile.title}</h3>
              <SpeedTag />
            </div>
            <p className="desktop-profile-card__description">{profile.description}</p>
          </div>
          <ProfileBadges badges={profile.badges} />
        </div>

        <div className="desktop-profile-card__purchase">
          <div className="desktop-profile-card__price-tags">
            <span className="desktop-profile-card__price">{profile.price}</span>
            {profile.oldPrice && <s className="desktop-profile-card__old-price">{profile.oldPrice}</s>}
            <span className="desktop-profile-card__period">за 30 дней</span>
          </div>
          <ProfileActions profileTitle={profile.accessibleTitle} />
        </div>
      </div>

      <div className="desktop-profile-card__visual" aria-hidden="true">
        <img
          className="desktop-profile-card__image"
          src={profileAsset(profile.image)}
          alt=""
          width="3200"
          height="1800"
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  )
}

function BoostIcon({ shape, glyph }: { shape: string; glyph: string }) {
  return (
    <span className="desktop-profile-boost__icon">
      <img className="desktop-profile-boost__icon-base" src={profileAsset('boost-' + shape + '.svg')} alt="" width="48" height="48" />
      <img className={'desktop-profile-boost__glyph desktop-profile-boost__glyph--' + glyph} src={profileAsset('boost-' + glyph + '.svg')} alt="" />
    </span>
  )
}

function ExtraBoostCard() {
  return (
    <article className="desktop-profile-card desktop-profile-boost" aria-labelledby="desktop-profile-boost-title">
      <h3 id="desktop-profile-boost-title">
        А если и этого мало, в каждом<br />
        профиле есть дополнительное<br />
        ускорение
      </h3>
      <div className="desktop-profile-boost__items">
        <div className="desktop-profile-boost__item-rise">
          <div className="desktop-profile-boost__item">
            <p>Активируйте турбо-режим<br />на 3 часа</p>
            <div className="desktop-profile-boost__icons" aria-hidden="true">
              <BoostIcon shape="circle" glyph="arrow" />
              <BoostIcon shape="square" glyph="hand" />
            </div>
          </div>
        </div>
        <div className="desktop-profile-boost__item-rise">
          <div className="desktop-profile-boost__item">
            <p>4 бесплатных слота в месяц,<br />далее – 49 ₽ за раз</p>
            <div className="desktop-profile-boost__icons" aria-hidden="true">
              <BoostIcon shape="circle" glyph="slots" />
              <BoostIcon shape="hexagon" glyph="bag" />
            </div>
          </div>
        </div>
        <div className="desktop-profile-boost__item-rise">
          <div className="desktop-profile-boost__item">
            <p>Скорость ещё выше, почти вдвое от стандартной</p>
            <div className="desktop-profile-boost__icons" aria-hidden="true">
              <BoostIcon shape="circle" glyph="chart" />
              <BoostIcon shape="diamond" glyph="rocket" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function TimedProfileCard() {
  const [selectedDuration, setSelectedDuration] = useState(durationOptions[0].id)

  return (
    <article className="desktop-profile-card desktop-profile-card--timed">
      <div className="desktop-profile-card__content desktop-profile-card__content--timed">
        <div className="desktop-profile-card__summary">
          <div className="desktop-profile-card__copy">
            <div className="desktop-profile-card__title-row">
              <h3 className="desktop-profile-card__title">Мегаскорость</h3>
              <SpeedTag />
            </div>
            <p className="desktop-profile-card__description">
              Во время важного звонка или если хочется посмотреть фильм в высоком качестве
            </p>
          </div>
          <ProfileBadges badges={[turboBadge]} />
        </div>

        <fieldset className="desktop-profile-card__duration-group">
          <legend className="visually-hidden">Выберите длительность ускорения</legend>
          {durationOptions.map((option) => {
            const isSelected = selectedDuration === option.id
            return (
              <div className="desktop-profile-card__duration-rise" key={option.id}>
                <label
                  className={'desktop-profile-card__duration' + (isSelected ? ' desktop-profile-card__duration--selected' : '')}
                >
                  <input
                    className="desktop-profile-card__duration-input"
                    type="radio"
                    name="desktop-profile-duration"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedDuration(option.id)}
                  />
                  <span className="desktop-profile-card__duration-main">
                    <span className="desktop-profile-card__duration-label">{option.label}</span>
                    <img
                      className="desktop-profile-card__duration-radio"
                      src={profileAsset('radio-' + (isSelected ? 'checked' : 'unchecked') + '.svg')}
                      alt=""
                      width="32"
                      height="32"
                    />
                  </span>
                  <span className="desktop-profile-card__duration-price">{option.price}</span>
                </label>
              </div>
            )
          })}
        </fieldset>

        <ProfileActions profileTitle="Мегаскорость" dark />
      </div>
      <div className="desktop-profile-card__visual" aria-hidden="true">
        <img
          className="desktop-profile-card__image desktop-profile-card__image--timed"
          src={profileAsset('profile-megaspeed.png')}
          alt=""
          width="3200"
          height="1800"
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  )
}

function ProfileReveal({ children }: { children: ReactNode }) {
  return (
    <div className="desktop-profile-reveal">
      <div className="desktop-profile-reveal__rise">{children}</div>
    </div>
  )
}

export function DesktopProfiles() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const slots = gsap.utils.toArray<HTMLElement>('.desktop-profile-reveal', root)
    const media = gsap.matchMedia()
    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        slots.forEach((slot, index) => {
          const rise = slot.querySelector<HTMLElement>('.desktop-profile-reveal__rise')
          const card = rise?.querySelector<HTMLElement>('.desktop-profile-card')
          if (!rise || !card) return

          const nestedItems = card.querySelectorAll<HTMLElement>(
            '.desktop-profile-boost__item-rise, .desktop-profile-card__duration-rise',
          )
          // Playback is independent of the parent's duration, but starts from
          // its progress rather than a second viewport/geometry trigger.
          const nestedReveal = nestedItems.length
            ? gsap.timeline({
              id: card.classList.contains('desktop-profile-boost')
                ? 'desktop-boost-items-entrance'
                : 'desktop-duration-items-entrance',
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
              ...DESKTOP_CARD_REVEAL_TIMING,
              immediateRender: true,
            }, itemIndex * NESTED_CARD_REVEAL.stagger)
          })

          let nestedStarted = false
          const resetNested = () => {
            nestedStarted = false
            nestedReveal?.pause(0)
          }

          const parentReveal = createDesktopCardReveal({
            items: [{ rise, card }],
            scrollTrigger: {
              id: 'desktop-profile-card-entrance-' + index,
              trigger: slot,
              start: DESKTOP_CARD_REVEAL_START,
              invalidateOnRefresh: true,
              toggleActions: 'play none none reverse',
              // Reset immediately when the parent starts reversing, not when
              // its playhead eventually crosses the launch point again.
              onLeaveBack: nestedReveal ? resetNested : undefined,
            },
          })

          if (nestedReveal) {
            const revealNested = () => {
              if (!nestedStarted && !parentReveal.reversed()
                && parentReveal.progress() >= NESTED_CARD_REVEAL.parentProgress) {
                nestedStarted = true
                nestedReveal.play(0)
              }
            }
            parentReveal.eventCallback('onUpdate', revealNested)
            // Covers setup after scroll restoration or a deep-link jump.
            revealNested()
          }
        })
      },
    )

    return () => media.revert()
  }, { scope: rootRef })

  return (
    <div ref={rootRef}>
      <section id="desktop-profiles" className="desktop-profiles" aria-labelledby="desktop-profiles-title">
        <div className="desktop-profiles__inner">
          <h2 className="desktop-profiles__title" id="desktop-profiles-title">
            Несколько профилей<br />под разные типы ваших задач
          </h2>
          <div className="desktop-profiles__cards">
            {standardProfiles.map((profile) => (
              <ProfileReveal key={profile.id}>
                <StandardProfileCard profile={profile} />
              </ProfileReveal>
            ))}
            <ProfileReveal>
              <ExtraBoostCard />
            </ProfileReveal>
          </div>
        </div>
      </section>
      <section className="desktop-profiles desktop-profiles--timed" aria-labelledby="desktop-timed-title">
        <div className="desktop-profiles__inner">
          <h2 className="desktop-profiles__title" id="desktop-timed-title">
            Или выберите опцию на несколько часов,<br />чтобы попробовать
          </h2>
          <ProfileReveal>
            <TimedProfileCard />
          </ProfileReveal>
        </div>
      </section>
    </div>
  )
}
