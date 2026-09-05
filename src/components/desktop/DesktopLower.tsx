import { DesktopConnect } from './DesktopConnect'
import { DesktopFaq } from './DesktopFaq'
import { DesktopFooter } from './DesktopFooter'
import './desktop-lower.css'

export function DesktopLower() {
  return (
    <div className="desktop-lower">
      <DesktopConnect />
      <DesktopFaq />
      <DesktopFooter />
    </div>
  )
}
