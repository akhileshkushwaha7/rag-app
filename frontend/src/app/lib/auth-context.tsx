"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // load from storage on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ---------------- LOGIN ----------------
  const login = (data: any) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // ---------------- SIGNUP (ADDED) ----------------
  const signup = async (email: string, password: string) => {
    try {
      const res = await fetch(
        "https://rag-app-ai1w.onrender.com/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) return false;

      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup, // ✅ IMPORTANT ADDED
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
