import { create } from "zustand";

type TemplateUser = {
  name?: string;
  email: string;
};

type AuthState = {
  user: TemplateUser | null;
  isAuthenticated: boolean;
  login: (user: TemplateUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
