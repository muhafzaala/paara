import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "./api";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatar?: string;
  shopName?: string;
  verificationStatus?: string;
  city?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    shopName?: string;
    city?: string;
  }) => Promise<{ email: string; otp?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(email, password);
          const { token, user } = data;
          localStorage.setItem("paara_token", token);
          localStorage.setItem("paara_user", JSON.stringify(user));
          set({ user, token, isLoading: false, error: null });
        } catch (err: any) {
          const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await authApi.register(data);
          set({ isLoading: false, error: null });
          return { email: res.email, otp: res.otp };
        } catch (err: any) {
          const msg = err.response?.data?.message || "Registration failed. Please try again.";
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      verifyEmail: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.verifyEmailOtp(email, otp);
          const { token, user } = data;
          localStorage.setItem("paara_token", token);
          localStorage.setItem("paara_user", JSON.stringify(user));
          set({ user, token, isLoading: false, error: null });
        } catch (err: any) {
          const msg = err.response?.data?.message || "OTP verification failed.";
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      logout: () => {
        localStorage.removeItem("paara_token");
        localStorage.removeItem("paara_user");
        set({ user: null, token: null, error: null });
        window.location.href = "/";
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: "paara-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuth.persist.hasHydrated()
  );
  useEffect(() => {
    const unsub = useAuth.persist.onFinishHydration(() => setHasHydrated(true));
    if (useAuth.persist.hasHydrated()) setHasHydrated(true);
    return unsub;
  }, []);
  return hasHydrated;
};
