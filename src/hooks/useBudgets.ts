import api from "@/lib/axios";
import type { Budget } from "@/types/budget.types";
import { useEffect, useState } from "react";

const useBudgets = () => {
     // states: budgets, loading, error
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getBudgetStatus = (budget: Budget) => {
        const percentSpent = (Number(budget.spentAmount) / Number(budget.limitAmount)) * 100

        if (percentSpent < 60) return {
            bar:   'bg-green-500',
            text:  'text-green-400',
            badge: 'bg-green-500/20 text-green-400',
            label: 'Healthy',
        }

        if (percentSpent < 80) return {
            bar:   'bg-amber-500',
            text:  'text-amber-400',
            badge: 'bg-amber-500/20 text-amber-400',
            label: 'Warning',
        }

        return {
            bar:   'bg-red-500',
            text:  'text-red-400',
            badge: 'bg-red-500/20 text-red-400',
            label: 'Over budget',
        }
    
    }
    // fetch GET /budgets on mount
    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const response = await api.get<Budget[]>('/budgets');
            setBudgets(response.data);
        } catch {
            setError('Failed to fetch budgets.');
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
    return { budgets, loading, error, refetch: fetchBudgets, totalBudgeted, totalSpent, totalRemaining, getBudgetStatus}
}

export default useBudgets;