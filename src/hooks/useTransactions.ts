import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import type { Transaction } from '@/types/transaction.types'

interface TransactionTotals {
  totalIncome: number
  totalExpenses: number
  balance: number
}

const useTransactions = (accountId: number | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totals, setTotals] = useState<TransactionTotals | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // write the fetchTransactions function here
  const fetchTransactions = async () => {
    if (!accountId) return // early return if no accountId

    try {
      setLoading(true)
      const [transactionsRes, totalsRes] = await Promise.all([
        api.get(`/transactions/account/${accountId}`),
        api.get(`/transactions/account/${accountId}/total`),
      ])

        setTransactions(transactionsRes.data)
        setTotals(totalsRes.data)
    } catch {
      setError('Failed to fetch transactions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [accountId]) // refetch when accountId changes

  return { transactions, totals, loading, error, refetch: fetchTransactions }
}

export default useTransactions