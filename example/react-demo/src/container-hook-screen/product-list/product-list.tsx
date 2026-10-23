import { ProductListScreen } from './product-list.screen';
import { useProductList } from './use-product-list';
import { AddToCartButton } from '../../cross-slice-sharing/shared';

// TIER 2 — slice file maps hook output to screen props. Spreading aligned
// names is fine; the ban on spread was dropped as ceremony (spec v0.2).
export function ProductList() {
  const listState = useProductList();

  return (
    <ProductListScreen
      {...listState}
      renderAction={(productId) => <AddToCartButton productId={productId} />}
    />
  );
}
