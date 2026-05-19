import { useState, useEffect } from 'react';
import api from '../services/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T>(url: string): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get<T>(url);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message ?? 'Erro desconhecido');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { data, loading, error, refetch };
};
