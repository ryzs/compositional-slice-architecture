import { fakeApi } from '../../core/api/fake-api';
import { useAsync } from '../../core/hooks/use-async';

export function useProductList() {
  const { data, isLoading } = useAsync(fakeApi.listProducts);
  const products = data ?? [];
  return { products, isLoading, isEmpty: !isLoading && products.length === 0 };
}
