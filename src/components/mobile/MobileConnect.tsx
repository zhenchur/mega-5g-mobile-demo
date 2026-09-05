import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createMobileCardReveal, MOBILE_CARD_REVEAL_START } from './mobileCardReveal'
import { useConnectTabs } from '../../interactions/useConnectTabs'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (name: string) => publicAsset(`assets/mobile/final/lower-${name}`)
// These exports match the mobile Figma assets byte for byte.
const customerAsset = (name: string) => publicAsset(`assets/desktop/lower/customer-${name}.png`)

export function MobileConnect() {
  const sectionRef = useRef<HTMLElement>(null)
  const { activeTab, tabsRef, selectTab, handleTabKeyDown } = useConnectTabs(sectionRef, {
    panelSelector: '.mf-mobile-connect-panel',
    heightContainerSelector: '.mf-mobile-connect-panels',
  })

  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    const media = gsap.matchMedia()

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
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => media.revert()
  }, { scope: sectionRef })

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
