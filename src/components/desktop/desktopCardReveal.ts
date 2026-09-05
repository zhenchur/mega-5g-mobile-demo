export { createCardReveal as createDesktopCardReveal } from '../../motion/cardReveal'

// Technologies retain their separate edge-of-viewport trigger.
const DESKTOP_CARD_REVEAL_VIEWPORT_RATIO = 0.85
export const DESKTOP_CARD_REVEAL_START = `top ${DESKTOP_CARD_REVEAL_VIEWPORT_RATIO * 100}%`
