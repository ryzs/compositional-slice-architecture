import { CartPageScreen } from './cart-page.screen';
import { useCart } from './use-cart';
import { useCartTotals } from './use-cart-totals';
import { usePromoCode } from './use-promo-code';

// TIER 3 — container promotion. Earned because this slice composes three
// sibling hooks with non-trivial wiring (promo discount feeds totals, totals
// gate checkout) and the business hooks must stay pure for unit testing.
//
// Note what's NOT here: no adapter layer. This demo is single-platform, so
// per the revised Principle 4 the container may call the platform directly
// (window.alert stands in for navigation). Adapters appear when platform #2 does.
export function CartPage() {
  const cart = useCart();
  const promo = usePromoCode();
  const totals = useCartTotals(cart.items, promo.discountRate);

  const onCheckout = () => {
    if (cart.items.length === 0) return;
    window.alert(`Checkout: $${totals.total} (navigation adapter would fire here)`);
  };

  return (
    <CartPageScreen
      items={cart.items}
      totals={totals}
      promoValue={promo.value}
      promoError={promo.error}
      promoApplied={promo.applied}
      onPromoChange={promo.setValue}
      onApplyPromo={promo.apply}
      onCheckout={onCheckout}
      onRemoveItem={cart.removeItem}
      onChangeQuantity={cart.changeQuantity}
    />
  );
}
