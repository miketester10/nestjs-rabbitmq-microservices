import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../main";

interface User {
  id: number;
  email: string;
  firstName: string;
  is2faEnabled: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuth: boolean) => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
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
        set({
          accessToken,
          refreshToken,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        queryClient.clear();
        useAuthStore.persist.clearStorage();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
