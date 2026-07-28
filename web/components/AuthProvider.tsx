"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/lib/types";
import {
  fetchCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from "@/lib/authApi";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  signup: (input: { username: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const loggedInUser = await apiLogin(input);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(
    async (input: { username: string; email: string; password: string }) => {
      const newUser = await apiSignup(input);
      setUser(newUser);
      return newUser;
    },
    []
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
