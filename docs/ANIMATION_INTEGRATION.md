# MEGA 5G: интеграция анимаций

- Версия документа: 1.1
- Статус: сверен с текущей демкой 28 августа 2026
- Референсный viewport: iPhone 13, portrait, 390 × 844 CSS px
- Исходный стек: React 19, TypeScript, GSAP 3.15, @gsap/react 2.1, ScrollTrigger

> **Критическая граница передачи.** Это демо сценариев, динамики и принципов анимации, а не production-верстка. Текущие DOM, CSS, абсолютные размеры и визуальные стили нельзя считать кодом для прямого переноса. Их нужно заново реализовать в продуктовой архитектуре и дизайн-системе, используя этот документ и исходники только как поведенческий референс.

Дизайн и тайминги настраивались под iPhone 13 (`390 × 844 CSS px`). Код технически включается на ширинах до 767 px, но более широкие, более высокие и landscape-вьюпорты не входят в область визуальной приемки и могут вести себя некорректно.

Документ фиксирует внешний эффект и референсный технический контракт каждой анимационной зоны: DOM-зависимости демо, геометрию, триггеры, тайминги, жесты, reduced-motion, очистку и требования к новой продуктовой реализации.

## 1. Быстрый маршрут интеграции

1. Установить зависимости:

   ~~~bash
   npm install gsap @gsap/react
   ~~~

2. Воссоздать механику внутри продуктовых компонентов. Исходные компоненты и CSS использовать для изучения последовательности, но не копировать как production-верстку.
3. Сохранить порядок <code>PromoSection → DetailsSection → ProductsSection</code>: первые две зоны вычисляют scroll-позиции относительно друг друга.
4. Регистрировать GSAP-плагины только в браузерном коде:

   ~~~ts
   import gsap from 'gsap'
   import { useGSAP } from '@gsap/react'
   import { ScrollTrigger } from 'gsap/ScrollTrigger'

   gsap.registerPlugin(useGSAP, ScrollTrigger)
   ~~~

5. Оставить анимации внутри <code>useGSAP</code> со scoped ref и очищать дополнительные listeners, observers, RAF и таймеры.
6. После загрузки шрифтов и любого изменения геометрии вызвать один <code>ScrollTrigger.refresh()</code>.
7. Выполнить визуальную приемку на iPhone 13 (`390 × 844`), затем отдельные smoke-тесты reduced-motion, touch, pointer и keyboard по чек-листу в конце документа.

Рекомендуемый порядок переноса: статическая верстка и CSS → reduced-motion layout → GSAP entrance → ScrollTrigger scrub → жесты и клавиатура → QA.

## 2. Карта зон

| Зона | Компонент | Механика | Управление | Где активна |
|---|---|---|---|---|
| Hero / promo | [PromoSection.tsx](../src/components/PromoSection.tsx) | масштаб орбиты, сдвиг offer, исчезновение title | ScrollTrigger: scrub + дискретный trigger | код ≤767 px; приемка 390 × 844 |
| Details mask | [DetailsSection.tsx](../src/components/DetailsSection.tsx) | горизонтальное раскрытие с counter-scale | ScrollTrigger scrub | код ≤767 px; приемка 390 × 844 |
| Experience cards | [ExperienceCarousel.tsx](../src/components/ExperienceCarousel.tsx) | 3D-вход, paging и стек карточек | ScrollTrigger + swipe + keyboard | ≤767 px |
| Technology cards | [DetailsSection.tsx](../src/components/DetailsSection.tsx) | 3D flip/depth entrance | отдельный ScrollTrigger на карточку | код ≤767 px; приемка 390 × 844 |
| Product profiles | [ProductsSection.tsx](../src/components/ProductsSection.tsx) | sticky stack и смена visual | ScrollTrigger scrub + time-based visual transition | код ≤767 px; приемка 390 × 844 |
| Connect carousel | [ConnectSection.tsx](../src/components/ConnectSection.tsx) | циклическая смена экрана, текста и stepper | paused timeline + swipe/click/keyboard | все размеры, но mobile UI скрыт ≥768 px |
| Tariffs | [TariffsSection.tsx](../src/components/TariffsSection.tsx) | нативный горизонтальный scroll | browser scroll | mobile |
| FAQ и footer | [ConnectSection.tsx](../src/components/ConnectSection.tsx), [FooterSection.tsx](../src/components/FooterSection.tsx) | статичны | — | mobile |

