import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { publicAsset } from '../../publicAsset'
import { createDesktopCardReveal, DESKTOP_CARD_REVEAL_START } from './desktopCardReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lowerAsset = (filename: string) => publicAsset(`assets/desktop/lower/${filename}`)

const closedQuestions = [
  'Работает ли эта услуга в моем регионе?',
  'Как работает услуга?',
  'Где посмотреть документы и узнать больше об услуге?',
] as const

export function DesktopFaq() {
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
