import { useCallback, useEffect, useState } from 'react';
import { getAllDashboardData } from '@/src/data/api';
import type { AllDashboardData } from '@/src/types/data';

export function useDashboardData() {
  const [data, setData] = useState<AllDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    getAllDashboardData(force)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to load analytics data.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return { data, loading, error, retry: () => load(true) };
}
