# Регрессионные проверки

Тесты проверяют поведение демо в Chromium: реальные Tab и клавиши, mouse/pointer,
синтезированные touch-события, геометрию и видимые состояния DOM.

```bash
npm ci
npx playwright install chromium
npm run qa
```

Playwright самостоятельно запускает Vite на `127.0.0.1:5187` и останавливает его
после прогона. Порт должен быть свободен; пользовательский dev-сервер не затрагивается.
На Linux установку системных зависимостей выполняет `npx playwright install --with-deps chromium`.

Если установлен Microsoft Edge, в PowerShell можно использовать его:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run qa
```

| Файл | Сценарии |
|---|---|
| `navigation.spec.ts` | Начальные якоря, сохранение позиции при reload, последовательный Tab и видимость сфокусированных карточек |
| `gestures.spec.ts` | Один шаг на жест, ось/порог, touch и mouse, отпускание снаружи, tap и radio |
| `motion.spec.ts` | Видимость обеих карточек технологий при скролле и смене motion, пороги и reverse, стык секций, размеры экрана и смена режима |
| `focus-media.spec.ts` | Сохранённый фокус → повторная смена reduced motion → resize/refresh → возвращение; opacity и transform, затем blur/reset/replay |
| `tabs.spec.ts` | Crossfade, частое переключение, клавиатура, inert/ARIA и высота панелей |
| `support.ts` | Общие селекторы и действия браузера |

HTML-отчёт: `npx playwright show-report`. При ошибке screenshot и trace лежат
в `test-results/`. Оба каталога исключены из Git; исходники сценариев хранятся в Git.

Это проверка Chromium. Физический iPhone/Safari, browser bars, аппаратная плавность
и Android требуют отдельной приёмки. Набор не измеряет FPS.
