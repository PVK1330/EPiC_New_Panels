import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Wraps any service function that returns a promise into a stateful hook.
 *
 * @param {Function} fetchFn  - () => Promise<AxiosResponse>
 * @param {Array}    deps     - Re-fetches when these values change (default [])
 * @param {Object}   options
 * @param {boolean}  options.enabled  - Set false to skip the initial fetch
 * @returns {{ data, loading, error, refetch }}
 */
export default function useApiQuery(fetchFn, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!enabled);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortRef.current = false;
    try {
      const res = await fetchFn();
      if (!abortRef.current) setData(res.data?.data ?? res.data ?? null);
    } catch (err) {
      if (!abortRef.current) setError(err);
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!enabled) return;
    fetch();
    return () => { abortRef.current = true; };
  }, [fetch, enabled]);

  return { data, loading, error, refetch: fetch };
}
