import { useState } from 'react'
import useReports from '@/hooks/useReports'
import StatCard from '@/components/shared/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/axios'
import { BarChart3, Plus, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { ReportType } from '@/types/report.types'

// ── schema ──
const createReportSchema = z.object({
  type:      z.nativeEnum(ReportType),
  title:     z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().min(1, 'End date is required'),
})

type CreateReportData = z.infer<typeof createReportSchema>

// ── report type badge colors ──
const reportTypeConfig = {
  [ReportType.MONTHLY]: { label: 'Monthly', class: 'bg-blue-500/20 text-blue-400' },
  [ReportType.YEARLY]:  { label: 'Yearly',  class: 'bg-violet-500/20 text-violet-400' },
  [ReportType.CUSTOM]:  { label: 'Custom',  class: 'bg-amber-500/20 text-amber-400' },
  [ReportType.WEEKLY]:  { label: 'Weekly',  class: 'bg-green-500/20 text-green-400' },
}

const ReportsPage = () => {
  const { reports, loading, error, refetch } = useReports()
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ReportType | 'all'>('all')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateReportData>({
    resolver: zodResolver(createReportSchema)
  })
  const onSubmit = async (data: CreateReportData) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start >= end) {
      setCreateError('Start date must be before end date');
      return;
    }
    try {
      setCreateError(null)
      await api.post('/reports', data);
      reset()
      setOpen(false)
      refetch()
    } catch {
      setCreateError('Failed to generate report, try again');
    }
  }

  // ── filter by tab ──
  const filteredReports = activeTab === 'all'
    ? reports
    : reports.filter(r => r.type === activeTab)

  // ── last report ──
  const lastReport = reports[0] ?? null

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading reports...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Reports"
          value={String(reports.length)}
          subtitle="All generated reports"
          icon={<BarChart3 size={20} className="text-violet-400" />}
        />
        <StatCard
          title="Last Generated"
          value={lastReport ? new Date(lastReport.createdAt).toLocaleDateString() : 'Never'}
          subtitle={lastReport?.title ?? 'No reports yet'}
          icon={<FileText size={20} className="text-blue-400" />}
        />
      </div>

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Reports ({reports.length})
        </h2>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-violet-500 hover:bg-violet-600 text-white"
        >
          <Plus size={16} className="mr-1" />
          Generate Report
        </Button>
      </div>

      {/* ── tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...Object.values(ReportType)] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-violet-500 text-white'
                : 'bg-navy-800 text-slate-400 hover:text-white border border-navy-700'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── empty state ── */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-navy-700 rounded-xl">
          <BarChart3 size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">No reports yet</p>
          <p className="text-slate-600 text-xs mt-1">Click "Generate Report" to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => {
            const config = reportTypeConfig[report.type]
            return (
              <div
                key={report.id}
                className="p-4 bg-navy-800 border border-navy-700 rounded-xl hover:border-navy-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <BarChart3 size={18} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{report.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {new Date(report.startDate).toLocaleDateString()} →{' '}
                        {new Date(report.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs border-0 ${config.class}`}>
                    {config.label}
                  </Badge>
                </div>

                {/* ── report data summary ── */}
                {report.data && (
                  <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-navy-700">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Income</p>
                      <p className="text-sm font-semibold text-green-400 flex items-center justify-center gap-1">
                        <TrendingUp size={12} />
                        ${Number(report.data.totalIncome ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Expenses</p>
                      <p className="text-sm font-semibold text-red-400 flex items-center justify-center gap-1">
                        <TrendingDown size={12} />
                        ${Number(report.data.totalExpenses ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className={`text-sm font-semibold flex items-center justify-center gap-1 ${
                        Number(report.data.netBalance) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${Number(report.data.netBalance ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-2">
                  Generated {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── generate report modal ── */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) { reset(); setCreateError(null) }
      }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Generate Report</DialogTitle>
          </DialogHeader>

          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{createError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
              <Label className="text-slate-300">Report Type</Label>
              <select
                className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm"
                {...register('type')}
              >
                <option value="">Select type...</option>
                <option value={ReportType.WEEKLY}>Weekly</option>
                <option value={ReportType.MONTHLY}>Monthly</option>
                <option value={ReportType.YEARLY}>Yearly</option>
                <option value={ReportType.CUSTOM}>Custom</option>
              </select>
              {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Title <span className="text-slate-500">(optional)</span></Label>
              <Input
                placeholder="e.g. February 2026 Report"
                className="bg-navy-900 border-navy-700 text-white"
                {...register('title')}
              />
            </div>

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
                {isSubmitting ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default ReportsPage