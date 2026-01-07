import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        // Store tokens in localStorage for axios interceptor
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        set({
          user,
          tokens,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
