import { MobileIntro } from './mobile/MobileIntro'
import { MobileProfiles } from './mobile/MobileProfiles'
import { MobileLower } from './mobile/MobileLower'
import { publicAsset } from '../publicAsset'

export function MobileExperience() {
  return (
    <main id="top" className="mobile-experience mf-mobile-page">
      <header className="mobile-header">
        <div className="mobile-header__rail">
          <a className="mobile-header__brand" href="#top" aria-label="МегаФон — в начало страницы">
            <img className="mobile-header__brand-mark" src={publicAsset('assets/mobile/final/intro-logo-mark.svg')} alt="" width="24" height="24" />
            <img className="mobile-header__brand-wordmark" src={publicAsset('assets/mobile/final/intro-logo-wordmark.svg')} alt="" width="103" height="14" />
          </a>

          <div className="mobile-header__actions">
            <button className="mobile-header__login" type="button" aria-disabled="true">Войти</button>
            <button className="mobile-header__menu" type="button" aria-label="Открыть меню" aria-disabled="true">
              <img src={publicAsset('assets/mobile/final/intro-menu.svg')} alt="" width="32" height="32" />
            </button>
          </div>
        </div>
      </header>

      <MobileIntro />
      <MobileProfiles />
      <MobileLower />
    </main>
  )
}
