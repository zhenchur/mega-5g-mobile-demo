import { publicAsset } from '../../publicAsset'

const lowerAsset = (name: string) => publicAsset(`assets/mobile/final/lower-${name}`)
const footerAsset = (name: string) => publicAsset(`assets/footer/${name}`)

const navigation = ['Связь', 'Услуги и опции', 'Развлечения', 'Поддержка', 'Интернет-магазин', 'Самозанятым', 'Бизнесу', 'О компании']
const socials = [
  { name: 'ВКонтакте', file: 'vk' },
  { name: 'Одноклассники', file: 'ok' },
  { name: 'YouTube', file: 'youtube' },
  { name: 'Хабр', file: 'habr' },
  { name: 'Telegram', file: 'telegram' },
]

export function MobileFooter() {
  return (
    <footer id="mf-mobile-footer" className="mf-mobile-footer">
      <nav className="mf-mobile-footer-nav" aria-label="Разделы сайта">
        {navigation.map((item) => (
          <div className="mf-mobile-footer-nav-row" key={item}>
            <span>{item}</span>
            <span className="mf-mobile-footer-chevron"><img src={lowerAsset('chevron.svg')} alt="" width="13" height="8" /></span>
          </div>
        ))}
      </nav>
      <section className="mf-mobile-footer-app" aria-labelledby="mf-mobile-footer-app-title">
        <h2 id="mf-mobile-footer-app-title">Приложение МегаФон<img src={lowerAsset('app-arrow.svg')} alt="" width="20" height="20" /></h2>
        <div className="mf-mobile-footer-stores">
          <div className="mf-mobile-footer-store-buttons">
            <a href="#mf-mobile-footer"><img src={lowerAsset('android.svg')} alt="" width="32" height="32" /><span>Android</span></a>
            <a href="#mf-mobile-footer"><img src={lowerAsset('ios.svg')} alt="" width="32" height="32" /><span>iOS</span></a>
          </div>
          <img className="mf-mobile-footer-qr" src={footerAsset('qr.png')} alt="QR-код для установки приложения МегаФон" width="83" height="116" loading="lazy" />
        </div>
        <div className="mf-mobile-footer-actions">
          <a href="#mf-mobile-footer">Помогите нам стать лучше</a>
          <a href="#mf-mobile-footer">Работа в МегаФоне</a>
        </div>
      </section>
      <div className="mf-mobile-footer-promo">
        <img src={lowerAsset('gift.png')} alt="" width="48" height="48" loading="lazy" />
        <p>Делимся скидками<br />и предложениями</p>
        <a href="#mf-mobile-footer" aria-label="Подписаться на скидки и предложения"><img src={lowerAsset('send.svg')} alt="" width="32" height="32" /></a>
      </div>
      <div className="mf-mobile-footer-bottom">
        <div className="mf-mobile-footer-privacy">
          <span className="mf-mobile-footer-age">6+</span>
          <div>
            <p>Продолжая использовать наш сайт, вы даете согласие на обработку файлов Cookies и других пользовательских данных, в соответствии с <a href="#mf-mobile-footer">Политикой конфиденциальности</a></p>
            <p><a href="#mf-mobile-footer">Политика</a> обработки персональных данных ПАО «МегаФон»</p>
          </div>
        </div>
        <div className="mf-mobile-footer-copyright">
          <span><img src={lowerAsset('logo.svg')} alt="" width="24" height="24" /></span>
          <p>© 2024 ПАО «МегаФон»</p>
        </div>
        <div className="mf-mobile-footer-legal"><a href="#mf-mobile-footer">Условия оказания услуг</a><a href="#mf-mobile-footer">Лицензии</a></div>
        <div className="mf-mobile-footer-social-row">
          <div className="mf-mobile-footer-socials">
            {socials.map(({ name, file }) => <a href="#mf-mobile-footer" aria-label={name} key={file}><img src={lowerAsset(`social-${file}.svg`)} alt="" width="32" height="32" /></a>)}
          </div>
          <div className="mf-mobile-footer-award" role="img" aria-label="Speedtest Awards by Ookla">
            <img className="mf-mobile-footer-award-bottom" src={lowerAsset('award-bottom.svg')} alt="" />
            <img className="mf-mobile-footer-award-top" src={lowerAsset('award-top.svg')} alt="" />
            <img className="mf-mobile-footer-award-middle" src={lowerAsset('award-middle.svg')} alt="" />
            <img className="mf-mobile-footer-award-mark" src={lowerAsset('award-mark.svg')} alt="" />
          </div>
        </div>
      </div>
    </footer>
  )
}
