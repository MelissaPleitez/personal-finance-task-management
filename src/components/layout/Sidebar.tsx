import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CreditCard, ArrowLeftRight, Target, RefreshCw, Tag, BarChart3, CheckSquare, LogOut } from 'lucide-react'
import useAuthStore from '@/store/auth.store'

const navItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Accounts', path: '/accounts', icon: CreditCard },
    ]
  },
  {
    section: 'Money',
    items: [
      { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
      { label: 'Budgets', path: '/budgets', icon: Target },
      { label: 'Recurring', path: '/recurring', icon: RefreshCw },
      { label: 'Categories', path: '/categories', icon: Tag },
    ]
  },
  {
    section: 'Insights',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart3 },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    ]
  },
]

const Sidebar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  console.log('user en sidebar: ', user)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-navy-800 border-r border-navy-700 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-xl font-bold text-white">
          <span className="text-violet-500">V</span>ault
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Finance Manager</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.section}>
            {/* Section label */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              {section.section}
            </p>

            {/* Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon                    // ← capital I
                const isActive = pathname === item.path   // ← check if current page

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-navy-700'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-navy-700">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-all"
        >
          {/* Avatar with initials */}
          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.profile?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">
              {user?.profile?.name ?? 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all mt-1"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign out</span>
        </button>
      </div>

    </aside>
  )
}

export default Sidebar