Важно: сейчас нет единого master timeline. Каждая зона владеет своим GSAP context, а page flow возникает из DOM-порядка и CSS-геометрии.

CSS можно переносить блоками:

| Блок | Диапазон в [styles.css](../src/styles.css) |
|---|---|
| global, mobile shell, header | 1–221 |
| Promo | 222–379 |
| Details + Experience | 380–605 |
| Products | 606–830 |
| Tariffs | 831–879 |
| Connect + FAQ | 880–1287 |
| Footer | 1288–1540 |
| reduced-motion и desktop gate | 1541–конец |

## 3. Архитектура страницы

~~~text
MobileExperience
├── mobile-header                 fixed, 56 px
├── hero-scene
│   ├── PromoSection             sticky, 100svh
│   └── DetailsSection           overlap -26 px
│       └── ExperienceCarousel
├── ProductsSection              длинная scroll-zone + sticky stage
├── TariffsSection               native horizontal scrolling
├── ConnectSection
│   ├── connect carousel
│   └── FAQ                      static
└── FooterSection                static
~~~

Критические глобальные предпосылки:

- используется нативный scroll окна, не отдельный scroll-container;
- <code>.promo</code> и <code>.details</code> являются соседями;
- header имеет высоту 56 px;
- mobile experience скрывается при ширине от 768 px;
- публичные assets доступны от корня по путям <code>/assets/...</code>, шрифты — <code>/fonts/...</code>;
- основные layout-токены должны совпадать между TypeScript и CSS.

### 3.1. Общие числовые контракты

| Токен | Значение | Где используется |
|---|---:|---|
| Mobile max width | 767 px | все scroll-анимации и desktop gate |
| Header offset | 56 px | sticky product stage, scroll-padding |
| Details overlap | 26 px | Promo, Details, Experience, CSS variable |
| Details expansion | 160 px scroll | Details mask, Experience entrance boundary, hero background |
| Experience card gap | 4 px | TypeScript formula и CSS flex gap |
| Experience stack step | 8 px | paging formula и viewport gutter |
| Gesture axis lock | 10 px | обе карусели |
| Swipe threshold | 24 px | обе карусели |
| Connect icon step | 30.572 px | timeline и CSS initial positions |

При изменении одного из этих значений обновить все связанные места. Лучший продуктовый вариант — вынести значения в единый animation-config и, где возможно, передавать CSS-токены через custom properties.

## 4. Базовый React/GSAP-контракт

Канонический шаблон секции:

~~~tsx
const rootRef = useRef<HTMLElement>(null)

useGSAP(() => {
  const root = rootRef.current
  if (!root) return

  const media = gsap.matchMedia()

  media.add(
    '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
    () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          invalidateOnRefresh: true,
        },
      })

      // Tweens belong to this context.

      return () => {
        // Remove native listeners/observers/timers created here.
      }
    },
  )

  return () => media.revert()
}, { scope: rootRef })
~~~

Правила:

- GSAP targets — refs либо selectors внутри scope;
- time-based последовательности оформлять timeline, не цепочками delay;
- ScrollTrigger размещать на top-level tween/timeline, не на child tween;
- scroll-scrub участки используют <code>ease: 'none'</code>;
- movement выполнять через <code>x/y/scale/rotation</code>, а не через layout-свойства;
- event-created animation оборачивать в <code>contextSafe</code> либо явно kill/cleanup;
- не вызывать GSAP во время SSR;
- при custom smooth-scroll потребуется <code>ScrollTrigger.scrollerProxy()</code> и замена вычислений через <code>window.scrollY</code>.

## 5. Зона 1 — Hero / Promo

Источник: [PromoSection.tsx](../src/components/PromoSection.tsx), CSS <code>.promo*</code>.

### 5.1. DOM-контракт

~~~text
section.promo[ref=sectionRef]
├── div.promo__gradient
└── div.promo__rail
    ├── div.promo__visual
    │   └── img[ref=imageRef]
    ├── nav.promo__breadcrumbs
    ├── h1#promo-title.promo__title[ref=titleRef]
    └── div.promo__offer[ref=offerRef]
~~~

Дополнительно в документе должен существовать уникальный <code>#details</code>. Компонент получает его через <code>document.getElementById('details')</code>.

### 5.2. Scroll-scrub hero

Активно при <code>max-width: 767px</code> и отсутствии reduced-motion.

Формулы:

~~~ts
start = max(0, documentTop(details) - promo.offsetHeight + 26)
end = start + max(1, promo.offsetHeight * 0.7)
~~~

ScrollTrigger:

