import { Card, Spinner } from '../../ui';
import { useDealsRail } from './use-deals-rail';
import { AddToCartButton } from '../shared';

// Consumer slice #2 of the shared AddToCartButton (consumer #1 is
// product-list). Note the import: from '../shared', the barrel — never
// '../shared/slices/add-to-cart-button/...'. Tier-1 shape.
export function DealsRail() {
  const { deals, isLoading } = useDealsRail();

  if (isLoading) return <Spinner label="Loading deals…" />;

  return (
    <div className="grid">
      {deals.map((p) => (
        <Card
          key={p.id}
          title={p.name}
          subtitle={`$${p.price} — deal`}
          footer={<AddToCartButton productId={p.id} />}
        />
      ))}
    </div>
  );
}
