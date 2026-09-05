# Мега 5G — моушн-система и демо

Рабочий референс анимаций desktop и mobile на React, TypeScript, GSAP и ScrollTrigger.

- **[Открыть демо](https://zhenchur.github.io/mega-5g-mobile-demo/)** — размер окна выбирает версию.
- **[Моушн-система](docs/MOTION_SYSTEM.md)** — карта зон, элементы, параметры, сценарии и различия версий. Начните с этого документа.
- [Интеграция в продукт](docs/ANIMATION_INTEGRATION.md) — структура кода, владение анимацией, cleanup и порядок переноса.
- [Аудит перед передачей](docs/HANDOFF_REVIEW.md) — выполненные проверки и границы проверки.
- [Повторный аудит](docs/CODE_REVIEW_FOLLOWUP.md) — сравнение с первым ревью: исправления, остатки и новые замечания.
- [Визуальный аудит](docs/VISUAL_AUDIT.md) — desktop/mobile, сверка с Figma, скриншоты и открытые визуальные дефекты.
- [Мобильный дизайн](docs/MOBILE_DESIGN.md) — геометрия, ассеты и история мобильных решений.

Демо задаёт поведение и динамику. Продуктовые компоненты, бизнес-логику и адаптивную верстку разработчики реализуют внутри своей архитектуры. Кнопки оформления услуги, авторизация, меню и большая часть FAQ здесь служат визуальными образцами; их состояния перечислены в моушн-системе.

## Режимы

| Viewport | Режим | Figma |
|---|---|---|
| ≤767 px | Обновлённая мобильная версия; нативный скролл | [360 px](https://www.figma.com/design/2g9qm05bxiZ5EeRtcuLiNi/MegaFon_Mega-5G_landing-3d_INNER?node-id=1853-28007), [клиентская вкладка](https://www.figma.com/design/2g9qm05bxiZ5EeRtcuLiNi/MegaFon_Mega-5G_landing-3d_INNER?node-id=1986-43263) |
| 768–1279 px | Статичная планшетная заглушка | Планшетная композиция не задана |
| ≥1280 px | Desktop с Lenis | [1440 px](https://www.figma.com/design/2g9qm05bxiZ5EeRtcuLiNi/MegaFon_Mega-5G_landing-3d_INNER?node-id=1824-18329), [клиентская вкладка](https://www.figma.com/design/2g9qm05bxiZ5EeRtcuLiNi/MegaFon_Mega-5G_landing-3d_INNER?node-id=1986-36291) |

Мобильные входы запускаются на линии **95% высоты viewport от верхнего края** (5% от нижнего). Desktop использует 85%, технологии — нижнюю границу. Это пороги запуска временной анимации, а не её длительность. Промо имеет отдельный scroll-сценарий.

## Локальный запуск

Node.js `^20.19.0 || >=22.12.0`; рекомендуемая версия в [.nvmrc](.nvmrc).

~~~bash
npm ci
npm run dev
~~~

Для телефона в той же Wi-Fi-сети:

~~~bash
npm run dev -- --host 0.0.0.0
~~~

Откройте Network URL, который напечатает Vite. Компьютер должен оставаться включённым. Для просмотра вне локальной сети используйте публичное демо выше.

## Проверка и публикация

~~~bash
npm run typecheck
npx playwright install chromium
npm run qa
npm run build
npm run preview
npm run build:pages
npm run preview:pages
~~~

Регрессионные сценарии хранятся в [tests](tests); [порядок запуска](tests/README.md) включает touch, клавиатуру, якоря, пороги, стык секций и cleanup. QA самостоятельно запускает отдельный Vite на порту 5187.

GitHub Pages обслуживается из ветки `gh-pages`. После коммита и отправки исходников в `main` обновить опубликованную сборку:

~~~bash
npm run deploy:pages
~~~

Эта команда публикует текущую production-сборку в удалённую ветку. Vite задаёт base `/mega-5g-mobile-demo/` только в режиме `github-pages`; все локальные ассеты используют `publicAsset()`. `dist/` не хранится в исходной ветке.

## Где искать реализацию

| Путь | Назначение |
|---|---|
| [src/motion](src/motion) | Общий вход, вложенная последовательность, видимость при фокусе и токены промо/вкладок |
| [src/interactions](src/interactions) | Общие контроллеры пошаговых жестов и вкладок Connect |
| [src/navigation/useInitialHash.ts](src/navigation/useInitialHash.ts) | Первый переход по якорю после готовности layout |
| [src/styles](src/styles) | Только актуальные общие стили, шапка и переключение viewport |
| [src/components/mobile/mobileCardReveal.ts](src/components/mobile/mobileCardReveal.ts) | Мобильный порог 95% и адаптер общего reveal |
| [src/components/desktop/desktopCardReveal.ts](src/components/desktop/desktopCardReveal.ts) | Desktop-порог 85% и адаптер общего reveal |
| [src/App.tsx](src/App.tsx) | Взаимоисключающее монтирование mobile / tablet / desktop |
| [src/components/mobile](src/components/mobile) | Intro, Profiles, Connect, FAQ, Footer, адаптеры свайпов и стили |
| [src/components/desktop](src/components/desktop) | Актуальные desktop-зоны и Lenis |
| [public/assets/desktop/final](public/assets/desktop/final), [public/assets/mobile/final](public/assets/mobile/final) | Экспорты текущего Figma; часть desktop-ассетов общая для обеих версий |

Рабочую мобильную композицию собирает [MobileExperience.tsx](src/components/MobileExperience.tsx), desktop — [DesktopExperience.tsx](src/components/desktop/DesktopExperience.tsx). Контроллеры взаимодействий и motion находятся в каталогах из таблицы выше.

## Очистка предыдущего прототипа

5 сентября 2026 удалены семь неиспользуемых компонентов из `src/components/`: `PromoSection.tsx`, `DetailsSection.tsx`, `ExperienceCarousel.tsx`, `ProductsSection.tsx`, `ConnectSection.tsx`, `TariffsSection.tsx`, `FooterSection.tsx`, а также архив стилей `src/legacy/prototype.css`. История прежней реализации остаётся в Git. Состав текущей страницы и параметры анимации не изменены. После очистки отдельно исправлены все пять замечаний [визуального аудита](docs/VISUAL_AUDIT.md), включая N1 / P2; расширенный набор проходит **36/36**.
