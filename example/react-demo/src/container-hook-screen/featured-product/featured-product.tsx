import { Card, Spinner } from '../../ui';
import { useFeaturedProduct } from './use-featured-product';

// TIER 1 — the default slice shape: hook + inline render, two files total.
// No .screen.tsx. The markup is small, has no platform divergence, and isn't
// a visual-regression target, so a separate screen file would be pure ceremony.
export function FeaturedProduct() {
  const { product, isLoading, error } = useFeaturedProduct();

  if (isLoading) return <Spinner label="Loading featured product…" />;
  if (error || !product) return <p className="error">Could not load featured product.</p>;

  return (
    <Card title={product.name} subtitle={`$${product.price} — featured this week`} />
  );
}
