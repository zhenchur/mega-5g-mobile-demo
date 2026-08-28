# Предрелизное ревью демо

- Дата проверки: 28 августа 2026
- Референсный viewport: iPhone 13, portrait, 390 × 844 CSS px

## Граница ответственности

Это поведенческий motion-прототип. Он передает сценарии, последовательность состояний, направление движения, пороги и характер easing. Текущие DOM, CSS, абсолютная геометрия и визуальные стили не являются production-реализацией и не предназначены для прямого переноса.

Pixel-perfect проверка выполнена только для `390 × 844`. Более широкие, более высокие и landscape-вьюпорты могут работать некорректно и требуют отдельной адаптации.

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
| breakpoint 768 px | mobile скрыт, desktop-gate показан |

Production artifact после очистки: 50 файлов, около 1.46 МБ. Runtime-папка `public` содержит 47 файлов, около 1.10 МБ.

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

## Что должен решить продуктовый разработчик

1. Пересобрать механику внутри продуктовой архитектуры и дизайн-системы; не копировать текущую верстку и CSS буквально.
2. Подключить бизнес-логику header-actions, profile-actions, FAQ и footer-links.
3. Заменить tariff placeholders реальным embed-root с собственной доступной семантикой.
4. Вынести глобальный `ScrollTrigger.config({ ignoreMobileResize: true })` в animation bootstrap и проверить его со всеми scroll-сценариями продукта.
5. Провести финальный тест на реальном iPhone 13 в Safari и Chrome iOS, включая быстрый reverse-scroll и скрытие browser bars.
6. Подтвердить права на фирменные изображения и MegaFon Graphik LC.
7. Настроить asset base для subpath/CDN, если приложение публикуется не в корне домена.
8. Перед передачей через Git создать исходный commit/tag: текущая рабочая копия пока не имеет отслеживаемого baseline.
9. При необходимости production-grade контроля добавить lint и UI/e2e-тесты: текущая демка опирается на TypeScript, build и ручную motion-QA.

Подробный технический контракт: [ANIMATION_INTEGRATION.md](ANIMATION_INTEGRATION.md).
