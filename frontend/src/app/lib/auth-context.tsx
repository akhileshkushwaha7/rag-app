"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext<any>(null);

// Helper to set a cookie
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem("session_id");
      const savedUser = localStorage.getItem("user");
      if (session) setToken(session);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.warn("localStorage error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("https://rag-app-ai1w.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return false;

      const sessionId = data.session_id || data.access_token || data.token;
      if (!sessionId) return false;

      const userData = data.user ?? { email };

      // Save to both localStorage AND cookie (cookie is needed for middleware)
      localStorage.setItem("session_id", sessionId);
      localStorage.setItem("user", JSON.stringify(userData));
      setCookie("session_id", sessionId);

      setToken(sessionId);
      setUser(userData);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("https://rag-app-ai1w.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return res.ok ? true : data.detail || false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    deleteCookie("session_id");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
