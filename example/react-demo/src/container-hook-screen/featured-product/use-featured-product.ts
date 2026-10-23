import { fakeApi } from '../../core/api/fake-api';
import { useAsync } from '../../core/hooks/use-async';

export function useFeaturedProduct() {
  const { data: product, isLoading, error } = useAsync(fakeApi.getFeaturedProduct);
  return { product, isLoading, error };
}
