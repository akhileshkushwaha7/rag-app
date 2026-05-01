// "use client";

// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext<any>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Load session from localStorage (client-only, runs after hydration)
//   useEffect(() => {
//     try {
//       const session = localStorage.getItem("session_id");
//       const savedUser = localStorage.getItem("user");

//       if (session) setToken(session);
//       if (savedUser) setUser(JSON.parse(savedUser));
//     } catch (e) {
//       // localStorage unavailable (SSR guard)
//       console.warn("Could not read from localStorage", e);
//     } finally {
//       // Always unblock the UI — this is the critical line
//       setLoading(false);
//     }
//   }, []);

//   // ---------------- LOGIN ----------------
//   const login = async (email: string, password: string) => {
//     try {
//       const res = await fetch("https://rag-app-ai1w.onrender.com/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) return false;

//       const sessionId = data.session_id;
//       if (!sessionId) return false;

//       const userData = data.user ?? { email };

//       localStorage.setItem("session_id", sessionId);
//       localStorage.setItem("user", JSON.stringify(userData));

//       setToken(sessionId);
//       setUser(userData);

//       return true;
//     } catch {
//       return false;
//     }
//   };

//   // ---------------- SIGNUP ----------------
//   const signup = async (email: string, password: string) => {
//     try {
//       const res = await fetch("https://rag-app-ai1w.onrender.com/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();
//       return res.ok ? true : data.detail || false;
//     } catch {
//       return false;
//     }
//   };

//   // ---------------- LOGOUT ----------------
//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("session_id");
//     localStorage.removeItem("user");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, token, login, signup, logout, loading, isAuthenticated: !!token }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext<any>(null);

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

      // FIX: support both token formats the backend might return
      const sessionId = data.session_id || data.access_token || data.token;
      if (!sessionId) {
        console.error("No session token in response:", data);
        return false;
      }

      const userData = data.user ?? { email };

      // Write to localStorage FIRST, then update state
      localStorage.setItem("session_id", sessionId);
      localStorage.setItem("user", JSON.stringify(userData));

      // Batch state updates together
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

