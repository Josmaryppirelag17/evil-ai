"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const SESSION_KEY = "vil_chat_session";

export function setPendingSessionId(id: string | null) {
  if (id && typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, id);
  }
}

export async function syncCurrentSession(): Promise<void> {
  if (typeof window === "undefined") return;
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return;
  try {
    await fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  } catch {}
}

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  lastName: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, name: string, lastName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const syncSession = useCallback(async () => {
    await syncCurrentSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchSession();
        await syncCurrentSession();
        return { success: true };
      }
      return { success: false, error: data.error ?? "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, [fetchSession]);

  const register = useCallback(async (email: string, username: string, name: string, lastName: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, name, lastName, password }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error ?? "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[auth] logout error:", err);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, syncSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
