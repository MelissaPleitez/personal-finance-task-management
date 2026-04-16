import { useState } from 'react'
import useAccounts from '@/hooks/useAccounts'
import useTransactions from '@/hooks/useTransactions'
import useCategories from '@/hooks/useCategories'
import StatCard from '@/components/shared/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Transaction } from '@/types/transaction.types'
import { TransactionType } from '@/types/transaction.types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/axios'
import { Plus, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from 'lucide-react'

const groupTransactionsByMonth = (transactions: Transaction[]) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date)
    const key  = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)
}

const transactionSchema = z.object({
  description: z.string().optional(),
  amount:      z.number().positive('Amount must be positive'),
  type:        z.nativeEnum(TransactionType),
  date:        z.string().min(1, 'Date is required'),
  categoryId:  z.number().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const TransactionsPage = () => {
  const { accounts }   = useAccounts()
  const { categories } = useCategories()
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const { transactions, totals, loading, error, refetch } = useTransactions(selectedAccountId)

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null | undefined>(undefined)
  const isOpen = selectedTransaction !== undefined
  const [deletingId, setDeletingId]   = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [formError, setFormError]     = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<TransactionFormData>({ resolver: zodResolver(transactionSchema) })

  const openCreate = () => {
    reset()
    setFormError(null)
    setSelectedTransaction(null)
  }

  const openEdit = (transaction: Transaction) => {
    const dateString = typeof transaction.date === 'string' 
      ? (transaction.date as string).slice(0, 10) 
      : new Date(transaction.date as Date).toISOString().slice(0, 10)
    
    reset({
      description: transaction.description ?? '',
      amount:      Number(transaction.amount),
      type:        transaction.type,
      date:        dateString,
      categoryId:  transaction.category?.id ?? undefined,
    })
    setFormError(null)
    setSelectedTransaction(transaction)
  }

  const closeModal = () => {
    setSelectedTransaction(undefined)
    reset()
  }

  const onSubmit = async (data: TransactionFormData) => {
    if (!selectedAccountId) return
    try {
      setFormError(null)
      console.log("la data que mandamos update: ", data)
      if (selectedTransaction) {
        await api.put(`/transactions/${selectedTransaction.id}`, data)
      } else {
        await api.post('/transactions', {
          ...data,
          accountId: selectedAccountId
        })
      }
      closeModal()
      refetch()
    } catch {
      setFormError(selectedTransaction ? 'Failed to update transaction.' : 'Failed to create transaction.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleteError(null)
      await api.delete(`/transactions/${id}`)
      setDeletingId(null)
      refetch()
    } catch {
      setDeleteError('Failed to delete transaction.')
      setDeletingId(null)
    }
  }

  const grouped = groupTransactionsByMonth(transactions)

  return (
    <div className="space-y-6">

      {/* ── account selector + add button ── */}
      <div className="flex items-center gap-4">
        <select
          className="h-9 px-3 rounded-md bg-navy-800 border border-navy-700 text-white text-sm"
          value={selectedAccountId ?? ''}
          onChange={(e) => setSelectedAccountId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Select an account...</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        {selectedAccountId && (
          <Button size="sm" onClick={openCreate} className="bg-violet-500 hover:bg-violet-600 text-white">
            <Plus size={16} className="mr-1" /> Add Transaction
          </Button>
        )}
      </div>

      {/* ── stat cards ── */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Income"   value={`$${Number(totals.totalIncome).toFixed(2)}`}   valueColor="text-green-400" icon={<ArrowUpCircle size={20} className="text-green-400" />} />
          <StatCard title="Total Expenses" value={`$${Number(totals.totalExpenses).toFixed(2)}`} valueColor="text-red-400"   icon={<ArrowDownCircle size={20} className="text-red-400" />} />
          <StatCard
            title="Balance"
            value={`$${Number(totals.balance).toFixed(2)}`}
            valueColor={totals.balance >= 0 ? 'text-green-400' : 'text-red-400'}
          />
        </div>
      )}

      {deleteError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{deleteError}</p>
        </div>
      )}

      {/* ── no account selected ── */}
      {!selectedAccountId && (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
          <p className="text-slate-400 text-sm">Select an account to view transactions</p>
        </div>
      )}

      {/* ── loading / error ── */}
      {selectedAccountId && loading && <p className="text-slate-400">Loading transactions...</p>}
      {selectedAccountId && error   && <p className="text-red-400">{error}</p>}

      {/* ── transactions grouped by month ── */}
      {selectedAccountId && !loading && !error && (
        <>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
              <p className="text-slate-400 text-sm">No transactions yet</p>
              <p className="text-slate-600 text-xs mt-1">Click "Add Transaction" to get started</p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, monthTransactions]) => (
              <div key={month} className="space-y-2">

                {/* month header */}
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{month}</h3>
                  <div className="flex-1 h-px bg-navy-700" />
                  <span className="text-xs text-slate-500">{monthTransactions.length} transactions</span>
                </div>

                {/* transaction rows */}
                {monthTransactions.map(transaction => {
                  const isConfirming = deletingId === transaction.id

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 bg-navy-800 border border-navy-700 rounded-xl hover:border-navy-600 transition-all"
                    >
                      {/* type icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        transaction.type === TransactionType.INCOME ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {transaction.type === TransactionType.INCOME
                          ? <ArrowUpCircle size={18} className="text-green-400" />
                          : <ArrowDownCircle size={18} className="text-red-400" />
                        }
                      </div>

                      {/* description + date */}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {transaction.description ?? 'No description'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {/* category badge */}
                      {transaction.category && (
                        <Badge className="text-xs bg-navy-700 text-slate-300 border-0">
                          {transaction.category.name}
                        </Badge>
                      )}

                      {/* amount + actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className={`font-semibold text-sm ${
                          transaction.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                        </p>

                        {/* ── action buttons ── */}
                        {!isConfirming ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(transaction)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-navy-700 transition-all"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(transaction.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Delete?</span>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 rounded text-xs bg-navy-700 text-slate-400 hover:bg-navy-600 transition-all"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </>
      )}

      {/* ── create / edit modal ── */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label className="text-slate-300">Type</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register('type')}>
                <option value="">Select type...</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
              {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Amount</Label>
              <Input type="number" step="0.01" placeholder="0.00" className="bg-navy-900 border-navy-700 text-white" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description <span className="text-slate-500">(optional)</span></Label>
              <Input placeholder="e.g. Netflix, Salary..." className="bg-navy-900 border-navy-700 text-white" {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Date</Label>
              <Input type="date" className="bg-navy-900 border-navy-700 text-white" {...register('date')} />
              {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Category <span className="text-slate-500">(optional)</span></Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('categoryId', {
                  setValueAs: v => {
                    if (!v) return undefined
                    const num = Number(v)
                    return isNaN(num) ? undefined : num
                  }
                })}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 border-navy-700 text-slate-300" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                {isSubmitting
                  ? (selectedTransaction ? 'Saving...' : 'Adding...')
                  : (selectedTransaction ? 'Save Changes' : 'Add Transaction')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TransactionsPage