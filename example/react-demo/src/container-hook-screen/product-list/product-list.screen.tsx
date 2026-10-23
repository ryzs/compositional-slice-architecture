import type { ReactNode } from 'react';
import { Card, Spinner, EmptyState } from '../../ui';
import type { Product } from '../../core/api/fake-api';

export type ProductListScreenProps = {
  products: Product[];
  isLoading: boolean;
  isEmpty: boolean;
  renderAction: (productId: string) => ReactNode;
};

// TIER 2 — a pure screen, split out because this markup is the kind you'd
// target with Storybook stories (loading / empty / data variants).
// `renderAction` is a render-prop slot: the screen stays ignorant of what the
// action does (here it hosts a shared slice — see src/cross-slice-sharing/).
export function ProductListScreen({ products, isLoading, isEmpty, renderAction }: ProductListScreenProps) {
  if (isLoading) return <Spinner label="Loading products…" />;
  if (isEmpty) return <EmptyState message="No products available." />;

  return (
    <div className="grid">
      {products.map((p) => (
        <Card key={p.id} title={p.name} subtitle={`$${p.price}`} footer={renderAction(p.id)} />
      ))}
    </div>
  );
}