| Параметр | Значение |
|---|---|
| trigger | details |
| start / end | функции выше |
| scrub | 0.25 s |
| invalidateOnRefresh | true |
| pin | нет; sticky реализован CSS |

Параллельные tweens, оба в позиции timeline 0:

| Target | From | To | Timeline duration | Ease |
|---|---|---|---:|---|
| hero image | scale 1 | scale 1.18 | 1 | none |
| offer | y 0, scale 1 | y -150 px, scale 0.94 | 1 | none |

GSAP устанавливает offer transform-origin <code>50% 50%</code>, перезаписывая CSS origin <code>0 100%</code>. При переносе итоговую точку масштабирования нужно сохранить намеренно, а не считать CSS единственным источником истины.

### 5.3. Исчезновение title

Начало:

~~~ts
titleExitLine = title.offsetTop + title.offsetHeight + 72
titleExitStart = max(start, documentTop(details) - titleExitLine)
~~~

Отдельный ScrollTrigger:

- trigger: details;
- start: вычисляемая absolute scroll position;
- toggleActions: <code>play none none reverse</code>;
- invalidateOnRefresh: true;
- from: <code>autoAlpha 1, scale 1</code>;
- to: <code>autoAlpha 0, scale 0</code>;
- duration: 0.25 s;
- ease: <code>power4.in</code>.

В tween title transform-origin меняется на <code>50% 50%</code> вместо CSS <code>0 50%</code>. Reverse происходит при четвертом событии toggleActions — уходе назад выше start.

### 5.4. Критический CSS и assets

- <code>.promo</code>: sticky, top 0, height 100svh, overflow hidden;
- image изначально повернут на 30°, GSAP добавляет scale без потери rotation;
- image и copy имеют transform-origin и will-change;
- <code>.hero-scene</code> формирует фон перехода к Details;
- assets: <code>/assets/promo/hero-orbit.png</code>, <code>title-arrow.svg</code>, header logo assets.

Reduced-motion: обе JS-анимации не создаются, исходная верстка остается полностью видимой.

Интеграционные замечания:

- CTA демо ведет на существующий <code>#profiles</code>; в продукте заменить его на согласованный route/action;
- Promo сам не инициирует fonts-ready refresh и в текущей композиции зависит от refresh из DetailsSection;
- при reduced-motion постоянный will-change у hero image, title и offer CSS не сбрасывает.

## 6. Зона 2 — раскрытие Details

Источник: [DetailsSection.tsx](../src/components/DetailsSection.tsx), CSS <code>.details*</code>.

### 6.1. DOM-контракт

~~~text
section#details.details[ref=sectionRef]
└── div.details__content-mask[ref=contentMaskRef]
    └── div.details__content[ref=contentRef]
        ├── ExperienceCarousel
        ├── h2.details__title
        └── div.technology-list
            └── article.technology-card
                ├── div.technology-card__copy
                └── img
~~~

Критично:

- promo определяется через <code>section.previousElementSibling</code>;
- mask и content — разные transform layers;
- image должен быть прямым ребенком <code>.technology-card</code>;
- начальная ширина mask — до 327 px, а content расширен на 48 px и сдвинут на -24 px.

### 6.2. Mask expansion

Активно только при motion allowed.

~~~ts
expandedScale = section.clientWidth / contentMask.offsetWidth
counterScale = 1 / expandedScale
start = max(0, documentTop(section) - promo.offsetHeight + 26)
~~~

Timeline:

| Параметр | Значение |
|---|---|
| trigger | details section |
| start | функция выше |
| end | +=160 px |
| scrub | 0.25 s |
| defaults | duration 1, ease none |
| invalidateOnRefresh | true |

Параллельно:

- mask: <code>scaleX 1 → expandedScale</code>;
- content: <code>scaleX 1 → counterScale</code>.

Counter-scale обязателен: без него текст и карточки растянутся вместе с белой маской.

### 6.3. Technology cards entrance

На каждую карточку создается отдельный tween:

| From | To |
|---|---|
| autoAlpha 0 | autoAlpha 1 |
| rotationX -68° | rotationX 0 |
| z -36 px | z 0 |
| perspective 900 | perspective 900 |

- transform origin: 50% 0%;
- duration: 0.84 s;
- delay: <code>index × 0.06 s</code>;
- ease: <code>power3.out</code>;
- trigger: сама карточка;
- start: <code>top 85%</code>;
- toggleActions: <code>play none none reverse</code>;
- после завершения очищается только will-change.

