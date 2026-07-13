import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { loginUser, registerUser } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string, phone?: string, address?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await loginUser({ email, password });
          set({
            user: { id: data.user.id, full_name: data.user.full_name, email: data.user.email, phone: null, address: null, profileImage: null, role: data.user.role, isActive: true, isVerified: false, createdAt: new Date().toISOString() },
            token: data.access_token,
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
        }
      },
      register: async (full_name, email, password, phone, address) => {
        set({ isLoading: true, error: null });
        try {
          const data = await registerUser({ full_name, email, password, phone, address });
          set({
            user: { id: data.id, full_name: data.full_name, email: data.email, phone: phone || null, address: address || null, profileImage: null, role: 'customer', isActive: true, isVerified: false, createdAt: new Date().toISOString() },
            token: data.access_token,
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
        }
      },
      logout: () => set({ user: null, token: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    { name: 'fashion-dress-mart-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);