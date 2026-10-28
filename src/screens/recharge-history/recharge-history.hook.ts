import { useCallback, useEffect, useState } from 'react';
import { API_POLL_INTERVAL_MS } from '../../constants/api';
import { apiService } from '../../services/api.service';
import type { Recharge } from '../wallet/wallet.hook';

export function useRechargeHistory() {
  const [history, setHistory] = useState<Recharge[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setHistory(await apiService.get<Recharge[]>('/recharges'));
      setError('');
    } catch {
      setError('somethingWentWrong');
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    const timer = setInterval(() => refresh().catch(() => undefined), API_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  return { history, error };
}
