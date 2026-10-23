import { Button } from '../../../../ui';
import { useAddToCart } from './use-add-to-cart';
import { useCartSignal } from '../../state/cart-signal';

// A SHARED SLICE. Stateful, self-contained: owns its mutation and its
// pending/done lifecycle. Consumers pass identity only (productId) — that's
// the contract that makes it safely embeddable anywhere.
// Tier-1 shape (hook + inline render): shared slices follow variable ceremony too.
export function AddToCartButton({ productId }: { productId: string }) {
  const { status, add } = useAddToCart(productId);
  const recordAdd = useCartSignal((s) => s.recordAdd);

  const onClick = async () => {
    await add();
    recordAdd(productId);
  };

  return (
    <Button onClick={onClick} disabled={status === 'pending'}>
      {status === 'pending' ? 'Adding…' : status === 'done' ? 'Added ✓' : 'Add to cart'}
    </Button>
  );
}
