import { Card } from '@/components/ui/card'

interface StatCardProps {
  title: string        // e.g. "Total Balance"
  value: string        // e.g. "$3,240.00"
  subtitle?: string    // e.g. "↑ +12% vs last month"
  icon?: React.ReactNode  // optional icon
  valueColor?: string  // e.g. "text-green-400" or "text-red-400"
}

const StatCard = ({ title, value, subtitle, icon, valueColor }: StatCardProps) => {
  return (
    // a card with:
    <Card className="relative p-4 bg-navy-800 border-navy-700">
      {/* optional icon top right */}
      {icon && (
        <div className="absolute top-2 right-2 text-slate-400">
          {icon}
        </div>
      )}
      {/* title at top (small, muted) */}
      <p className="text-sm text-slate-500">{title}</p>
      {/* value in middle (large, bold) */}
      <p className={`text-2xl font-bold ${valueColor || 'text-white'}`}>
        {value}
      </p>
      {/* optional subtitle at bottom (small) */}
      {subtitle && (
        <p className="text-sm text-slate-400">{subtitle}</p>
      )}
    </Card>

  )
}

export default StatCard;