Assets: <code>/assets/features/priority-3d.webp</code> и <code>speed-3d.webp</code>.

### 6.4. Reduced-motion layout

При reduced-motion:

- mask сразу получает width 100%;
- content получает left 0 и width 100%;
- mask expansion и technology entrance не создаются;
- will-change отключается.

Это layout fallback, а не просто duration 0; переносить соответствующий media query обязательно.

## 7. Зона 3 — Experience carousel

Источник: [ExperienceCarousel.tsx](../src/components/ExperienceCarousel.tsx), CSS <code>.experience-*</code>.

### 7.1. Модель данных и DOM

Четыре карточки образуют три логические страницы. На каждой странице видны две карточки, поэтому:

~~~ts
PAGE_COUNT = experiences.length - 1
MAX_PAGE = PAGE_COUNT - 1
~~~

DOM:

~~~text
div.experience-carousel[ref=rootRef]
├── div.experience-viewport[ref=viewportRef, tabindex=0]
│   └── div.experience-list
│       └── article.experience-card
│           └── div.experience-card__surface
└── div.experience-pagination
~~~

Outer card владеет paging transform. Inner surface владеет 3D entrance. Не объединять эти layers.

### 7.2. Paging и стек

Шаг вычисляется после layout:

~~~ts
cardStep = cardWidth + 4
stackTravel = cardStep - 8
stackAnchorOffset = -page * 8
~~~

Для карточки с индексом <code>i</code>:

~~~ts
x = i <= page
  ? -stackTravel * i + stackAnchorOffset
  : -stackTravel * page + stackAnchorOffset

scale = 1 - max(0, page - i) * 0.06

autoAlpha =
  i < page - 1 ? 0 :
  i === page - 1 ? 0.5 :
  1
~~~

Переход:

- duration: 0.52 s;
- ease: <code>power3.out</code>;
- overwrite: true;
- перед новым переходом — <code>killTweensOf(cards)</code>;
- устаревшие карточки скрываются сразу.

При reduced-motion используется мгновенный <code>gsap.set</code>, но paging и управление остаются рабочими.

### 7.3. 3D entrance

Начальное состояние surfaces:

- autoAlpha 0;
- rotationX -68°;
- z -36 px;
- transformPerspective 900;
- transformOrigin 50% 0%;
- willChange transform, opacity.

Entrance timeline:

- duration каждого элемента: 0.84 s;
- stagger: 0.1 s;
- ease: <code>power3.out</code>;
- полная длительность для четырех карточек около 1.14 s.

Scroll coordinates:

~~~ts
entranceStart = max(
  16,
  documentTop(viewport) - promo.offsetHeight + promo.offsetHeight * 0.15
)

expansionEnd = max(
  entranceStart + 1,
  documentTop(details) - promo.offsetHeight + 26 + 160
)
~~~

Основной trigger проигрывает timeline при движении вниз и reverses при возврате. Дополнительный trigger полностью сбрасывает entrance при <code>scrollY ≤ 12</code>.

### 7.4. Жесты и клавиатура

- axis lock: 10 px;
- swipe threshold: 24 px;
- один переход на жест;
- горизонтальный swipe: next/previous;
- вертикальный gesture и pinch остаются нативными;
- pointer и touch paths разведены, чтобы не получать двойные события;
- <code>ArrowLeft/ArrowRight</code>, <code>Home/End</code> поддерживаются;
- viewport имеет focus outline и ARIA live status.

CSS-контракт:

- <code>touch-action: pan-y pinch-zoom</code>;
- <code>overscroll-behavior-x: contain</code>;
- viewport left -8 px + padding-left 8 px;
- flex gap строго 4 px;
- outer card transform-origin left center;
- backface hidden на surface.

ResizeObserver пересчитывает cardStep через один RAF и мгновенно восстанавливает текущую страницу.

## 8. Зона 4 — Product profiles

Источник: [ProductsSection.tsx](../src/components/ProductsSection.tsx), CSS <code>.products*</code> и <code>.profile-card*</code>.

### 8.1. DOM и инварианты

~~~text
section#profiles.products[ref=sectionRef]
└── div.products__stage
    └── div.products__content
        ├── h2.products__title
        ├── div.products__visual[ref=visualRef]
        │   └── div.products__visual-frame[ref=visualFrameRef, data-visual-step]
        │       └── img.products__visual-image
        └── div.products__cards[ref=cardsRef]
            └── article.profile-card × 4
                ├── div.profile-card__background
                ├── div.profile-card__top
                └── div.profile-card__bottom
