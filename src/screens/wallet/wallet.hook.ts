import { useCallback, useEffect, useState } from 'react';
import { API_POLL_INTERVAL_MS } from '../../constants/api';
import { apiService } from '../../services/api.service';

export type Recharge = {
  id: string; number: string; operator: string; amount: number;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string; updatedAt: string;
};

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const wallet = await apiService.get<{ balance: number }>('/wallet');
      setBalance(wallet.balance);
      setError('');
    } catch { setError('somethingWentWrong'); }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    const timer = setInterval(() => refresh().catch(() => undefined), API_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const submitRecharge = useCallback(async (number: string, operator: string, amount: string) => {
    setLoading(true);
    try {
      await apiService.post<Recharge>('/recharges', { number, operator, amount: Number(amount) }, {
        'Idempotency-Key': `${Date.now()}-${Math.random()}`,
      });
      await refresh();
      return true;
    } catch { setError('somethingWentWrong'); return false; }
    finally { setLoading(false); }
  }, [refresh]);

  return { balance, loading, error, submitRecharge };
}
