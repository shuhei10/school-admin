import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

export type User = {
  id: string;
  email?: string;
  name?: string;
  role: "admin" | "instructor" | "student";
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void> | void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refresh = async () => {
    try {
      const res = await apiFetch<{ ok: true; user: User }>("/api/me", { method: "GET" });
      setUser(res.user);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      refresh,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}