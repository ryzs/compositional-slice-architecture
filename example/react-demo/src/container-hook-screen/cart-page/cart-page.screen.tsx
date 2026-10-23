import { Button, EmptyState } from '../../ui';
import type { CartItem } from './use-cart';
import type { CartTotals } from './use-cart-totals';

export type CartPageScreenProps = {
  items: CartItem[];
  totals: CartTotals;
  promoValue: string;
  promoError: string | null;
  promoApplied: string | null;
  onPromoChange: (value: string) => void;
  onApplyPromo: () => void;
  onCheckout: () => void;
  onRemoveItem: (productId: string) => void;
  onChangeQuantity: (productId: string, delta: number) => void;
};

export function CartPageScreen({
  items,
  totals,
  promoValue,
  promoError,
  promoApplied,
  onPromoChange,
  onApplyPromo,
  onCheckout,
  onRemoveItem,
  onChangeQuantity,
}: CartPageScreenProps) {
  if (items.length === 0) return <EmptyState message="Your cart is empty." />;

  return (
    <div>
      <ul className="cart-lines">
        {items.map((item) => (
          <li key={item.productId}>
            <span>
              {item.name} — ${item.price}
            </span>
            <span>
              <button className="qty" onClick={() => onChangeQuantity(item.productId, -1)}>
                −
              </button>
              {item.quantity}
              <button className="qty" onClick={() => onChangeQuantity(item.productId, 1)}>
                +
              </button>
              <button className="link" onClick={() => onRemoveItem(item.productId)}>
                remove
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div className="promo">
        <input
          value={promoValue}
          onChange={(e) => onPromoChange(e.target.value)}
          placeholder="Promo code (SAVE10)"
        />
        <Button variant="secondary" onClick={onApplyPromo}>
          Apply
        </Button>
        {promoError && <p className="error">{promoError}</p>}
        {promoApplied && <p className="notice">Code {promoApplied} applied.</p>}
      </div>

      <dl className="totals">
        <div>
          <dt>Subtotal</dt>
          <dd>${totals.subtotal}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd>−${totals.discount}</dd>
        </div>
        <div>
          <dt>
            <strong>Total</strong>
          </dt>
          <dd>
            <strong>${totals.total}</strong>
          </dd>
        </div>
      </dl>

      <Button onClick={onCheckout}>Checkout</Button>
    </div>
  );
}