~~~

Текущая демка содержит четыре cards и четыре backgrounds. Engine строит сегменты из массива <code>profiles</code>, но CSS z-index и reduced-motion высота подготовлены именно для четырёх карточек; при изменении количества эти части нужно обновить вместе.

### 8.2. Геометрия scroll-zone

- section height: <code>100svh + max(2491.43px, 342.571svh) + 31.2px</code>;
- stage: sticky, top 56 px, height <code>100svh - 56px</code>;
- cards в motion-mode абсолютные и приходят с offset ниже viewport;
- start: <code>top top+=56px</code>;
- end: <code>bottom bottom</code>;
- scrub: 0.25 s;
- invalidateOnRefresh: true.

Связанные CSS-формулы:

~~~text
cardBottomGap = clamp(35px, 5svh, 48px)
cardTop = 100svh - 56px - 182px - cardBottomGap
visualHeight = clamp(326px, 30svh + 116px, 370px)
visualWidth = clamp(425px, 39svh + 152px, 482px)
visualTop = cardTop - visualHeight
cardGap = 8px
incomingOffset = 182px + cardGap
~~~

Каждая profile card имеет фиксированную высоту 182 px. В motion CSS карточки 2–4 начинают с одного incoming offset 190 px; следующая карточка открывается только после завершения предыдущего сегмента. Смена offset parent или position ломает вычисление <code>cardDistance()</code>.

### 8.3. Visual entrance

Создается, только если при инициализации visual находится ниже линии 88% viewport:

| From | To |
|---|---|
| autoAlpha 0, y 28, scale 0.92 | autoAlpha 1, y 0, scale 1 |

- trigger: visual;
- start: <code>top 88%</code>;
- duration: 0.8 s;
- ease: <code>power3.out</code>;
- once: true;
- после завершения очищаются transform, opacity, visibility и will-change.

### 8.4. Stack timeline

Константы:

| Имя | Значение |
|---|---:|
| FIRST_STACK_START | 0.12 |
| STACK_INTERVAL | 0.78 |
| STACK_DURATION | 0.50 |
| STACK_STEP | 8 px |
| STACKED_CARD_SCALE | 331 / 351 ≈ 0.943 |

Три stack-сегмента стартуют в <code>0.12</code>, <code>0.90</code> и <code>1.68</code>, каждый длится 0.50. На каждом сегменте:

- incoming card приезжает к базовой позиции первой карточки;
- уже сложенные карточки получают дополнительный сдвиг вверх на 8 px и уменьшаются по глубине;
- фон ближайшей нижней карточки остается opacity 0.8, следующей — 0.3, более глубокой — 0.14;
- контент перекрываемой карточки исчезает на последних 0.18 сегмента;
- следующая hidden card становится видимой только после завершения текущего сегмента.

Все stack tweens используют <code>ease: 'none'</code>. Расстояние измеряется динамически через <code>offsetTop</code>, поэтому refresh обязателен после изменения высот/шрифтов.

Полная timeline duration — 2.18. Scroll-range увеличен пропорционально количеству сегментов, поэтому расстояние прокрутки до старта каждой следующей карточки сохраняет прежнюю динамику.

### 8.5. Смена visual

Порог смены рассчитывается по реальному расстоянию между карточками. Forward overlap равен 0, reverse overlap — 0.5; это создает hysteresis и предотвращает мигание около границы при изменении направления scroll.

Точная формула для incoming card:

~~~ts
distance = incoming.offsetTop - firstCard.offsetTop
previousHeight = previous.offsetHeight
targetTopGap = previousHeight * (1 - overlap)
scaleCompensation = targetTopGap * (1 - 331 / 351)
relativeTravel = max(1, distance - 8 - scaleCompensation)
segmentProgress = clamp(
  0,
  1,
  (distance - targetTopGap) / relativeTravel,
)
switchTime = segmentStart + 0.5 * segmentProgress
~~~

Forward переключается при <code>time ≥ enterTime</code>, reverse — при <code>time ≤ returnTime</code>. На refresh initial sync использует reverse thresholds и может мгновенно завершить текущий visual fade.

Time-based смена visual:

1. уход: autoAlpha 0, scale 0.86, 0.28 s, <code>power2.in</code>;
2. commit нового индекса в <code>data-visual-step</code>;
3. старт нового кадра: autoAlpha 0, scale 1.08;
4. вход: autoAlpha 1, scale 1, 0.52 s, <code>power3.out</code>.

