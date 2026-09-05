import { MobileConnect } from './MobileConnect'
import { MobileFaq } from './MobileFaq'
import { MobileFooter } from './MobileFooter'
import './mobile-lower.css'

export function MobileLower() {
  return (
    <div className="mf-mobile-lower">
      <MobileConnect />
      <MobileFaq />
      <MobileFooter />
    </div>
  )
}
