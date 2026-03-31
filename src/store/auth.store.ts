import type { User } from '@/types/user.types';
import { persist } from 'zustand/middleware'
import { create } from 'zustand'

interface AuthStore {
    user: User | null,
    token: string | null,
    setUser: (user: User | null) => void,
    setToken: (token: string | null) => void,
    logout: () => void,
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore;