import { useEffect, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

// Minimal stand-in for a server-state library's query hook. In a real app
// this is TanStack Query / Apollo / SWR — the slice hooks don't care which.
export function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => !cancelled && setState({ data, isLoading: false, error: null }),
      (error) => !cancelled && setState({ data: null, isLoading: false, error }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return state;
}
