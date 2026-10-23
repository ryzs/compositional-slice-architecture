import type { CartItem } from './use-cart';

export type CartTotals = {
  subtotal: number;
  discount: number;
  total: number;
};

// Pure derivation hook (no state of its own). Sibling hook composed by the container.
export function useCartTotals(items: CartItem[], discountRate: number): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round(subtotal * discountRate);
  return { subtotal, discount, total: subtotal - discount };
}
