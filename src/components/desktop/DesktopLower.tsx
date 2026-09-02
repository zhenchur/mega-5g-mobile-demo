import { useRef, useState, type KeyboardEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import './desktop-lower.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (filename: string) => publicAsset(`assets/desktop/lower/${filename}`)
const CONNECT_PLACEHOLDER = '#desktop-connect'
const FOOTER_PLACEHOLDER = '#desktop-footer'

type ConnectTab = 'new' | 'customer'

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

function NewSubscriberPanel({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      id="desktop-connect-panel-new"
      className="dl-connect-new"
      role="tabpanel"
      aria-labelledby="desktop-connect-tab-new"
      hidden={hidden}
    >
      <article className="dl-new-card">
        <div className="dl-new-card__visual" aria-hidden="true">
          <div className="dl-new-card__port-art">
            <img src={lowerAsset('connect-port.png')} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="dl-new-card__body">
          <div>
            <h3>Перейти в МегаФон — просто!</h3>
            <div className="dl-new-card__steps dl-new-card__steps--port">
              <div className="dl-new-step">
                <img src={lowerAsset('step-transfer.svg')} alt="" width="32" height="32" />
                <p>Оформите онлайн-заявку на перенос своего номера</p>
              </div>
              <div className="dl-new-step">
                <img src={lowerAsset('step-sim.svg')} alt="" width="32" height="32" />
                <p>Получите новую сим-карту с временным номером. <a href={CONNECT_PLACEHOLDER}>Зачем она нужна?</a></p>
              </div>
              <div className="dl-new-step">
                <img src={lowerAsset('step-clock.svg')} alt="" width="32" height="32" />
                <p>Дождитесь переноса номера. Обычно это занимает 8 дней</p>
              </div>
            </div>
          </div>
          <a className="dl-connect-cta dl-connect-cta--solid" href={CONNECT_PLACEHOLDER}>Перенести номер</a>
        </div>
      </article>

      <article className="dl-new-card">
        <div className="dl-new-card__visual" aria-hidden="true">
          <img className="dl-new-card__sim-art" src={lowerAsset('connect-sim.png')} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="dl-new-card__body dl-new-card__body--sim">
          <div>
            <h3>Всего 3 шага — и вы в МегаФоне!</h3>
            <div className="dl-new-card__steps dl-new-card__steps--sim">
              <div className="dl-new-step">
                <img src={lowerAsset('step-sim.svg')} alt="" width="32" height="32" />
                <p>Выберите тип сим-карты. Пластиковую или цифровую</p>
              </div>
              <div className="dl-new-step">
                <img src={lowerAsset('step-phone.svg')} alt="" width="32" height="32" />
                <p>Подберите номер. Красивый или который легко запомнить</p>
              </div>
              <div className="dl-new-step">
                <img src={lowerAsset('step-contract.svg')} alt="" width="32" height="32" />
                <p>Заключите договор связи в салоне МегаФона или онлайн</p>
              </div>
            </div>
          </div>
          <a className="dl-connect-cta dl-connect-cta--solid" href={CONNECT_PLACEHOLDER}>Заказать сим-карту</a>
        </div>
      </article>
    </div>
  )
}

function ExistingCustomerPanel({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      id="desktop-connect-panel-customer"
      className="dl-connect-customer"
      role="tabpanel"
      aria-labelledby="desktop-connect-tab-customer"
      hidden={hidden}
    >
      <div className="dl-customer-phone" aria-hidden="true">
        <div className="dl-customer-phone__canvas">
          <img className="dl-customer-phone__screen" src={lowerAsset('customer-screen.png')} alt="" loading="lazy" decoding="async" />
          <img className="dl-customer-phone__bezel" src={lowerAsset('customer-phone.png')} alt="" loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="dl-customer-content">
        <ol className="dl-customer-steps">
          <li className="is-current">
            <span className="dl-customer-step-number">1</span>
            <p>
              Зайдите в <a href={CONNECT_PLACEHOLDER}>приложение «МегаФон»</a> или в{' '}
              <a href={CONNECT_PLACEHOLDER}>Личный кабинет</a>.
            </p>
          </li>
          <li>
            <span className="dl-customer-step-number">2</span>
            <p>На главном экране в блоке «Сервисы» выберите вкладку «5G».</p>
          </li>
          <li>
            <span className="dl-customer-step-number">3</span>
            <p>Вы на месте, выбирайте профиль</p>
          </li>
        </ol>
        <div className="dl-customer-actions">
          <a className="dl-connect-cta dl-connect-cta--solid" href={CONNECT_PLACEHOLDER}>Заказать сим-карту</a>
          <a className="dl-connect-cta dl-connect-cta--outline" href={CONNECT_PLACEHOLDER}>Перенести номер</a>
        </div>
      </div>
    </div>
  )
}

function DesktopConnect() {
  const sectionRef = useRef<HTMLElement>(null)
  const tabs: readonly ConnectTab[] = ['new', 'customer']
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeTab, setActiveTab] = useState<ConnectTab>('new')

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = gsap.utils.toArray<HTMLElement>('.dl-new-card', section)
    const row = section.querySelector<HTMLElement>('.dl-connect-new')
    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        if (!row || cards.length === 0) return

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
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'willChange',
          scrollTrigger: {
            id: 'desktop-connect-cards-entrance',
            trigger: row,
            start: 'top 85%',
            invalidateOnRefresh: true,
            toggleActions: 'play none none reverse',
          },
        })
      },
    )

    return () => media.revert()
  }, { scope: sectionRef })

  const selectAndFocus = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length
    setActiveTab(tabs[nextIndex])
    tabRefs.current[nextIndex]?.focus()
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const activeIndex = tabs.indexOf(activeTab)
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectAndFocus(activeIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectAndFocus(activeIndex + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectAndFocus(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectAndFocus(tabs.length - 1)
    }
  }

  return (
    <section ref={sectionRef} id="desktop-connect" className={`dl-connect dl-connect--${activeTab}`} aria-labelledby="desktop-connect-title">
      <div className="dl-connect-header">
        <h2 id="desktop-connect-title">Как подключить</h2>
        <div className="dl-connect-tabs" role="tablist" aria-label="Выберите статус абонента" onKeyDown={handleTabKeyDown}>
          <button
            id="desktop-connect-tab-new"
            ref={(node) => { tabRefs.current[0] = node }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'new'}
            aria-controls="desktop-connect-panel-new"
            tabIndex={activeTab === 'new' ? 0 : -1}
            onClick={() => setActiveTab('new')}
          >
            Я новый абонент
          </button>
          <button
            id="desktop-connect-tab-customer"
            ref={(node) => { tabRefs.current[1] = node }}
            type="button"
            role="tab"
            aria-selected={activeTab === 'customer'}
            aria-controls="desktop-connect-panel-customer"
            tabIndex={activeTab === 'customer' ? 0 : -1}
            onClick={() => setActiveTab('customer')}
          >
            Я клиент МегаФона
          </button>
        </div>
      </div>

      <NewSubscriberPanel hidden={activeTab !== 'new'} />
      <ExistingCustomerPanel hidden={activeTab !== 'customer'} />
    </section>
  )
}

