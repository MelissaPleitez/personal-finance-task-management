import api from '@/lib/axios';
import type { Account } from '@/types/account.types';
import { useEffect, useState } from 'react'


const useAccounts = () => {

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = async () => {
      try {
        setLoading(true) 
        const response = await api.get<Account[]>('/accounts');
        setAccounts(response.data);
      } catch {
        setError('Failed to fetch accounts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    fetchAccounts();
  }, [])

  return { accounts, loading, error, refetch: fetchAccounts }
}

export default useAccounts