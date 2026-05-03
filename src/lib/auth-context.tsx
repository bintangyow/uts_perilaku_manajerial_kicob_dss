"use client";

import React, { createContext, useContext, useCallback } from "react";
import { authClient } from "./auth-client";

interface AuthContextType {
  currentUser: { id: string; name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as Record<string, unknown>).role as string ?? "reviewer",
      }
    : null;

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) return { error: error.message || "Login gagal" };
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, _role?: string) => {
    const { error } = await authClient.signUp.email({ 
      email, 
      password, 
      name,
    });
    if (error) return { error: error.message || "Registrasi gagal" };
    return {};
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      // Mega-Purge: Hapus semua variasi cookie session yang mungkin ada
      const cookies = [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "kicob.session_token",
        "__Secure-kicob.session_token",
        "better-auth.csrf_token",
        "kicob.csrf_token"
      ];
      
      cookies.forEach(name => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      });

      // Clear local storage juga untuk jaga-jaga
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  const hasRole = useCallback(
    (role: string) => currentUser?.role === role,
    [currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isLoading: isPending,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
