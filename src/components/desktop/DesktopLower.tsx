import { useRef, useState, type KeyboardEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createDesktopCardReveal, DESKTOP_CARD_REVEAL_START } from './desktopCardReveal'
import './desktop-lower.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (filename: string) => publicAsset(`assets/desktop/lower/${filename}`)
const connectAsset = (filename: string) => publicAsset(`assets/desktop/final/connect/${filename}`)
const CONNECT_PLACEHOLDER = '#desktop-connect'
const FOOTER_PLACEHOLDER = '#desktop-footer'

const topNavigation = [
  {
    title: 'Связь',
    links: ['Тарифы для смартфонов', 'Перейти в МегаФон', 'Роуминг', 'Личный кабинет'],
  },
  {
    title: 'Услуги и опции',
    links: ['Пополнить баланс', 'Интернет', 'Звонки и сообщения', 'Безопасность'],
  },
  {
    title: 'Развлечения',
    links: ['МегаКино', 'Игры', 'Акции', 'Кинотеатр START'],
  },
  {
    title: 'Поддержка',
    links: ['Частые вопросы', 'Карта покрытия', 'Салоны связи', 'Контакты'],
  },
] as const

const bottomNavigation = [
  {
    title: 'Интернет‑магазин',
    links: ['Смартфоны', 'Умные часы', 'Аксессуары', 'Покупка в кредит', 'Подобрать номер'],
  },
  {
    title: 'Самозанятым',
    links: ['Комплект для ПВЗ', 'Для маркетплейсов', 'Видеонаблюдение', 'Мобильный интернет', 'Акции'],
  },
  {
    title: 'Бизнесу',
    links: ['Мобильная связь', 'Виртуальная АТС', 'Номер 8-800', 'Рекламная платформа', 'МегаФон Облако'],
  },
  {
    title: 'О компании',
    links: ['Новости', 'Прессе', 'Инвесторам', 'Сотрудничество'],
  },
] as const

const closedQuestions = [
  'Работает ли эта услуга в моем регионе?',
  'Как работает услуга?',
  'Где посмотреть документы и узнать больше об услуге?',
] as const

const socialLinks = [
  { label: 'ВКонтакте', icon: 'social-vk.svg' },
  { label: 'Одноклассники', icon: 'social-ok.svg' },
  { label: 'YouTube', icon: 'social-youtube.svg' },
  { label: 'Сообщество МегаФона', icon: 'social-service.svg' },
  { label: 'Telegram', icon: 'social-telegram.svg' },
] as const

function StoreIcon({ platform }: { platform: 'ios' | 'android' }) {
  const layers = platform === 'ios'
    ? ['ios-1.svg', 'ios-2.svg', 'ios-3.svg']
    : ['android-1.svg', 'android-2.svg', 'android-3.svg', 'android-4.svg']

  return (
    <span className={`dl-store-icon dl-store-icon--${platform}`} aria-hidden="true">
      {layers.map((layer) => <img key={layer} src={lowerAsset(layer)} alt="" />)}
    </span>
  )
}

function FooterNavigationGroup({
  title,
  links,
  linkedTitle = false,
}: {
  title: string
  links: readonly string[]
  linkedTitle?: boolean
}) {
  return (
    <section className="dl-footer-nav-group">
      <h2>
        {linkedTitle
          ? <a href={FOOTER_PLACEHOLDER}>{title}</a>
          : title}
      </h2>
      <ul>
        {links.map((link) => (
          <li key={link}><a href={FOOTER_PLACEHOLDER}>{link}</a></li>
        ))}
      </ul>
    </section>
  )
}

