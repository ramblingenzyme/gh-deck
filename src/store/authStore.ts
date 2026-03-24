import { create } from "zustand";
import { clearToken } from "@/auth/token";

export type AuthStatus = "loading" | "idle" | "authed" | "error";

export interface AuthState {
  status: AuthStatus;
  sessionId: string | null;
  error: string | null;
  authSuccess: () => void;
  authFailed: () => void;
  logOut: () => void;
  authExpired: () => void;
  setError: (msg: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  sessionId: null,
  error: null,

  authSuccess() {
    set({ status: "authed", sessionId: crypto.randomUUID(), error: null });
  },

  authFailed() {
    set({ status: "idle", sessionId: null, error: null });
  },

  logOut() {
    clearToken();
    set({ status: "idle", sessionId: null, error: null });
  },

  authExpired() {
    clearToken();
    set({ status: "idle", sessionId: null, error: null });
  },

  setError(msg) {
    set({ status: "error", error: msg });
  },

  clearError() {
    set({ status: "idle", error: null });
  },
}));
