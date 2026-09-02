import { useEffect, useState } from 'react'
import { MobileExperience } from './components/MobileExperience'
import { DesktopExperience } from './components/desktop/DesktopExperience'
import { publicAsset } from './publicAsset'

type ViewportMode = 'mobile' | 'tablet' | 'desktop'

function getViewportMode(): ViewportMode {
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile'
  if (window.matchMedia('(min-width: 1280px)').matches) return 'desktop'
  return 'tablet'
}

function TabletGate() {
  return (
    <main className="desktop-gate">
      <img
        className="desktop-gate__logo"
        src={publicAsset('assets/promo/megafon-logo.svg')}
        alt="МегаФон"
        width="169"
        height="30"
      />

      <div className="desktop-gate__phone" aria-hidden="true">
        <span />
      </div>

      <div className="desktop-gate__copy">
        <p className="desktop-gate__eyebrow">Промежуточный размер</p>
        <h1>Измените ширину окна</h1>
        <p>Мобильная версия доступна до 767 px, desktop — от 1280 px.</p>
      </div>
    </main>
  )
}

export default function App() {
  const [viewportMode, setViewportMode] = useState<ViewportMode>(getViewportMode)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const desktopQuery = window.matchMedia('(min-width: 1280px)')
    const syncViewportMode = () => setViewportMode(getViewportMode())

    mobileQuery.addEventListener('change', syncViewportMode)
    desktopQuery.addEventListener('change', syncViewportMode)
    window.addEventListener('resize', syncViewportMode)

    return () => {
      mobileQuery.removeEventListener('change', syncViewportMode)
      desktopQuery.removeEventListener('change', syncViewportMode)
      window.removeEventListener('resize', syncViewportMode)
    }
  }, [])

  if (viewportMode === 'mobile') return <MobileExperience />
  if (viewportMode === 'desktop') return <DesktopExperience />
  return <TabletGate />
}
