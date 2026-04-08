import useAccounts from '@/hooks/useAccounts'
import StatCard from '@/components/shared/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Wallet, PiggyBank, Building, Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/axios'
import { AccountType } from '@/types/account.types'
import type { Account } from '@/types/account.types'

const accountTypeConfig = {
  [AccountType.CASH]:    { label: 'Cash',    icon: Wallet,     color: 'bg-green-500/20 text-green-400' },
  [AccountType.BANK]:    { label: 'Bank',    icon: Building,   color: 'bg-blue-500/20 text-blue-400' },
  [AccountType.CREDIT]:  { label: 'Credit',  icon: CreditCard, color: 'bg-red-500/20 text-red-400' },
  [AccountType.SAVINGS]: { label: 'Savings', icon: PiggyBank,  color: 'bg-violet-500/20 text-violet-400' },
}

const accountSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  accountType: z.nativeEnum(AccountType, { message: 'Please select a type' }),
})

type AccountFormData = z.infer<typeof accountSchema>

const AccountsPage = () => {
  const { accounts, loading, error, refetch } = useAccounts()

  // ── modal state: null = closed, undefined = create mode, Account = edit mode
  const [selectedAccount, setSelectedAccount] = useState<Account | null | undefined>(undefined)
  const isOpen = selectedAccount !== undefined

  // ── delete confirmation state: holds the id being confirmed
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  })

  // ── open modal helpers
  const openCreate = () => {
    reset({ name: '', accountType: undefined })
    setFormError(null)
    setSelectedAccount(null)   // null = create mode, modal open
  }

  const openEdit = (account: Account) => {
    reset({ name: account.name, accountType: account.accountType })
    setFormError(null)
    setSelectedAccount(account) // account = edit mode, modal open
  }

  const closeModal = () => {
    setSelectedAccount(undefined) // undefined = closed
    reset()
  }

  // ── submit: create or update depending on selectedAccount
  const onSubmit = async (data: AccountFormData) => {
    try {
      setFormError(null)
      if (selectedAccount) {
        await api.put(`/accounts/${selectedAccount.id}`, data)
      } else {
        await api.post('/accounts', data)
      }
      closeModal()
      refetch()
    } catch {
      setFormError(selectedAccount ? 'Failed to update account.' : 'Failed to create account.')
    }
  }

  // ── delete
  const handleDelete = async (id: number) => {
    try {
      setDeleteError(null)
      await api.delete(`/accounts/${id}`)
      setDeletingId(null)
      refetch()
    } catch {
      setDeleteError('Failed to delete account.')
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading accounts...</p>
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
        <StatCard title="Total Accounts" value={String(accounts.length)} subtitle="Active accounts" />
        <StatCard
          title="Cash & Bank"
          value={String(accounts.filter(a => a.accountType === AccountType.CASH || a.accountType === AccountType.BANK).length)}
          subtitle="Liquid accounts"
          valueColor="text-green-400"
        />
        <StatCard
          title="Credit & Savings"
          value={String(accounts.filter(a => a.accountType === AccountType.CREDIT || a.accountType === AccountType.SAVINGS).length)}
          subtitle="Other accounts"
          valueColor="text-violet-400"
        />
      </div>

      {/* ── header row ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Accounts ({accounts.length})</h2>
        <Button onClick={openCreate} size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
          <Plus size={16} className="mr-1" /> Add Account
        </Button>
      </div>

      {deleteError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{deleteError}</p>
        </div>
      )}

      {/* ── accounts grid ── */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
          <CreditCard size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">No accounts yet</p>
          <p className="text-slate-600 text-xs mt-1">Click "Add Account" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const config = accountTypeConfig[account.accountType]
            const Icon = config.icon
            const isConfirming = deletingId === account.id

            return (
              <Card key={account.id} className="p-5 bg-navy-800 border-navy-700 hover:border-navy-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{account.name}</p>
                      <Badge className={`text-xs mt-0.5 ${config.color} border-0`}>{config.label}</Badge>
                    </div>
                  </div>

                  {/* ── action buttons ── */}
                  {!isConfirming ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-navy-700 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingId(account.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    /* ── inline delete confirmation ── */
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(account.id)}
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

                <div className="text-xs text-slate-500">
                  Created {new Date(account.createdAt).toLocaleDateString()}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── create / edit modal ── */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedAccount ? 'Edit Account' : 'Add New Account'}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Account Name</Label>
              <Input
                placeholder="e.g. Main Bank, Cash Wallet"
                className="bg-navy-900 border-navy-700 text-white"
                {...register('name')}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Account Type</Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('accountType')}
              >
                <option value="">Select type...</option>
                <option value={AccountType.CASH}>Cash</option>
                <option value={AccountType.BANK}>Bank</option>
                <option value={AccountType.CREDIT}>Credit Card</option>
                <option value={AccountType.SAVINGS}>Savings</option>
              </select>
              {errors.accountType && <p className="text-red-400 text-xs">{errors.accountType.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 border-navy-700 text-slate-300" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                {isSubmitting ? 'Saving...' : selectedAccount ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default AccountsPage