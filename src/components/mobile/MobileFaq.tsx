import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createMobileCardReveal, MOBILE_CARD_REVEAL_START } from './mobileCardReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (name: string) => publicAsset(`assets/mobile/final/lower-${name}`)

const questions = [
  'Работает ли эта услуга в моем регионе?',
  'Как работает услуга?',
  'Где посмотреть документы и узнать больше об услуге?',
]
export function MobileFaq() {
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
