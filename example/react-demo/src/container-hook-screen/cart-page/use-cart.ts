import { useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

const SEED: CartItem[] = [
  { productId: 'p1', name: 'Field Jacket', price: 128, quantity: 1 },
  { productId: 'p3', name: 'Wool Beanie', price: 28, quantity: 2 },
];

// TIER 3 — a PURE business hook. No analytics, no navigation, no toasts.
// Side-effect wiring lives in the container; this stays unit-testable
// with nothing mocked.
export function useCart() {
  const [items, setItems] = useState<CartItem[]>(SEED);

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const changeQuantity = (productId: string, delta: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );

  return { items, removeItem, changeQuantity };
}
