"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api"; // ✅ MUST have withCredentials: true

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /* =========================
     CHECK AUTH ON LOAD
  ========================= */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔥 Calls your backend cookie-based session
        await api.get("/auth/me");

        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /* =========================
     SIGNUP
  ========================= */
  const signup = async (email: string, password: string) => {
    try {
      await api.post("/auth/signup", { email, password });

      // optional: auto login after signup
      return await login(email, password);
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      return false;
    }
  };

  /* =========================
     LOGIN
  ========================= */
  const login = async (email: string, password: string) => {
    try {
      await api.post("/auth/login", { email, password });

      // 🔥 Cookie is now set by backend
      setIsAuthenticated(true);

      // 🔥 redirect works now
      router.push("/chat");

      return true;
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      return false;
    }
  };

  /* =========================
     LOGOUT
  ========================= */
const logout = async () => {
  try {
    await api.post("/auth/logout");

    // 🔥 IMPORTANT: clear frontend state
    setIsAuthenticated(false);

    // optional cleanup
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
};

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};