import type { User } from '@/types/user.types';
import { persist } from 'zustand/middleware'
import { create } from 'zustand'

interface AuthStore {
    user: User | null,
    token: string | null,
    setUser: (user: User | null) => void,
    setToken: (token: string | null) => void,
    logout: () => void,
    setEmail: (email: string) => void,
    email: string | null,
}

const useAuthStore = create<AuthStore>()(
  persist(    //persist middleware = automatically save the Zustand state in the browser's localStorage and rehydrate it on page reloads.
    (set) => ({
      user: null,
      token: null,
      email: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, email: null}),
      setEmail: (email) => set({ email }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore;