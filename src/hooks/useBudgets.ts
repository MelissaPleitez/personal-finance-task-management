import api from "@/lib/axios";
import type { Budget } from "@/types/budget.types";
import { useEffect, useState } from "react";

const useBudgets = () => {
     // states: budgets, loading, error
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // fetch GET /budgets on mount
    const fetchBudgets = async () => {
        try {
            setLoading(true);
            setError(null)
            const response = await api.get<Budget[]>('/budgets');
            setBudgets(response.data);
        } catch {
            setError('Failed to fetch budgets.');
            setBudgets([]);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchBudgets();
    }, [])

    const totalBudgeted  = budgets.reduce((sum, b) => sum + Number(b.limitAmount), 0)
    const totalSpent     = budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
    const totalRemaining = totalBudgeted - totalSpent
    return { budgets, loading, error, refetch: fetchBudgets, totalBudgeted, totalSpent, totalRemaining}
}

export default useBudgets;