Новый запрос убивает предыдущую visual animation и защищен transition token от устаревшего onComplete.

Если requested index уже совпадает с rendered index, используется recovery tween: autoAlpha 1 и scale 1 за 0.24 s, <code>power2.out</code>, <code>overwrite: 'auto'</code>.

Текущее ограничение демки: <code>data-visual-step</code> меняется, но CSS и React намеренно не подменяют image source; для всех четырёх состояний отображается <code>profile-kino.webp</code>. При продуктовой интеграции нужно либо менять <code>src</code> в commit-функции с preload/decode, либо подготовить четыре наложенных visual layers.

Products, как и Promo, не запускает fonts-ready refresh самостоятельно; текущая страница получает его из DetailsSection. При независимом переносе refresh нужно разместить в общем animation bootstrap.

### 8.6. Reduced-motion

- sticky scroll-zone превращается в обычную секцию;
- фиксируется статическая высота stage 1318 px;
- cards возвращаются в flow с gap 8 px;
- visual и cards не получают GSAP-анимацию;
- will-change отключается.

## 9. Зона 5 — Connect carousel

Источник: [ConnectSection.tsx](../src/components/ConnectSection.tsx), CSS <code>.connect-card*</code>.

Это 2D-карусель: используются <code>x</code>, <code>scale</code>, <code>autoAlpha</code> и <code>z-index</code>. Perspective и rotationX/rotationY в этой зоне отсутствуют.

### 9.1. Состав и состояние

Каждый step должен содержать:

~~~ts
{
  screen: string
  copy: ReactNode
  announcement: string
  shape: 'hexagon' | 'circle' | 'square'
}
~~~

Количество phone slides, step buttons и copy items обязано совпадать с количеством steps.

Шаги 1 и 3 в текущей демке намеренно используют один <code>app-screen.png</code>. Отдельный runtime-asset третьего шага в handoff-пакет не входит; перед продуктовой интеграцией его нужно согласовать и экспортировать отдельно.

DOM:

~~~text
div.connect-card[ref=cardRef, tabindex=0]
├── aria-live status
├── div.connect-card__picture
│   └── div.connect-card__phone-slide × N
├── div.connect-card__stepper
│   └── button.connect-card__step × N
├── div.connect-card__copy
│   └── p.connect-card__copy-item × N
└── div.connect-card__pagination
    └── button × N
~~~

Индекс циклический: переход с последнего шага на первый и обратно разрешен.

### 9.2. Timeline одного edge-перехода

| Фаза | Время | Действие |
|---|---:|---|
| shrink current icon | 0.00–0.20 s | x 0, scale 0.72, autoAlpha 0, power2.inOut |
| pause | 0.20–0.22 s | визуальная пауза |
| phone/copy crossfade | 0.22–0.52 s | autoAlpha + phone scale, power2.inOut |
| promote/shift icons | 0.22–0.52 s | x/scale/autoAlpha, power2.inOut |
| future icon entrance | 0.30–0.52 s | scale 0.72→1, autoAlpha 0→1, power3.out |
| settle | 0.52 s | z-index normalizes, static page state commits |

Phone inactive scale: 0.985. Видимы три step icons с шагом 30.572 px.

Timeline создается paused и умеет play/reverse. Если пользователь выбирает дальний step, engine проходит кратчайший путь по одному edge; оставшаяся цель сохраняется как pending. Rapid input не создает конкурирующие timelines.

Логический <code>activeIndex</code>, пагинация, <code>aria-current</code> и live announcement переключаются в начале edge, примерно за 520 ms до визуального settle. Если продуктовые требования предполагают announcement после завершения, state commit нужно перенести в <code>settleEdge</code>.

При текущих трех шагах future icon всегда рециклирует уходящую иконку. Ветки для отдельной четвертой future icon являются заделом на большее количество steps и сейчас недостижимы.

### 9.3. Управление

- click по step или pagination;
- swipe left/right;
- ArrowLeft/ArrowRight;
- Home/End;
- wrap между границами;
- axis lock 10 px;
- swipe threshold 24 px;
- после swipe click подавляется на 320 ms;
- card имеет region/carousel semantics и aria-live announcement.

CSS обязательно сохраняет:

- <code>touch-action: pan-y pinch-zoom</code>;
- pointer-events none на picture;
- absolute overlay для phone/copy slides;
- backface hidden;
- CSS classes <code>is-active</code>, <code>is-next--1</code>, <code>is-next--2</code>, <code>is-transition-preview</code>;
- transform positions 0 / 30.572 / 61.144 px.

