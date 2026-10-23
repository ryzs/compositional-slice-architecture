// The shared barrel: the ONLY legal entry point into shared/.
// Deep imports (shared/slices/..., shared/state/...) are lint violations.
// Guard: nothing inside shared/ imports from a sub-feature — shared/ is a leaf.
export { AddToCartButton } from './slices/add-to-cart-button/add-to-cart-button';
export { useCartSignal } from './state/cart-signal';
