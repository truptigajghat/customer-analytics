import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const message =
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred while loading data.';
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, trigger]);

  return { data, loading, error, refetch };
}
