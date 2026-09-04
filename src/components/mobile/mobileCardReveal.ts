export {
  createCardReveal as createMobileCardReveal,
  CARD_REVEAL_TIMING as MOBILE_CARD_REVEAL_TIMING,
} from '../../motion/cardReveal'

// 95% from the top: the element enters 5% above the viewport's lower edge.
export const MOBILE_CARD_REVEAL_VIEWPORT_RATIO = 0.95
export const MOBILE_CARD_REVEAL_START = `top ${MOBILE_CARD_REVEAL_VIEWPORT_RATIO * 100}%`
