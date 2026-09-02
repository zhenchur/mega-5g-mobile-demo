import { useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import './desktop-profiles.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type StandardProfile = {
  title: string
  description: ReactNode
  price: string
  badges: string[]
  image: string
  imageClassName: string
}

const standardProfiles: StandardProfile[] = [
  {
    title: 'Кино',
    description: (
      <>
        Фильмы и сериалы без пауз
        <br />и в высоком качестве
      </>
    ),
    price: '299 ₽',
    badges: ['Ускорение 60%', 'START', '+20 ГБ', 'Видео до 4K', 'Без ожидания'],
    image: 'assets/desktop/profiles/profile-cinema.png',
    imageClassName: 'desktop-profile-card__image--cinema',
  },
  {
    title: 'Город',
    description: 'Настройки интернета для активных горожан',
    price: '219 ₽',
    badges: ['Ускорение 60%', 'Whoosh', '+25 ГБ', 'Безлимит на самокаты и карты'],
    image: 'assets/desktop/profiles/profile-city.png',
    imageClassName: 'desktop-profile-card__image--city',
  },
  {
    title: 'Ускорение',
    description: (
      <>
        Высокая скорость интернета,
        <br />даже когда сеть перегружена
      </>
    ),
    price: '219 ₽',
    badges: ['Ускорение 60%', '100% ускорение на 3 часа'],
    image: 'assets/desktop/profiles/profile-speed.png',
    imageClassName: 'desktop-profile-card__image--speed',
  },
]

const durationOptions = [
  { id: '6-hours', label: 'на 6 часов', price: '129 ₽' },
  { id: '12-hours', label: 'на 12 часов', price: '139 ₽' },
  { id: '24-hours', label: 'на 24 часа', price: '149 ₽' },
]

function ProfileActions({ profileTitle }: { profileTitle: string }) {
  return (
    <div className="desktop-profile-card__actions">
      <button
        className="desktop-profile-card__button desktop-profile-card__button--primary"
        type="button"
        aria-label={`Подключить профиль «${profileTitle}»`}
      >
        Подключить
      </button>
      <button
        className="desktop-profile-card__button desktop-profile-card__button--secondary"
        type="button"
        aria-label={`Подробнее о профиле «${profileTitle}»`}
      >
        Подробнее
      </button>
    </div>
  )
}

function PriceTags({ price }: { price: string }) {
  return (
    <div className="desktop-profile-card__price-tags" aria-label={`${price} за 30 дней`}>
      <span className="desktop-profile-card__price">{price}</span>
      <span className="desktop-profile-card__period">за 30 дней</span>
    </div>
  )
}

function StandardProfileCard({ profile }: { profile: StandardProfile }) {
  return (
    <article className="desktop-profile-card">
      <div className="desktop-profile-card__content">
        <div className="desktop-profile-card__summary">
          <div className="desktop-profile-card__copy">
            <div className="desktop-profile-card__title-row">
              <h3 className="desktop-profile-card__title">{profile.title}</h3>
              <PriceTags price={profile.price} />
            </div>
            <p className="desktop-profile-card__description">{profile.description}</p>
          </div>

          <ul
            className={`desktop-profile-card__badges${profile.badges.length <= 2 ? ' desktop-profile-card__badges--single-row' : ''}`}
            aria-label="Возможности профиля"
          >
            {profile.badges.map((badge) => (
              <li className="desktop-profile-card__badge" key={badge}>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <ProfileActions profileTitle={profile.title} />
      </div>

      <div className="desktop-profile-card__visual" aria-hidden="true">
        <img
          className={`desktop-profile-card__image ${profile.imageClassName}`}
          src={publicAsset(profile.image)}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  )
}

function TimedProfileCard() {
  const [selectedDuration, setSelectedDuration] = useState(durationOptions[0].id)

  return (
    <article className="desktop-profile-card desktop-profile-card--timed">
      <div className="desktop-profile-card__content desktop-profile-card__content--timed">
        <div className="desktop-profile-card__copy">
          <div className="desktop-profile-card__title-row">
            <h3 className="desktop-profile-card__title">Ускорение на время</h3>
          </div>
          <p className="desktop-profile-card__description">
            Турбоускорение в 2 раза, когда нужна
            <br />максимальная скорость на некоторое время
          </p>
        </div>

        <fieldset className="desktop-profile-card__duration-group">
          <legend className="visually-hidden">Выберите длительность ускорения</legend>
          {durationOptions.map((option) => {
            const isSelected = selectedDuration === option.id

            return (
              <label
                className={`desktop-profile-card__duration${isSelected ? ' desktop-profile-card__duration--selected' : ''}`}
                key={option.id}
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
                    src={publicAsset(
                      `assets/desktop/profiles/radio-${isSelected ? 'checked' : 'unchecked'}.svg`,
                    )}
                    alt=""
                  />
                </span>
                <span className="desktop-profile-card__duration-price">{option.price}</span>
              </label>
            )
          })}
        </fieldset>

        <ProfileActions profileTitle="Ускорение на время" />
      </div>

      <div className="desktop-profile-card__visual" aria-hidden="true">
        <img
          className="desktop-profile-card__image desktop-profile-card__image--timed"
          src={publicAsset('assets/desktop/profiles/profile-timed-speed.png')}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  )
}

export function DesktopProfiles() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current

    if (!section) return

    const cards = gsap.utils.toArray<HTMLElement>('.desktop-profile-card', section)
    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        gsap.set(cards, {
          autoAlpha: 0,
          rotationX: -68,
          z: -36,
          transformPerspective: 900,
          transformOrigin: '50% 0%',
          willChange: 'transform,opacity',
        })

        cards.forEach((card, index) => {
          gsap.to(card, {
            autoAlpha: 1,
            rotationX: 0,
            z: 0,
            transformPerspective: 900,
            duration: 0.84,
            ease: 'power3.out',
            clearProps: 'willChange',
            scrollTrigger: {
              id: `desktop-profile-card-entrance-${index}`,
              trigger: card,
              start: 'top 85%',
              invalidateOnRefresh: true,
              toggleActions: 'play none none reverse',
            },
          })
        })
      },
    )

    return () => media.revert()
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id="desktop-profiles"
      className="desktop-profiles"
      aria-labelledby="desktop-profiles-title"
    >
      <div className="desktop-profiles__inner">
        <h2 className="desktop-profiles__title" id="desktop-profiles-title">
          Выберите свой Мега 5G
        </h2>

        <div className="desktop-profiles__cards">
          {standardProfiles.map((profile) => (
            <StandardProfileCard profile={profile} key={profile.title} />
          ))}
          <TimedProfileCard />
        </div>
      </div>
    </section>
  )
}
