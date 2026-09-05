import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createDesktopCardReveal, DESKTOP_CARD_REVEAL_START } from './desktopCardReveal'
import { useConnectTabs } from '../../interactions/useConnectTabs'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (filename: string) => publicAsset(`assets/desktop/lower/${filename}`)
const connectAsset = (filename: string) => publicAsset(`assets/desktop/final/connect/${filename}`)
const CONNECT_PLACEHOLDER = '#desktop-connect'

export function DesktopConnect() {
  const sectionRef = useRef<HTMLElement>(null)
  const { activeTab, tabsRef, selectTab, handleTabKeyDown } = useConnectTabs(sectionRef, {
    panelSelector: '.dl-connect-panel',
  })

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    const media = gsap.matchMedia()

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
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => media.revert()
  }, { scope: sectionRef })

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