function DesktopFaq() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const rows = gsap.utils.toArray<HTMLElement>('.dl-faq-row', section)
    const media = gsap.matchMedia()

    media.add(
      '(min-width: 1280px) and (prefers-reduced-motion: no-preference)',
      () => {
        gsap.set(rows, {
          autoAlpha: 0,
          rotationX: -68,
          z: -36,
          transformPerspective: 900,
          transformOrigin: '50% 0%',
          willChange: 'transform,opacity',
        })

        rows.forEach((row, index) => {
          gsap.to(row, {
            autoAlpha: 1,
            rotationX: 0,
            z: 0,
            transformPerspective: 900,
            duration: 0.84,
            ease: 'power3.out',
            clearProps: 'willChange',
            scrollTrigger: {
              id: `desktop-faq-row-entrance-${index}`,
              trigger: row,
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
    <section ref={sectionRef} className="dl-faq" aria-labelledby="desktop-faq-title">
      <div className="dl-faq__inner">
        <h2 id="desktop-faq-title">Остались вопросы?</h2>
        <div className="dl-faq__items">
          <article className="dl-faq-row dl-faq-row--open" aria-labelledby="desktop-faq-question-1">
            <header>
              <h3 id="desktop-faq-question-1">Что такое 5G режим?</h3>
              <img src={lowerAsset('faq-up.svg')} alt="" width="32" height="32" />
            </header>
            <p>«5G режим» — это специальная услуга мобильной связи, которая дает доступ к сетям пятого поколения, а в зонах без покрытия 5G автоматически включает оптимизированные настройки, ускоряя передачу данных до 60%</p>
          </article>

          {closedQuestions.map((question) => (
            <button
              className="dl-faq-row dl-faq-row--closed"
              type="button"
              disabled
              aria-disabled="true"
              aria-expanded="false"
              key={question}
            >
              <span>{question}</span>
              <img src={lowerAsset('faq-down.svg')} alt="" width="32" height="32" />
            </button>
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
