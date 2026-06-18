import { useState, useCallback } from 'react';

/**
 * Wraps any service function that takes arguments and returns a promise.
 *
 * @param {Function} mutateFn  - (...args) => Promise<AxiosResponse>
 * @returns {{ mutate, loading, error, data }}
 *
 * Usage:
 *   const { mutate: save, loading } = useApiMutation(updateOrganisation);
 *   await save(id, payload);
 */
export default function useApiMutation(mutateFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutateFn(...args);
      const result = res.data?.data ?? res.data ?? null;
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutateFn]);

  return { mutate, loading, error, data };
}