Reduced-motion: timeline не создается, но выбранный state мгновенно применяется через <code>gsap.set</code>. CSS transitions step-shapes отключаются.

### 9.4. CSS-only motion внутри stepper

Единственные CSS transitions в проекте находятся здесь и длятся 200 ms с обычным <code>ease</code>:

- border-color у circle;
- crossfade normal/muted SVG-слоев у hexagon;
- border-color у square;
- color номера шага.

Transitions запускаются классами <code>is-next</code> и <code>is-transition-preview</code> параллельно GSAP timeline. CSS <code>@keyframes</code> и свойство <code>animation</code> в проекте отсутствуют.

## 10. Статические зоны

### Tariffs

<code>TariffsSection</code> сейчас не содержит GSAP. Горизонтальное движение — нативный <code>overflow-x: auto</code>. Четыре карточки являются пустыми placeholders размером 268 × 513 px, gap 18 px.

Placeholder имеют <code>aria-hidden="true"</code>. Нельзя монтировать внутрь них интерактивный embed без изменения семантики: продуктовая интеграция должна заменить <code>.tariffs__viewport/.tariffs__track</code> собственным root либо снять <code>aria-hidden</code> и полностью восстановить доступные роли, названия и управление. Если требуется snap, сначала использовать CSS <code>scroll-snap</code>; GSAP нужен только для более сложного drag/inertia поведения.

### FAQ

Текущее состояние статично: первая карточка всегда открыта, остальные закрыты. Accordion animation и обработчики отсутствуют.

### Header и footer

Header fixed, но не анимируется. Footer и desktop gate статичны. Не следует добавлять скрытые scroll triggers в эти зоны при переносе текущей спецификации.

Mobile и desktop trees одновременно смонтированы; breakpoint только переключает <code>display</code>. Поэтому Connect listeners продолжают существовать и на desktop. Если продукт будет условно монтировать mobile tree, обязательно проверить cleanup/remount и сохранение состояния.

## 11. Accessibility и reduced-motion

| Зона | Motion allowed | Reduced motion |
|---|---|---|
| Promo | scrub + title exit | статичный hero |
| Details mask | scrub scale/counter-scale | сразу width 100% |
| Experience entrance | 3D timed entrance | отсутствует |
| Experience paging | tween 0.52 s | мгновенный set |
| Technology cards | 3D entrance | отсутствует |
| Products | sticky stack + visual transition | последовательный статичный layout |
| Connect | timeline 0.52 s | мгновенный state switch |

Обязательные требования:

- интерактивные карусели остаются управляемыми при reduced-motion;
- focus не должен теряться после смены page;
- arrow/Home/End не должны скроллить страницу, когда focus внутри carousel;
- aria-current и aria-live должны обновляться синхронно с логическим state;
- декоративные images имеют пустой alt и aria-hidden wrapper;
- hidden visual layer не должен содержать доступные интерактивные controls.

Текущее ограничение: Experience и Connect читают reduced-motion один раз при создании callback. Если пользователь меняет системную настройку без reload, режим обновится только после remount. В продукте лучше включить motion preference в <code>gsap.matchMedia</code>.

## 12. Lifecycle, cleanup и refresh

### Что очищает useGSAP

Animations и ScrollTriggers, созданные синхронно внутри callback, автоматически revert при unmount.

### Что очищать вручную

- Pointer/Touch/Keyboard listeners;
- ResizeObserver;
- requestAnimationFrame;
- setTimeout;
- paused/queued timelines;
- event callbacks;
- event-created tweens, если они не обернуты в contextSafe;
- временные inline styles и will-change.

### Когда нужен ScrollTrigger.refresh

Вызывать после:

- <code>document.fonts.ready</code>;
- появления динамического контента выше trigger;
- изменения текста, высот cards или asset aspect ratio;
- route transition, возвращающего секцию в DOM;
- раскрытия accordion выше анимируемой зоны.

Не вызывать на каждом scroll или каждом animation frame. Resize viewport ScrollTrigger обрабатывает сам.

В текущем коде <code>ScrollTrigger.config({ ignoreMobileResize: true })</code> вызывается глобально из DetailsSection. При переносе лучше вынести глобальную настройку в bootstrap animation module и документировать ее влияние на все triggers.

## 13. Performance budget

