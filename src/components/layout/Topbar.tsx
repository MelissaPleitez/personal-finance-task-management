import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

  const pageConfig: Record<string, { title: string; subtitle: string; action?: string }> = {
    '/dashboard':    { title: 'Dashboard',    subtitle: 'Your financial overview' },
    '/accounts':     { title: 'Accounts',     subtitle: 'Manage your accounts',        action: 'Add Account' },
    '/transactions': { title: 'Transactions', subtitle: 'Track your money',            action: 'Add Transaction' },
    '/budgets':      { title: 'Budgets',      subtitle: 'Control your spending',       action: 'New Budget' },
    '/recurring':    { title: 'Recurring',    subtitle: 'Scheduled transactions',      action: 'New Recurring' },
    '/categories':   { title: 'Categories',   subtitle: 'Organise your transactions',  action: 'New Category' },
    '/reports':      { title: 'Reports',      subtitle: 'Financial insights',          action: 'Generate Report' },
    '/tasks':        { title: 'Tasks',        subtitle: 'Your financial to-dos',       action: 'New Task' },
    '/profile':      { title: 'Profile',      subtitle: 'Your account settings' },
  }
const Topbar = () => {
  const { pathname } = useLocation()
  // 1. get current page config
  const page = pageConfig[pathname]

  return (
    <header className="h-16 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-6">
      {/* left side — title and subtitle */}
      <div>
        <h2 className="text-lg font-semibold text-white">{page?.title || 'Page'}</h2>
        <p className="text-sm text-slate-500">{page?.subtitle || ''}</p>
      </div>
      {/* right side — action button (only if page has one) */}
      {page?.action && (
        <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
          {page.action}
        </Button>
      )}
    </header>
  )
}

export default Topbar