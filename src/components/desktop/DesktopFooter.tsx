import { publicAsset } from '../../publicAsset'

const lowerAsset = (filename: string) => publicAsset(`assets/desktop/lower/${filename}`)
const FOOTER_PLACEHOLDER = '#desktop-footer'

const topNavigation = [
  {
    title: 'Связь',
    links: ['Тарифы для смартфонов', 'Перейти в МегаФон', 'Роуминг', 'Личный кабинет'],
  },
  {
    title: 'Услуги и опции',
    links: ['Пополнить баланс', 'Интернет', 'Звонки и сообщения', 'Безопасность'],
  },
  {
    title: 'Развлечения',
    links: ['МегаКино', 'Игры', 'Акции', 'Кинотеатр START'],
  },
  {
    title: 'Поддержка',
    links: ['Частые вопросы', 'Карта покрытия', 'Салоны связи', 'Контакты'],
  },
] as const

const bottomNavigation = [
  {
    title: 'Интернет‑магазин',
    links: ['Смартфоны', 'Умные часы', 'Аксессуары', 'Покупка в кредит', 'Подобрать номер'],
  },
  {
    title: 'Самозанятым',
    links: ['Комплект для ПВЗ', 'Для маркетплейсов', 'Видеонаблюдение', 'Мобильный интернет', 'Акции'],
  },
  {
    title: 'Бизнесу',
    links: ['Мобильная связь', 'Виртуальная АТС', 'Номер 8-800', 'Рекламная платформа', 'МегаФон Облако'],
  },
  {
    title: 'О компании',
    links: ['Новости', 'Прессе', 'Инвесторам', 'Сотрудничество'],
  },
] as const

const socialLinks = [
  { label: 'ВКонтакте', icon: 'social-vk.svg' },
  { label: 'Одноклассники', icon: 'social-ok.svg' },
  { label: 'YouTube', icon: 'social-youtube.svg' },
  { label: 'Сообщество МегаФона', icon: 'social-service.svg' },
  { label: 'Telegram', icon: 'social-telegram.svg' },
] as const

function StoreIcon({ platform }: { platform: 'ios' | 'android' }) {
  const layers = platform === 'ios'
    ? ['ios-1.svg', 'ios-2.svg', 'ios-3.svg']
    : ['android-1.svg', 'android-2.svg', 'android-3.svg', 'android-4.svg']

  return (
    <span className={`dl-store-icon dl-store-icon--${platform}`} aria-hidden="true">
      {layers.map((layer) => <img key={layer} src={lowerAsset(layer)} alt="" />)}
    </span>
  )
}

function FooterNavigationGroup({
  title,
  links,
  linkedTitle = false,
}: {
  title: string
  links: readonly string[]
  linkedTitle?: boolean
}) {
  return (
    <section className="dl-footer-nav-group">
      <h2>
        {linkedTitle
          ? <a href={FOOTER_PLACEHOLDER}>{title}</a>
          : title}
      </h2>
      <ul>
        {links.map((link) => (
          <li key={link}><a href={FOOTER_PLACEHOLDER}>{link}</a></li>
        ))}
      </ul>
    </section>
  )
}

export function DesktopFooter() {
  return (
    <footer id="desktop-footer" className="dl-footer">
      <div className="dl-footer__inner">
        <nav className="dl-footer-navigation" aria-label="Разделы сайта">
          <div className="dl-footer-navigation__top">
            <div className="dl-footer-navigation__columns">
              {topNavigation.map((group) => <FooterNavigationGroup key={group.title} {...group} />)}
            </div>

            <section className="dl-footer-app" aria-labelledby="desktop-footer-app-title">
              <h2 id="desktop-footer-app-title"><a href={FOOTER_PLACEHOLDER}>Приложение «МегаФон»</a></h2>
              <div className="dl-footer-app__stores">
                <div className="dl-footer-app__buttons">
                  <a href={FOOTER_PLACEHOLDER} aria-label="Скачать приложение МегаФон для iOS">
                    <StoreIcon platform="ios" />
                    <span>iOS</span>
                  </a>
                  <a href={FOOTER_PLACEHOLDER} aria-label="Скачать приложение МегаФон для Android">
                    <StoreIcon platform="android" />
                    <span>Android</span>
                  </a>
                </div>
                <a className="dl-footer-app__qr-link" href={FOOTER_PLACEHOLDER} aria-label="Установить приложение МегаФон по QR-коду">
                  <img src={lowerAsset('footer-qr.png')} alt="QR-код для установки приложения МегаФон" width="83" height="116" />
                </a>
              </div>
            </section>
          </div>

          <div className="dl-footer-navigation__bottom">
            <div className="dl-footer-navigation__columns">
              {bottomNavigation.map((group) => <FooterNavigationGroup key={group.title} {...group} linkedTitle />)}
            </div>
            <div className="dl-footer-actions">
              <a href={FOOTER_PLACEHOLDER}>Оцените наш сайт</a>
              <a href={FOOTER_PLACEHOLDER}>Работа в МегаФоне</a>
            </div>
          </div>
        </nav>

        <div className="dl-footer-info">
          <div className="dl-footer-info__grid">
            <div className="dl-footer-privacy">
              <span className="dl-footer-privacy__age">6+</span>
              <div className="dl-footer-privacy__copy">
                <p>
                  Продолжая использовать наш сайт, вы даете согласие на обработку файлов Cookies и других пользовательских данных, в соответствии с{' '}
                  <a href={FOOTER_PLACEHOLDER}>Политикой конфиденциальности</a>
                </p>
                <a href={FOOTER_PLACEHOLDER}>Политика в отношении обработки персональных данных ПАО «МегаФон»</a>
              </div>
            </div>

            <div className="dl-footer-subscribe">
              <div className="dl-footer-subscribe__message">
                <img src={lowerAsset('footer-gift.png')} alt="" width="48" height="48" />
                <p>Делимся скидками и предложениями</p>
              </div>
              <a href={FOOTER_PLACEHOLDER}>
                <span>Подписаться</span>
                <img src={lowerAsset('footer-arrow.svg')} alt="" width="32" height="32" />
              </a>
            </div>
          </div>
        </div>

        <div className="dl-footer-bottom">
          <div className="dl-footer-bottom__left">
            <div className="dl-footer-copyright">
              <span className="dl-footer-copyright__mark"><img src={lowerAsset('footer-copyright.png')} alt="" width="24" height="24" /></span>
              <span>© 2026 ПАО «МегаФон»</span>
            </div>
            <div className="dl-footer-legal-links">
              <a href={FOOTER_PLACEHOLDER}>Условия оказания услуг</a>
              <a href={FOOTER_PLACEHOLDER}>Лицензии</a>
            </div>
          </div>

          <div className="dl-footer-bottom__right">
            <div className="dl-footer-socials">
              {socialLinks.map(({ label, icon }) => (
                <a href={FOOTER_PLACEHOLDER} aria-label={label} key={label}>
                  <img src={lowerAsset(icon)} alt="" width="32" height="32" />
                </a>
              ))}
            </div>
            <a className="dl-footer-coverage" href={FOOTER_PLACEHOLDER} aria-label="Самое широкое покрытие">
              <img src={lowerAsset('footer-coverage.png')} alt="Самое широкое покрытие" width="100" height="32" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
