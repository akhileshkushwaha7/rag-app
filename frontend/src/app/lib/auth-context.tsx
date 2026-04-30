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
// const login = async (email: string, password: string) => {
//   try {
//     const res = await fetch(
//       "https://rag-app-ai1w.onrender.com/auth/login",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       console.log("Login failed:", data);
//       return false;
//     }

//     // 🔥 SUPPORT MULTIPLE BACKEND FORMATS
//     const token = data.token || data.access_token;
//     const user = data.user || { email };

//     if (!token) {
//       console.error("No token returned from backend");
//       return false;
//     }

//     setUser(user);
//     setToken(token);

//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));

//     return true;
//   } catch (err) {
//     console.error("Login error:", err);
//     return false;
//   }
// };
const login = async (email: string, password: string) => {
  try {
    const res = await fetch("https://rag-app-ai1w.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) return false;

    // backend returns session_id
    const token = data.session_id;

    if (!token) return false;

    localStorage.setItem("token", token);
    setIsAuthenticated(true);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
  // ---------------- SIGNUP (ADDED) ----------------

const signup = async (email: string, password: string) => {
  try {
    const res = await fetch(
      "https://rag-app-ai1w.onrender.com/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    console.log("Signup response:", data); // 👈 DEBUG

    if (res.ok) {
      return true; // ✅ success
    } else {
      return data.detail || "Signup failed";
    }
  } catch (err) {
    console.error("Signup error:", err);
    return "Network error";
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
