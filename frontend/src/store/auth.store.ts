import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../main";
import { authApi } from "../api/auth.api";

interface User {
  id: number;
  email: string;
  firstName: string;
  is2faEnabled: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuth: boolean) => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: (options?: { onlyLocal: boolean }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setIsAuthenticated: (isAuth: boolean) => {
        set({ isAuthenticated: isAuth });
      },
      setUser: (user: User | null) => {
        set({
          user,
        });
      },
      setTokens: (accessToken: string, refreshToken?: string) => {
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
      },
      logout: async (options?: { onlyLocal: boolean }) => {
        const onlyLocal = options?.onlyLocal;
        try {
          if (!onlyLocal) await authApi.logout();
        } catch (error) {
          console.error(`Errore durante il logout: ${JSON.stringify(error)}`);
        } finally {
          // Aggiorna lo store
          set({
            user: null,
            isAuthenticated: false,
          });
          // Pulisce queryClient
          queryClient.clear();
          // Pulisce localStorage
          useAuthStore.persist.clearStorage(); // elimina "auth-storage" dal localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
