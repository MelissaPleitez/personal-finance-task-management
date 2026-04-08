import useAccounts from '@/hooks/useAccounts'
import useBudgets from '@/hooks/useBudgets'
import useCategories from '@/hooks/useCategories'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowDownCircle, ArrowUpCircle, Plus, Target } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/axios'
import { BudgetPeriod } from '@/types/budget.types'
import type { Budget } from '@/types/budget.types'

// ── budget status helper ──
const getBudgetStatus = (budget: Budget) => {
  const percentSpent = (Number(budget.spentAmount) / Number(budget.limitAmount)) * 100

  if (percentSpent < 60) return {
    bar:     'bg-green-500',
    text:    'text-green-400',
    badge:   'bg-green-500/20 text-green-400',
    label:   'Healthy',
    percent: percentSpent,
  }

  if (percentSpent < 80) return {
    bar:     'bg-amber-500',
    text:    'text-amber-400',
    badge:   'bg-amber-500/20 text-amber-400',
    label:   'Warning',
    percent: percentSpent,
  }

  return {
    bar:     'bg-red-500',
    text:    'text-red-400',
    badge:   'bg-red-500/20 text-red-400',
    label:   'Over budget',
    percent: percentSpent,
  }
}

// ── schema ──
const createBudgetSchema = z.object({
  name:           z.string().min(1, 'Name is required'),
  limitAmount:    z.number().positive('Must be positive'),
  period:         z.nativeEnum(BudgetPeriod),
  startDate:      z.string().min(1, 'Start date is required'),
  endDate:        z.string().min(1, 'End date is required'),
  alertEnabled:   z.boolean().optional(),
  alertThreshPct: z.number().min(0).max(100).optional(),
  accountId:      z.number(),
  categoryId:     z.number().optional(),
})

type CreateBudgetFormData = z.infer<typeof createBudgetSchema>

const BudgetsPage = () => {
  const { budgets, loading, error, refetch, totalBudgeted, totalSpent, totalRemaining } = useBudgets()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema)
  })

  const onSubmit = async (data: CreateBudgetFormData) => {
    try {
      setCreateError(null)
      await api.post('/budgets', data)
      reset()
      setOpen(false)
      refetch()
    } catch {
      setCreateError('Failed to create budget')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading budgets...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Budgeted"
          value={`$${totalBudgeted.toFixed(2)}`}
          valueColor="text-blue-400"
          icon={<Target size={20} className="text-blue-400" />}
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          valueColor="text-red-400"
          icon={<ArrowDownCircle size={20} className="text-red-400" />}
        />
        <StatCard
          title="Remaining"
          value={`$${totalRemaining.toFixed(2)}`}
          valueColor={totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}
          icon={<ArrowUpCircle size={20} className={totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'} />}
        />
      </div>

      {/* ── header row ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Your Budgets ({budgets.length})
        </h2>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-violet-500 hover:bg-violet-600 text-white"
        >
          <Plus size={16} className="mr-1" />
          New Budget
        </Button>
      </div>

      {/* ── empty state ── */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
          <Target size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">No budgets yet</p>
          <p className="text-slate-600 text-xs mt-1">Click "New Budget" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const status = getBudgetStatus(budget)

            return (
              <Card key={budget.id} className="p-5 bg-navy-800 border-navy-700">
                {/* header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">{budget.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{budget.period}</p>
                  </div>
                  <Badge className={`text-xs border-0 ${status.badge}`}>
                    {status.label}
                  </Badge>
                </div>

                {/* progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">
                      ${Number(budget.spentAmount).toFixed(2)} spent
                    </span>
                    <span className={status.text}>
                      {status.percent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(status.percent, 100)}
                    className="h-2 bg-navy-700"
                  />
                </div>

                {/* footer */}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Limit: ${Number(budget.limitAmount).toFixed(2)}</span>
                  <span className={(Number(budget.limitAmount) - Number(budget.spentAmount)) >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${(Number(budget.limitAmount) - Number(budget.spentAmount)).toFixed(2)} left
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── create budget modal ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">New Budget</DialogTitle>
          </DialogHeader>

          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{createError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* name */}
            <div className="space-y-2">
              <Label className="text-slate-300">Budget Name</Label>
              <Input
                placeholder="e.g. Monthly Food, Transport"
                className="bg-navy-900 border-navy-700 text-white"
                {...register('name')}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            {/* limit amount */}
            <div className="space-y-2">
              <Label className="text-slate-300">Limit Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-navy-900 border-navy-700 text-white"
                {...register('limitAmount', { valueAsNumber: true })}
              />
              {errors.limitAmount && <p className="text-red-400 text-xs">{errors.limitAmount.message}</p>}
            </div>

            {/* period */}
            <div className="space-y-2">
              <Label className="text-slate-300">Period</Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('period')}
              >
                <option value="">Select period...</option>
                <option value={BudgetPeriod.WEEKLY}>Weekly</option>
                <option value={BudgetPeriod.MONTHLY}>Monthly</option>
                <option value={BudgetPeriod.YEARLY}>Yearly</option>
              </select>
              {errors.period && <p className="text-red-400 text-xs">{errors.period.message}</p>}
            </div>

            {/* dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input
                  type="date"
                  className="bg-navy-900 border-navy-700 text-white"
                  {...register('startDate')}
                />
                {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Input
                  type="date"
                  className="bg-navy-900 border-navy-700 text-white"
                  {...register('endDate')}
                />
                {errors.endDate && <p className="text-red-400 text-xs">{errors.endDate.message}</p>}
              </div>
            </div>

            {/* account */}
            <div className="space-y-2">
              <Label className="text-slate-300">Account</Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('accountId', { valueAsNumber: true })}
              >
                <option value="">Select account...</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
              {errors.accountId && <p className="text-red-400 text-xs">{errors.accountId.message}</p>}
            </div>

            {/* category */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category <span className="text-slate-500">(optional)</span></Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('categoryId', { setValueAs: v => v === '' ? undefined : Number(v)  })}
              >
                <option value="">All categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* alert */}
            <div className="space-y-2">
              <Label className="text-slate-300">Alert Threshold <span className="text-slate-500">(optional)</span></Label>
              <div className="flex gap-3 items-center">
                <input
                  type="checkbox"
                  {...register('alertEnabled')}
                  className="w-4 h-4 accent-violet-500"
                />
                <span className="text-sm text-slate-400">Enable alert at</span>
                <Input
                  type="number"
                  placeholder="80"
                  className="w-20 bg-navy-900 border-navy-700 text-white text-sm"
                  {...register('alertThreshPct', { valueAsNumber: true })}
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-navy-700 text-slate-300"
                onClick={() => { setOpen(false); reset() }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default BudgetsPage