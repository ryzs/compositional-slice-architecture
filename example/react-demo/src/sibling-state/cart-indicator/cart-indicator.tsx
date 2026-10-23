import { useCartSignal } from '../../cross-slice-sharing/shared';

// READER slice. Never imports AddToCartButton or any writer — it knows only
// the declared channel (cart-signal, via the shared barrel). Tier-1 shape.
export function CartIndicator() {
  const addCount = useCartSignal((s) => s.addCount);
  const lastAddedId = useCartSignal((s) => s.lastAddedId);

  return (
    <p>
      🛒 <strong>{addCount}</strong> item{addCount === 1 ? '' : 's'} added this session
      {lastAddedId && (
        <span className="notice"> — last: <code>{lastAddedId}</code></span>
      )}
    </p>
  );
}
