import { createBrowserRouter, Navigate} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// protected pages
import DashboardPage from '@/pages/DashboardPage'
import AccountsPage from '@/pages/AccountsPage'
import BudgetsPage from '@/pages/BudgetsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import RecurringPage from '@/pages/RecurringPage'
import TasksPage from '@/pages/TasksPage'
import ProfilePage from '@/pages/ProfilePage'
import ReportsPage from '@/pages/ReportsPage'
import TransactionsPage from '@/pages/TransactionsPage'
import PublicRoute from './PublicRoute'

const router = createBrowserRouter([
  // redirect root to dashboard
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // public routes
  {
    element: <PublicRoute />,
    children: [
        {
            element: <AuthLayout />,
            children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            ]
        }
    ]
  },

  // protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard',    element: <DashboardPage /> },
          { path: '/accounts',     element: <AccountsPage /> },
          { path: '/budgets',      element: <BudgetsPage /> },
          { path: '/categories',   element: <CategoriesPage /> },
          { path: '/recurring',    element: <RecurringPage /> },
          { path: '/tasks',        element: <TasksPage /> },
          { path: '/profile',      element: <ProfilePage /> },
          { path: '/reports',      element: <ReportsPage /> },
          { path: '/transactions', element: <TransactionsPage /> },
        ]
      }
    ]
  }
])

export default router