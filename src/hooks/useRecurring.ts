import api from "@/lib/axios"
import type { RecurringTransaction } from "@/types/recurring.types"
import { useEffect, useState } from "react"

    const useRecurring = () => {
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  // fetch GET /recurring-transactions
    const fetchRecurring = async () => {
        try {
            setLoading(true)
            const res = await api.get('/recurring-transactions')
            setRecurring(res.data)
        } catch {
            setError('Failed to fetch recurring transactions. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

  // call fetchRecurring on mount
  useEffect(() => {
    fetchRecurring()
  }, [])

  return { recurring, loading, error, refetch: fetchRecurring }
}

export default useRecurring;