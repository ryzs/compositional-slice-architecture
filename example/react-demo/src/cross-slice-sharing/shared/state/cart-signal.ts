import { create } from 'zustand';

// DECLARED cross-slice state (see ../../sibling-state/README.md for the rule).
// Every slice that reads or writes the cart signal imports THIS module through
// the shared barrel. `grep -r "cart-signal"` = the complete participant list.
type CartSignalState = {
  addCount: number;
  lastAddedId: string | null;
  recordAdd: (productId: string) => void;
};

export const useCartSignal = create<CartSignalState>((set) => ({
  addCount: 0,
  lastAddedId: null,
  recordAdd: (productId) =>
    set((s) => ({ addCount: s.addCount + 1, lastAddedId: productId })),
}));
