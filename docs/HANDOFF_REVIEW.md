# Предрелизное ревью демо

- Дата проверки: 2 сентября 2026
- Mobile reference: iPhone 13, portrait, 390 × 844 CSS px
- Desktop reference: 1440 × 5566 CSS px

## Граница ответственности

Mobile остается поведенческим motion-прототипом: он передает сценарии, последовательность состояний, направление движения, пороги и характер easing. Desktop собран как визуальная спецификация; hero дополнен отдельным scroll-сценарием, остальные desktop-секции пока статичны. Текущие DOM, CSS, абсолютная геометрия и визуальные стили не являются production-реализацией и не предназначены для прямого переноса.

Pixel-perfect проверка выполнена для `390 × 844` (mobile motion reference) и `1440 × 5566` (desktop static reference). Диапазон `768–1279 px` намеренно закрыт заглушкой; mobile и desktop включаются только на своих целевых диапазонах.

## Результат автоматических проверок

| Проверка | Результат |
|---|---|
| `npm ci` / lock-файл | проходит |
| `npm run typecheck` | проходит |
| `npm run build` | проходит |
| `npm audit --omit=dev` | 0 уязвимостей |
| TODO/FIXME/debugger/console в runtime-коде | не найдены |
| отсутствующие runtime-images после полной прокрутки | не найдены |
| горизонтальный overflow на 390 и 767 px | не найден |
| breakpoint contract | `≤767` mobile, `768–1279` заглушка, `≥1280` desktop |
| `npm run build:pages` / asset base | проходит, пути получают `/mega-5g-mobile-demo/` |

Production artifact с точными mobile- и desktop-экспортами: 96 файлов, около 21.6 МБ. Runtime-папка `public` содержит 93 файла, около 21.2 МБ; тяжелые desktop-растры загружаются лениво.

## Что исправлено перед передачей

- CTA hero теперь ведет на существующий `#profiles`;
- исправлены опечатки в product-chip и заголовке тарифов;
- инструкция синхронизирована с четырьмя product cards, тремя stack-сегментами и актуальным reduced-motion layout;
- добавлен явный embed-контракт тарифов;
- исправлен отложенный `requestAnimationFrame` cleanup в Connect slider;
- убрано потенциальное двойное live-объявление pagination Experience;
- `aria-roledescription` Connect приведен к языку интерфейса;
- зафиксированы Node engines, `.nvmrc` и единая команда `npm run check`;
- крупные runtime-растры заменены мобильными WebP, глубокие Connect-images переведены на lazy loading;
- старые неиспользуемые дизайн-экспорты удалены из `public`, поэтому Vite больше не копирует их в `dist`.

## Визуальная и интерактивная проверка

- стартовый hero и fixed header на `390 × 844`;
- CTA-scroll к product section;
- вход Details без разрыва между секциями;
- Product stack: четыре состояния, шаг стопки 8 px, forward/reverse и финальный переход к тарифам;
- Connect: загрузка оптимизированного телефона, click-навигация и синхронизация номера, экрана и текста;
- полная прокрутка до footer без 404 images;
- smoke-test 767/768 px.
- desktop 1440 px: header, hero, benefits, technologies, четыре вертикальных профиля, оба состояния «Как подключить», FAQ и footer;
- desktop hero на 1280 и 1440 px: общая фиксация header, breadcrumbs и hero на один viewport, физическое перекрытие белой поверхностью, раскрытие 50 → 0 px, scale изображения 1 → 1.25, fade/подъем copy, staggered 3D-entrance обоих рядов карточек, прямой и обратный ход без разрыва на стыке;
- desktop Lenis: плавный wheel-scroll, синхронизация с ScrollTrigger, smooth CTA-anchor и чистый mount/unmount на границе 1279/1280 px;
- точные границы 767/768/1279/1280 px и промежуточная заглушка;
- keyboard-навигация tabs, duration radio-selector и GitHub Pages asset paths.

## Что должен решить продуктовый разработчик

1. Пересобрать механику внутри продуктовой архитектуры и дизайн-системы; не копировать текущую верстку и CSS буквально.
2. Подключить бизнес-логику header-actions, profile-actions, FAQ и footer-links.
3. Заменить tariff placeholders реальным embed-root с собственной доступной семантикой.
4. Вынести глобальный `ScrollTrigger.config({ ignoreMobileResize: true })` в animation bootstrap и проверить его со всеми scroll-сценариями продукта.
5. Провести финальный тест на реальном iPhone 13 в Safari и Chrome iOS, включая быстрый reverse-scroll и скрытие browser bars.
6. Подтвердить права на фирменные изображения и MegaFon Graphik LC.
7. При переносе сохранить единый asset-base: в демо он задается через `publicAsset()` и режим `github-pages` в Vite.
8. Перед передачей через Git создать исходный commit/tag: текущая рабочая копия пока не имеет отслеживаемого baseline.
9. При необходимости production-grade контроля добавить lint и UI/e2e-тесты: текущая демка опирается на TypeScript, build и ручную motion-QA.
10. При обновлении мобильного дизайна удалить секцию тарифов: в новом макете она намеренно отсутствует.

Подробный технический контракт: [ANIMATION_INTEGRATION.md](ANIMATION_INTEGRATION.md).