function DesktopConnect() {
  const sectionRef = useRef<HTMLElement>(null)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const fadeRef = useRef<gsap.core.Timeline | null>(null)
  const reducedMotionRef = useRef(false)
  const activeTabRef = useRef(0)
  const [activeTab, setActiveTab] = useState(0)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const panels = section.querySelectorAll<HTMLElement>('.dl-connect-panel')
    const media = gsap.matchMedia()

    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      reducedMotionRef.current = Boolean(context.conditions?.reduce)
      // A single reversible crossfade preserves the current opacity on rapid clicks.
      const fade = gsap.timeline({ paused: true, defaults: { duration: 0.32, ease: 'power1.inOut' } })
        .fromTo(panels[0], { autoAlpha: 1 }, { autoAlpha: 0 }, 0)
        .fromTo(panels[1], { autoAlpha: 0 }, { autoAlpha: 1 }, 0)

      fade.progress(activeTabRef.current).pause()
      fadeRef.current = fade
      return () => { fadeRef.current = null }
    })

    media.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference)', () => {
      const trigger = section.querySelector<HTMLElement>('.dl-connect-panels')
      if (!trigger) return

      const rises = gsap.utils.toArray<HTMLElement>('.dl-connect-visual-rise', section)
      // Tab crossfade owns the panels; viewport motion owns only these nested
      // visual layers. Both illustrations share one entrance, not a tab replay.
      createDesktopCardReveal({
        items: rises.map(rise => ({
          rise,
          card: rise.querySelector<HTMLElement>('.dl-connect-visual')!,
        })),
        scrollTrigger: {
          id: 'desktop-connect-visual-entrance',
          trigger,
          start: DESKTOP_CARD_REVEAL_START,
          invalidateOnRefresh: true,
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => media.revert()
  }, { scope: sectionRef })

  function selectTab(index: number) {
    if (index === activeTabRef.current) return
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

  return (
    <section ref={sectionRef} id="desktop-connect" className="dl-connect" aria-labelledby="desktop-connect-title">
      <div className="dl-connect-header">
        <h2 id="desktop-connect-title">Как подключить</h2>
        <div className="dl-connect-tabs" role="tablist" aria-label="Статус абонента">
          {['Я новый абонент', 'Я клиент МегаФона'].map((label, index) => (
            <button
              key={label}
              ref={(element) => { tabsRef.current[index] = element }}
              id={`desktop-connect-tab-${index === 0 ? 'new' : 'customer'}`}
              className={`dl-connect-tab${activeTab === index ? ' is-selected' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={`desktop-connect-panel-${index === 0 ? 'new' : 'customer'}`}
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dl-connect-panels">
      <div
        id="desktop-connect-panel-new"
        className="dl-connect-panel dl-connect-panel--new"
        role="tabpanel"
        aria-labelledby="desktop-connect-tab-new"
        aria-hidden={activeTab !== 0}
        inert={activeTab !== 0}
      >
        <div className="dl-connect-visual-rise">
          <div className="dl-connect-visual dl-connect-visual--new" aria-hidden="true">
            <img src={connectAsset('phones.png')} alt="" width="1178" height="663" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="dl-connect-content">
          <h3>Перенесите номер или закажите новую сим-карту</h3>
          <div className="dl-connect-steps">
            <div className="dl-new-step">
              <img src={connectAsset('step-sim.svg')} alt="" width="32" height="32" />
              <p>Выберите тип сим-карты. Пластиковую или цифровую</p>
            </div>
            <div className="dl-new-step">
              <img src={connectAsset('step-phone.svg')} alt="" width="32" height="32" />
              <p>Подберите номер. Красивый или который легко запомнить</p>
            </div>
            <div className="dl-new-step">
              <img src={connectAsset('step-contract.svg')} alt="" width="32" height="32" />
              <p>Заключите договор связи в салоне МегаФона или онлайн</p>
            </div>
          </div>
          <div className="dl-connect-actions">
            <a className="dl-connect-cta dl-connect-cta--solid" href={CONNECT_PLACEHOLDER}>Заказать сим-карту</a>
            <a className="dl-connect-cta dl-connect-cta--outline" href={CONNECT_PLACEHOLDER}>Заказать новую сим-карту</a>
          </div>
        </div>
      </div>
      <div
        id="desktop-connect-panel-customer"
        className="dl-connect-panel dl-connect-panel--customer"
        role="tabpanel"
        aria-labelledby="desktop-connect-tab-customer"
        aria-hidden={activeTab !== 1}
        inert={activeTab !== 1}
      >
        <div className="dl-connect-visual-rise">
          <div className="dl-connect-visual" aria-hidden="true">
            <div className="dl-connect-phone">
              <img className="dl-connect-phone__screen" src={lowerAsset('customer-screen.png')} alt="" width="428" height="924" decoding="async" />
              <img className="dl-connect-phone__frame" src={lowerAsset('customer-phone.png')} alt="" width="1736" height="3528" decoding="async" />
            </div>
          </div>
        </div>
        <div className="dl-connect-content">
          <h3>Опциональный заголовок в одну или две строки</h3>
          <div className="dl-connect-steps">
            <div className="dl-new-step">
              <img src={connectAsset('step-sim.svg')} alt="" width="32" height="32" />
              <p>Призыв зайти в приложение МегаФона или личный кабинет</p>
            </div>
            <div className="dl-new-step">
              <img src={connectAsset('step-phone.svg')} alt="" width="32" height="32" />
              <p>Найти на главном меню нужную услугу</p>
            </div>
            <div className="dl-new-step">
              <img src={connectAsset('step-contract.svg')} alt="" width="32" height="32" />
              <p>Перейти на страницу и подтвердить использование</p>
            </div>
          </div>
          <div className="dl-connect-actions">
            <a className="dl-connect-cta dl-connect-cta--solid" href={CONNECT_PLACEHOLDER}>В приложение «МегаФон»</a>
            <a className="dl-connect-cta dl-connect-cta--outline" href={CONNECT_PLACEHOLDER}>В личный кабинет</a>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

function DesktopFaq() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const slots = gsap.utils.toArray<HTMLElement>('.dl-faq-reveal', section)
    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        slots.forEach((slot, index) => {
          const rise = slot.querySelector<HTMLElement>('.dl-faq-reveal__rise')
          const card = slot.querySelector<HTMLElement>('.dl-faq-row')
          if (!rise || !card) return

          createDesktopCardReveal({
            items: [{ rise, card }],
            scrollTrigger: {
              id: `desktop-faq-row-entrance-${index}`,
              trigger: slot,
              start: DESKTOP_CARD_REVEAL_START,
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
    <section ref={sectionRef} className="dl-faq" aria-labelledby="desktop-faq-title">
      <div className="dl-faq__inner">
        <h2 id="desktop-faq-title">Остались вопросы?</h2>
        <div className="dl-faq__items">
          <div className="dl-faq-reveal">
            <div className="dl-faq-reveal__rise">
              <article className="dl-faq-row dl-faq-row--open" aria-labelledby="desktop-faq-question-1">
                <header>
                  <h3 id="desktop-faq-question-1">Что такое 5G режим?</h3>
                  <img src={lowerAsset('faq-up.svg')} alt="" width="32" height="32" />
                </header>
                <p>«5G режим» — это специальная услуга мобильной связи, которая дает доступ к сетям пятого поколения, а в зонах без покрытия 5G автоматически включает оптимизированные настройки, ускоряя передачу данных до 60%</p>
              </article>
            </div>
          </div>

          {closedQuestions.map((question) => (
            <div className="dl-faq-reveal" key={question}>
              <div className="dl-faq-reveal__rise">
                <button
                  className="dl-faq-row dl-faq-row--closed"
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-expanded="false"
                >
                  <span>{question}</span>
                  <img src={lowerAsset('faq-down.svg')} alt="" width="32" height="32" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DesktopFooter() {
  return (
    <footer id="desktop-footer" className="dl-footer">
      <div className="dl-footer__inner">
        <nav className="dl-footer-navigation" aria-label="Разделы сайта">
          <div className="dl-footer-navigation__top">
            <div className="dl-footer-navigation__columns">
              {topNavigation.map((group) => <FooterNavigationGroup key={group.title} {...group} />)}
            </div>

            <section className="dl-footer-app" aria-labelledby="desktop-footer-app-title">
              <h2 id="desktop-footer-app-title"><a href={FOOTER_PLACEHOLDER}>Приложение «МегаФон»</a></h2>
              <div className="dl-footer-app__stores">
                <div className="dl-footer-app__buttons">
                  <a href={FOOTER_PLACEHOLDER} aria-label="Скачать приложение МегаФон для iOS">
                    <StoreIcon platform="ios" />
                    <span>iOS</span>
                  </a>
                  <a href={FOOTER_PLACEHOLDER} aria-label="Скачать приложение МегаФон для Android">
                    <StoreIcon platform="android" />
                    <span>Android</span>
                  </a>
                </div>
                <a className="dl-footer-app__qr-link" href={FOOTER_PLACEHOLDER} aria-label="Установить приложение МегаФон по QR-коду">
                  <img src={lowerAsset('footer-qr.png')} alt="QR-код для установки приложения МегаФон" width="83" height="116" />
                </a>
              </div>
            </section>
          </div>

          <div className="dl-footer-navigation__bottom">
            <div className="dl-footer-navigation__columns">
              {bottomNavigation.map((group) => <FooterNavigationGroup key={group.title} {...group} linkedTitle />)}
            </div>
            <div className="dl-footer-actions">
              <a href={FOOTER_PLACEHOLDER}>Оцените наш сайт</a>
              <a href={FOOTER_PLACEHOLDER}>Работа в МегаФоне</a>
            </div>
          </div>
        </nav>

        <div className="dl-footer-info">
          <div className="dl-footer-info__grid">
            <div className="dl-footer-privacy">
              <span className="dl-footer-privacy__age">6+</span>
              <div className="dl-footer-privacy__copy">
                <p>
                  Продолжая использовать наш сайт, вы даете согласие на обработку файлов Cookies и других пользовательских данных, в соответствии с{' '}
                  <a href={FOOTER_PLACEHOLDER}>Политикой конфиденциальности</a>
                </p>
                <a href={FOOTER_PLACEHOLDER}>Политика в отношении обработки персональных данных ПАО «МегаФон»</a>
              </div>
            </div>

            <div className="dl-footer-subscribe">
              <div className="dl-footer-subscribe__message">
                <img src={lowerAsset('footer-gift.png')} alt="" width="48" height="48" />
                <p>Делимся скидками и предложениями</p>
              </div>
              <a href={FOOTER_PLACEHOLDER}>
                <span>Подписаться</span>
                <img src={lowerAsset('footer-arrow.svg')} alt="" width="32" height="32" />
              </a>
            </div>
          </div>
        </div>

        <div className="dl-footer-bottom">
          <div className="dl-footer-bottom__left">
            <div className="dl-footer-copyright">
              <span className="dl-footer-copyright__mark"><img src={lowerAsset('footer-copyright.png')} alt="" width="24" height="24" /></span>
              <span>© 2026 ПАО «МегаФон»</span>
            </div>
            <div className="dl-footer-legal-links">
              <a href={FOOTER_PLACEHOLDER}>Условия оказания услуг</a>
              <a href={FOOTER_PLACEHOLDER}>Лицензии</a>
            </div>
          </div>

          <div className="dl-footer-bottom__right">
            <div className="dl-footer-socials">
              {socialLinks.map(({ label, icon }) => (
                <a href={FOOTER_PLACEHOLDER} aria-label={label} key={label}>
                  <img src={lowerAsset(icon)} alt="" width="32" height="32" />
                </a>
              ))}
            </div>
            <a className="dl-footer-coverage" href={FOOTER_PLACEHOLDER} aria-label="Самое широкое покрытие">
              <img src={lowerAsset('footer-coverage.png')} alt="Самое широкое покрытие" width="100" height="32" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function DesktopLower() {
  return (
    <div className="desktop-lower">
      <DesktopConnect />
      <DesktopFaq />
      <DesktopFooter />
    </div>
  )
}