- Основные animated properties: transform и opacity.
- will-change включается только на период интерактивных переходов, кроме нескольких постоянных mobile layers.
- Не анимировать width/height/top/left, если тот же эффект достигается transform.
- Не создавать новый tween на каждый pointermove: текущие карусели меняют page один раз после threshold.
- Ограничить compositor layers; не переносить постоянный will-change на длинные списки.
- Тестировать минимум на реальном Android среднего класса и iPhone с Safari.
- Image assets preload/decode до visual switch, иначе fade откроет пустой либо старый кадр.

## 14. Известные ограничения текущей демки

1. Визуальная приемка выполнена только для iPhone 13, portrait, 390 × 844 CSS px. Более широкие, высокие и landscape-вьюпорты могут вести себя некорректно.
2. Promo/Details зависят от непосредственного соседства и native window scroll.
3. Magic numbers частично дублируются между TS и CSS.
4. Product stack содержит четыре карточки; CSS z-index и reduced-motion высота требуют ручного обновления при изменении количества.
5. Product visual пока не меняет image source.
6. Experience использует четыре cards, но три логические pages.
7. Layout построен на фиксированных/absolute размерах и чувствителен к длинной локализации.
8. Asset URLs абсолютные и требуют root deployment либо адаптации base path.
9. Custom smooth-scroll без scrollerProxy не поддержан.
10. Глобальный ignoreMobileResize может оставлять numeric positions устаревшими после нестандартных viewport/layout changes.
11. Connect — 2D, не 3D; первый и третий steps временно используют один screen asset.
12. Mobile tree не размонтируется на desktop, а только скрывается через CSS.
13. Promo и Products полагаются на fonts-ready refresh, который сейчас запускает DetailsSection.
14. Визуально интерактивные header/profile/footer элементы и FAQ являются integration stubs и не содержат продуктовой бизнес-логики.

## 15. Чек-лист приемки

### Setup

- [ ] GSAP, useGSAP и ScrollTrigger установлены и зарегистрированы в browser context.
- [ ] Все selectors находятся внутри scoped component.
- [ ] Assets и четыре font weights загружаются без 404.
- [ ] Promo непосредственно предшествует Details.
- [ ] CSS tokens совпадают с TypeScript constants.

### Viewports

- [ ] 390 × 844 CSS px, iPhone 13 portrait — обязательная визуальная приемка.
- [ ] Safari iOS и Chrome iOS на реальном iPhone 13.
- [ ] 767 px — только smoke-test без pixel-perfect гарантии.
- [ ] 768 px — mobile experience скрыта, desktop gate показан.
- [ ] Более широкие, высокие и landscape-вьюпорты отмечены как вне области визуальной приемки, если не выполнялась отдельная адаптация.

### Scroll

- [ ] Hero image и offer идут плавно в обоих направлениях.
- [ ] Title reverses при scroll вверх.
- [ ] Details раскрывается ровно за 160 px без растяжения content.
- [ ] Experience entrance сбрасывается у верха.
- [ ] Technology cards reverse при возврате выше trigger.
- [ ] Products stack не прыгает после загрузки fonts.
- [ ] Product visual не мигает при быстрых сменах направления.

### Input

- [ ] Swipe left/right работает один раз на gesture.
- [ ] Вертикальный scroll и pinch не блокируются.
- [ ] Mouse drag работает без stuck pointer capture.
- [ ] ArrowLeft/ArrowRight, Home/End работают.
- [ ] Rapid click/swipe не создает конкурирующий state.
- [ ] Connect корректно wraps между последним и первым step.

### Accessibility

- [ ] Reduced-motion отключает entrance/scrub и оставляет весь контент видимым.
- [ ] Paging остается рабочим без motion.
- [ ] Focus outline видим.
- [ ] aria-current и live announcements соответствуют активной странице.

### Lifecycle

- [ ] После unmount нет ScrollTriggers на удаленных nodes.
- [ ] Listeners, observers, RAF и timers удалены.
- [ ] При повторном mount animations не дублируются.
- [ ] После динамического layout change выполнен единичный refresh.

## 16. Исходники и внешняя справка

- [App composition](../src/components/MobileExperience.tsx)
- [Promo animation](../src/components/PromoSection.tsx)
- [Details animation](../src/components/DetailsSection.tsx)
- [Experience carousel](../src/components/ExperienceCarousel.tsx)
- [Products stack](../src/components/ProductsSection.tsx)
- [Connect carousel](../src/components/ConnectSection.tsx)
- [Critical CSS](../src/styles.css)
- [GSAP React guide](https://gsap.com/resources/React/)
- [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/)
