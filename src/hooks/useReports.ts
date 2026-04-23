import api from "@/lib/axios"
import type { Report } from "@/types/report.types"
import { useEffect, useState } from "react"

const useReports = () => {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
 // fetch GET /reports on mount
 const fetchReports = async () => {
    try {
        setLoading(true)
        const res = await api.get('/reports') 
        setReports(res.data)
    } catch {
        setError('Failed to fetch reports. Please try again later.')
    } finally {
        setLoading(false)
    }
}

// call fetchReports on mount
useEffect(() => {
  fetchReports()
}, [])
  return { reports, loading, error, refetch: fetchReports }
}

export default useReports;