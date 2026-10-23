import { fakeApi } from '../../core/api/fake-api';
import { useAsync } from '../../core/hooks/use-async';

export function useDealsRail() {
  const { data, isLoading } = useAsync(fakeApi.listDeals);
  return { deals: data ?? [], isLoading };
}
