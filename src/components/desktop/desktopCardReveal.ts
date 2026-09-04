export {
  createCardReveal as createDesktopCardReveal,
  CARD_REVEAL_TIMING as DESKTOP_CARD_REVEAL_TIMING,
  CARD_REVEAL_RISE as DESKTOP_CARD_REVEAL_RISE,
} from '../../motion/cardReveal'

// Technologies retain their separate edge-of-viewport trigger.
export const DESKTOP_CARD_REVEAL_VIEWPORT_RATIO = 0.85
export const DESKTOP_CARD_REVEAL_START = `top ${DESKTOP_CARD_REVEAL_VIEWPORT_RATIO * 100}%`
