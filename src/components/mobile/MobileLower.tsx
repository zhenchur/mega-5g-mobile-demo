import { useRef, useState, type KeyboardEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createMobileCardReveal, MOBILE_CARD_REVEAL_START } from './mobileCardReveal'
import './mobile-lower.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (name: string) => publicAsset(`assets/mobile/final/lower-${name}`)
const footerAsset = (name: string) => publicAsset(`assets/footer/${name}`)
// These exports match the mobile Figma assets byte for byte.
const customerAsset = (name: string) => publicAsset(`assets/desktop/lower/customer-${name}.png`)

const questions = [
  'Работает ли эта услуга в моем регионе?',
  'Как работает услуга?',
  'Где посмотреть документы и узнать больше об услуге?',
]
const navigation = ['Связь', 'Услуги и опции', 'Развлечения', 'Поддержка', 'Интернет-магазин', 'Самозанятым', 'Бизнесу', 'О компании']
const socials = [
  { name: 'ВКонтакте', file: 'vk' },
  { name: 'Одноклассники', file: 'ok' },
  { name: 'YouTube', file: 'youtube' },
  { name: 'Хабр', file: 'habr' },
  { name: 'Telegram', file: 'telegram' },
]

function MobileConnect() {
  const sectionRef = useRef<HTMLElement>(null)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const fadeRef = useRef<gsap.core.Timeline | null>(null)
  const reducedMotionRef = useRef(false)
  const activeTabRef = useRef(0)
  const [activeTab, setActiveTab] = useState(0)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return

    const panels = Array.from(section.querySelectorAll<HTMLElement>('.mf-mobile-connect-panel'))
    const container = section.querySelector<HTMLElement>('.mf-mobile-connect-panels')
    if (panels.length !== 2 || !container) return

    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      reducedMotionRef.current = Boolean(context.conditions?.reduce)
      let refreshFrame = 0
      let resizeFrame = 0
      const refreshLayout = () => {
        window.cancelAnimationFrame(refreshFrame)
        refreshFrame = window.requestAnimationFrame(() => {
          refreshFrame = 0
          ScrollTrigger.refresh()
        })
      }

      // Crossfade and height share one playhead, so a quick second click simply
      // reverses their current progress instead of restarting either animation.
      const fade = gsap.timeline({
        paused: true,
        defaults: { duration: 0.32, ease: 'power1.inOut' },
        onComplete: refreshLayout,
        onReverseComplete: refreshLayout,
      })
        .fromTo(panels[0], { autoAlpha: 1 }, { autoAlpha: 0 }, 0)
        .fromTo(panels[1], { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .fromTo(container,
          { height: () => panels[0].offsetHeight },
          { height: () => panels[1].offsetHeight },
          0,
        )

      fade.progress(activeTabRef.current, true).pause()
      fadeRef.current = fade
      let sizes = panels.map((panel) => panel.offsetHeight)

      // Observe intrinsic panels, not the animated container. This also catches
      // line wrapping/font changes without a height-animation observer loop.
      const observer = new ResizeObserver(() => {
        const nextSizes = panels.map((panel) => panel.offsetHeight)
        if (nextSizes.every((size, index) => size === sizes[index])) return
        sizes = nextSizes
        window.cancelAnimationFrame(resizeFrame)
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0
          const progress = fade.progress()
          fade.invalidate().progress(progress, true)
          refreshLayout()
        })
      })
      panels.forEach((panel) => observer.observe(panel))

      return () => {
        observer.disconnect()
        window.cancelAnimationFrame(resizeFrame)
        window.cancelAnimationFrame(refreshFrame)
        fadeRef.current = null
      }
    })

    media.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      const trigger = section.querySelector<HTMLElement>('.mf-mobile-connect-reveal')
      const rise = section.querySelector<HTMLElement>('.mf-mobile-connect-rise')
      const card = section.querySelector<HTMLElement>('.mf-mobile-connect-card')
      if (!trigger || !rise || !card) return

      // Viewport motion owns the entire card; only the inner panels crossfade.
      createMobileCardReveal({
        items: [{ rise, card }],
        scrollTrigger: {
          id: 'mobile-connect-card-entrance',
          trigger,
          start: MOBILE_CARD_REVEAL_START,
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
    <section ref={sectionRef} id="connect" className="mf-mobile-connect" aria-labelledby="mf-mobile-connect-title">
      <div className="mf-mobile-connect-header">
        <h2 id="mf-mobile-connect-title">Как подключить</h2>
        <div className="mf-mobile-connect-tabs" role="tablist" aria-label="Статус абонента">
          {['Я новый абонент', 'Я клиент МегаФона'].map((label, index) => (
            <button
              key={label}
              ref={(element) => { tabsRef.current[index] = element }}
              id={`mf-mobile-connect-tab-${index === 0 ? 'new' : 'customer'}`}
              className={`mf-mobile-connect-tab${activeTab === index ? ' mf-mobile-connect-tab--selected' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={`mf-mobile-connect-panel-${index === 0 ? 'new' : 'customer'}`}
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="mf-mobile-connect-reveal">
      <div className="mf-mobile-connect-rise">
      <div className="mf-mobile-connect-card">
      <div className="mf-mobile-connect-panels">
      <div
        id="mf-mobile-connect-panel-new"
        className="mf-mobile-connect-panel mf-mobile-connect-panel--new"
        role="tabpanel"
        aria-labelledby="mf-mobile-connect-tab-new"
        aria-hidden={activeTab !== 0}
        inert={activeTab !== 0}
      >
        <div className="mf-mobile-connect-visual" aria-hidden="true">
          <img src={lowerAsset('phones.png')} alt="" width="541" height="304" loading="lazy" decoding="async" />
        </div>
        <div className="mf-mobile-connect-content">
          <div className="mf-mobile-connect-copy">
            <h3>Перенесите номер или закажите новую сим-карту</h3>
            <div className="mf-mobile-connect-steps">
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-sim.svg')} alt="" width="32" height="32" />
                <p>Выберите тип сим-карты. <br />Пластиковую или цифровую</p>
              </div>
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-phone.svg')} alt="" width="32" height="32" />
                <p>Подберите номер. Красивый <br />или который легко запомнить</p>
              </div>
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-contract.svg')} alt="" width="32" height="32" />
                <p>Заключите договор связи <br />в салоне МегаФона или онлайн</p>
              </div>
            </div>
          </div>
          <div className="mf-mobile-connect-actions">
            <a className="mf-mobile-connect-button mf-mobile-connect-button--solid" href="#connect">Заказать сим-карту</a>
            <a className="mf-mobile-connect-button mf-mobile-connect-button--outline" href="#connect">Заказать новую сим-карту</a>
          </div>
        </div>
      </div>
      <div
        id="mf-mobile-connect-panel-customer"
        className="mf-mobile-connect-panel mf-mobile-connect-panel--customer"
        role="tabpanel"
        aria-labelledby="mf-mobile-connect-tab-customer"
        aria-hidden={activeTab !== 1}
        inert={activeTab !== 1}
      >
        <div className="mf-mobile-connect-visual mf-mobile-connect-visual--customer" aria-hidden="true">
          <img className="mf-mobile-connect-customer-screen" src={customerAsset('screen')} alt="" width="428" height="924" decoding="async" />
          <img className="mf-mobile-connect-customer-frame" src={customerAsset('phone')} alt="" width="1736" height="3528" decoding="async" />
        </div>
        <div className="mf-mobile-connect-content">
          <div className="mf-mobile-connect-copy">
            <h3>Опциональный заголовок <br />в две строки</h3>
            <div className="mf-mobile-connect-steps">
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-sim.svg')} alt="" width="32" height="32" />
                <p>Призыв зайти в приложение МегаФона или личный кабинет</p>
              </div>
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-phone.svg')} alt="" width="32" height="32" />
                <p>Найти на главном меню нужную услугу</p>
              </div>
              <div className="mf-mobile-connect-step">
                <img src={lowerAsset('step-contract.svg')} alt="" width="32" height="32" />
                <p>Перейти на страницу и подтвердить использование</p>
              </div>
            </div>
          </div>
          <div className="mf-mobile-connect-actions">
            <a className="mf-mobile-connect-button mf-mobile-connect-button--solid" href="#connect">В приложение «МегаФон»</a>
            <a className="mf-mobile-connect-button mf-mobile-connect-button--outline" href="#connect">В личный кабинет</a>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
      </div>
    </section>
  )
}

function MobileFaq() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    const media = gsap.matchMedia()

    media.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      section.querySelectorAll<HTMLElement>('.mf-mobile-faq-reveal').forEach((trigger, index) => {
        const rise = trigger.querySelector<HTMLElement>('.mf-mobile-faq-rise')
        const card = trigger.querySelector<HTMLElement>('.mf-mobile-faq-row')
        if (!rise || !card) return

        createMobileCardReveal({
          items: [{ rise, card }],
          scrollTrigger: {
            id: `mobile-faq-row-entrance-${index}`,
            trigger,
            start: MOBILE_CARD_REVEAL_START,
            invalidateOnRefresh: true,
            toggleActions: 'play none none reverse',
          },
        })
      })
    })

    return () => media.revert()
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="mf-mobile-faq" aria-labelledby="mf-mobile-faq-title">
      <h2 id="mf-mobile-faq-title">Остались вопросы?</h2>
      <div className="mf-mobile-faq-items">
        <div className="mf-mobile-faq-reveal">
        <div className="mf-mobile-faq-rise">
        <article className="mf-mobile-faq-row mf-mobile-faq-row--open" aria-labelledby="mf-mobile-faq-first">
          <header>
            <h3 id="mf-mobile-faq-first">Что такое 5G режим?</h3>
            <img src={lowerAsset('faq-up.svg')} alt="" width="32" height="32" />
          </header>
          <p>«5G режим» — это специальная услуга мобильной связи, которая дает доступ к сетям пятого поколения, а в зонах без покрытия 5G автоматически включает оптимизированные настройки, ускоряя передачу данных до 60%</p>
        </article>
        </div>
        </div>
        {questions.map((question) => (
          <div className="mf-mobile-faq-reveal" key={question}>
          <div className="mf-mobile-faq-rise">
          <button className="mf-mobile-faq-row mf-mobile-faq-row--closed" type="button" disabled aria-expanded="false">
            <span>{question}</span>
            <img src={lowerAsset('faq-down.svg')} alt="" width="32" height="32" />
          </button>
          </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MobileFooter() {
  return (
    <footer id="mf-mobile-footer" className="mf-mobile-footer">
      <nav className="mf-mobile-footer-nav" aria-label="Разделы сайта">
        {navigation.map((item) => (
          <div className="mf-mobile-footer-nav-row" key={item}>
            <span>{item}</span>
            <span className="mf-mobile-footer-chevron"><img src={lowerAsset('chevron.svg')} alt="" width="13" height="8" /></span>
          </div>
        ))}
      </nav>
      <section className="mf-mobile-footer-app" aria-labelledby="mf-mobile-footer-app-title">
        <h2 id="mf-mobile-footer-app-title">Приложение МегаФон<img src={lowerAsset('app-arrow.svg')} alt="" width="20" height="20" /></h2>
        <div className="mf-mobile-footer-stores">
          <div className="mf-mobile-footer-store-buttons">
            <a href="#mf-mobile-footer"><img src={lowerAsset('android.svg')} alt="" width="32" height="32" /><span>Android</span></a>
            <a href="#mf-mobile-footer"><img src={lowerAsset('ios.svg')} alt="" width="32" height="32" /><span>iOS</span></a>
          </div>
          <img className="mf-mobile-footer-qr" src={footerAsset('qr.png')} alt="QR-код для установки приложения МегаФон" width="83" height="116" loading="lazy" />
        </div>
        <div className="mf-mobile-footer-actions">
          <a href="#mf-mobile-footer">Помогите нам стать лучше</a>
          <a href="#mf-mobile-footer">Работа в МегаФоне</a>
        </div>
      </section>
      <div className="mf-mobile-footer-promo">
        <img src={lowerAsset('gift.png')} alt="" width="48" height="48" loading="lazy" />
        <p>Делимся скидками<br />и предложениями</p>
        <a href="#mf-mobile-footer" aria-label="Подписаться на скидки и предложения"><img src={lowerAsset('send.svg')} alt="" width="32" height="32" /></a>
      </div>
      <div className="mf-mobile-footer-bottom">
        <div className="mf-mobile-footer-privacy">
          <span className="mf-mobile-footer-age">6+</span>
          <div>
            <p>Продолжая использовать наш сайт, вы даете согласие на обработку файлов Cookies и других пользовательских данных, в соответствии с <a href="#mf-mobile-footer">Политикой конфиденциальности</a></p>
            <p><a href="#mf-mobile-footer">Политика</a> обработки персональных данных ПАО «МегаФон»</p>
          </div>
        </div>
        <div className="mf-mobile-footer-copyright">
          <span><img src={lowerAsset('logo.svg')} alt="" width="24" height="24" /></span>
          <p>© 2024 ПАО «МегаФон»</p>
        </div>
        <div className="mf-mobile-footer-legal"><a href="#mf-mobile-footer">Условия оказания услуг</a><a href="#mf-mobile-footer">Лицензии</a></div>
        <div className="mf-mobile-footer-social-row">
          <div className="mf-mobile-footer-socials">
            {socials.map(({ name, file }) => <a href="#mf-mobile-footer" aria-label={name} key={file}><img src={lowerAsset(`social-${file}.svg`)} alt="" width="32" height="32" /></a>)}
          </div>
          <div className="mf-mobile-footer-award" role="img" aria-label="Speedtest Awards by Ookla">
            <img className="mf-mobile-footer-award-bottom" src={lowerAsset('award-bottom.svg')} alt="" />
            <img className="mf-mobile-footer-award-top" src={lowerAsset('award-top.svg')} alt="" />
            <img className="mf-mobile-footer-award-middle" src={lowerAsset('award-middle.svg')} alt="" />
            <img className="mf-mobile-footer-award-mark" src={lowerAsset('award-mark.svg')} alt="" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export function MobileLower() {
  return <div className="mf-mobile-lower"><MobileConnect /><MobileFaq /><MobileFooter /></div>
}
