import { useState } from "react"
import useRecurring from "@/hooks/useRecurring"
import useAccounts from "@/hooks/useAccounts"
import useCategories from "@/hooks/useCategories"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import StatCard from '@/components/shared/StatCard'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import api from "@/lib/axios"
import { Plus, Trash2, Pencil, Repeat } from "lucide-react"
import { RecurrenceFrequency, type RecurringTransaction } from "@/types/recurring.types"
import { TransactionType } from "@/types/transaction.types"

const recurringSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.nativeEnum(RecurrenceFrequency),
  startDate: z.string().min(1, "Start date is required"),
  type: z.nativeEnum(TransactionType),
  endDate: z.string().optional(),
  accountId: z.number(),
  categoryId: z.number().optional(),
})

type RecurringFormData = z.infer<typeof recurringSchema>

const RecurringPage = () => {
  const { recurring, loading, error, refetch } = useRecurring()
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const isOpen = selectedRecurring !== undefined

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<RecurringFormData>({ resolver: zodResolver(recurringSchema) })

  const openCreate = () => {
    reset()
    setFormError(null)
    setSelectedRecurring(null)
  }

  const openEdit = (rt: RecurringTransaction) => {
  reset({
    description: rt.description ?? "",
    amount:      Number(rt.amount),
    type:        rt.type,                 
    frequency:   rt.frequency,
    startDate:   new Date(rt.startDate).toISOString().slice(0, 10),
    endDate:     rt.endDate 
                   ? new Date(rt.endDate).toISOString().slice(0, 10) 
                   : "",                     
    accountId:   rt.account?.id ?? 0,
    categoryId:  rt.category?.id,
  })
  setSelectedRecurring(rt)
}

  const closeModal = () => {
    setSelectedRecurring(undefined)
    reset()
  }

  const onSubmit = async (data: RecurringFormData) => {
    try {
      setFormError(null)
        console.log("Submitting data:", data, 'y el id', selectedRecurring?.id)
      if (selectedRecurring) {
        await api.put(`/recurring-transactions/${selectedRecurring.id}`, data)
      } else {
        await api.post('/recurring-transactions', data)
      }

      closeModal()
      refetch()
    } catch {
      setFormError("Something went wrong")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/recurring-transactions/${id}`)
      setDeletingId(null)
      refetch()
    } catch {
      setDeletingId(null)
    }
  }

  /* ───── STATS ───── */

  const total = recurring.reduce((acc, r) => acc + Number(r.amount), 0)

  const monthlyExpenses = recurring
      .filter(r => r.frequency === RecurrenceFrequency.MONTHLY && r.type === TransactionType.EXPENSE)
      .reduce((acc, r) => acc + Number(r.amount), 0)

  const monthlyIncome = recurring
      .filter(r => r.frequency === RecurrenceFrequency.MONTHLY && r.type === TransactionType.INCOME)
      .reduce((acc, r) => acc + Number(r.amount), 0)

  return (
    <div className="space-y-6">

      {/* ── stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Recurring" value={`$${total.toFixed(2)}`} icon={<Repeat size={20} />} />
        <StatCard title="Monthly Expenses" value={`$${monthlyExpenses.toFixed(2)}`} valueColor="text-red-400" />
        <StatCard title="Monthly Income"   value={`$${monthlyIncome.toFixed(2)}`}   valueColor="text-green-400" />
      </div>

      {/* header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Recurring Transactions</h1>
        <Button onClick={openCreate} size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
          <Plus size={16} className="mr-1" /> New Recurring Transaction
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Loading...</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && recurring.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
          <Repeat size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">No recurring transactions yet</p>
          <p className="text-slate-600 text-xs mt-1">Click "New Recurring Transaction" to get started</p>
        </div>
      )}

      {!loading && recurring.length > 0 && (
        <Table className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
  <TableHeader>
    <TableRow className="border-b border-navy-700">
      <TableHead className="text-slate-400">Description</TableHead>
      <TableHead className="text-slate-400">Amount</TableHead>
      <TableHead className="text-slate-400">Frequency</TableHead>
      <TableHead className="text-slate-400 text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {recurring.map(rt => {
      const isDeleting = deletingId === rt.id

      return (
        <TableRow
          key={rt.id}
          className="border-b border-navy-700 hover:bg-navy-700/50 transition-all"
        >
          <TableCell className="text-white font-medium">
            {rt.description ?? "-"}
          </TableCell>

          <TableCell className={rt.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}>
            {rt.type === TransactionType.INCOME ? '+' : '-'}${Number(rt.amount).toFixed(2)}
          </TableCell>

          <TableCell>
            <span className="px-2 py-1 text-xs rounded-md bg-navy-700 text-slate-300">
              {rt.frequency}
            </span>
          </TableCell>
          <TableCell>
            <button
              onClick={() => api.patch(`/recurring-transactions/${rt.id}`, { isActive: !rt.isActive }).then(refetch)}
              className={`px-2 py-1 rounded text-xs ${rt.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}
            >
              {rt.isActive ? 'Active' : 'Paused'}
            </button>
          </TableCell>

          <TableCell className="text-right">
            {!isDeleting ? (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEdit(rt)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-navy-700 transition-all"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => setDeletingId(rt.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(rt.id)}
                  className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Yes
                </button>

                <button
                  onClick={() => setDeletingId(null)}
                  className="px-2 py-1 rounded text-xs bg-navy-700 text-slate-400 hover:bg-navy-600"
                >
                  No
                </button>
              </div>
            )}
          </TableCell>
        </TableRow>
      )
    })}
  </TableBody>
</Table>
      )}

      {/* ── modal ── */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedRecurring ? "Edit Recurring" : "New Recurring"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Input className="bg-navy-900 border-navy-700 text-white" {...register("description")} />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Amount</Label>
              <Input type="number" className="bg-navy-900 border-navy-700 text-white" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Frequency</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("frequency")}>
                <option value="">Select...</option>
                <option value={RecurrenceFrequency.DAILY}>Daily</option>
                <option value={RecurrenceFrequency.WEEKLY}>Weekly</option>
                <option value={RecurrenceFrequency.MONTHLY}>Monthly</option>
                <option value={RecurrenceFrequency.YEARLY}>Yearly</option>
              </select>
               {errors.frequency && <p className="text-red-400 text-xs">{errors.frequency.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Type</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("type")}>
                <option value="">Select...</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.TRANSFER}>Transfer</option>
              </select>
               {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input type="date" className="bg-navy-900 border-navy-700 text-white" {...register('startDate')} />
                {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Input type="date" className="bg-navy-900 border-navy-700 text-white" {...register('endDate')} />
                {errors.endDate && <p className="text-red-400 text-xs">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Account</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("accountId", { valueAsNumber: true })}>
                <option value="">Select...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {errors.accountId && <p className="text-red-400 text-xs">{errors.accountId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("categoryId", {
                setValueAs: v => v === "" ? undefined : Number(v)
              })}>
                <option value="">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
                {errors.categoryId && <p className="text-red-400 text-xs">{errors.categoryId.message}</p>}
            </div>
            
            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-navy-700 text-slate-300" onClick={closeModal}>
                 Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                {isSubmitting ? "Saving..." : "Save"}
                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RecurringPage