// // "use client";

// // import { createContext, useContext, useState, useEffect } from "react";

// // const AuthContext = createContext<any>(null);

// // export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [user, setUser] = useState<any>(null);
// //   const [token, setToken] = useState<string | null>(null);

// //   // load from storage on refresh
// //   useEffect(() => {
// //     const savedToken = localStorage.getItem("token");
// //     const savedUser = localStorage.getItem("user");

// //     if (savedToken) setToken(savedToken);
// //     if (savedUser) setUser(JSON.parse(savedUser));
// //   }, []);

// //   // ---------------- LOGIN ----------------
// // // const login = async (email: string, password: string) => {
// // //   try {
// // //     const res = await fetch(
// // //       "https://rag-app-ai1w.onrender.com/auth/login",
// // //       {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify({ email, password }),
// // //       }
// // //     );

// // //     const data = await res.json();

// // //     if (!res.ok) {
// // //       console.log("Login failed:", data);
// // //       return false;
// // //     }

// // //     // 🔥 SUPPORT MULTIPLE BACKEND FORMATS
// // //     const token = data.token || data.access_token;
// // //     const user = data.user || { email };

// // //     if (!token) {
// // //       console.error("No token returned from backend");
// // //       return false;
// // //     }

// // //     setUser(user);
// // //     setToken(token);

// // //     localStorage.setItem("token", token);
// // //     localStorage.setItem("user", JSON.stringify(user));

// // //     return true;
// // //   } catch (err) {
// // //     console.error("Login error:", err);
// // //     return false;
// // //   }
// // // };
// // const login = async (email: string, password: string) => {
// //   try {
// //     const res = await fetch(
// //       "https://rag-app-ai1w.onrender.com/auth/login",
// //       {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email, password }),
// //       }
// //     );

// //     const data = await res.json();

// //     if (!res.ok) {
// //       console.log("Login failed:", data);
// //       return false;
// //     }

// //     const sessionId = data?.session_id;
// //     if (!sessionId) {
// //       console.error("No session_id returned from backend", data);
// //       return false;
// //     }

// //     const user = data?.user ?? { email };

// //     // ✅ FIRST persist to storage (prevents UI flicker timing issues)
// //     localStorage.setItem("session_id", sessionId);
// //     localStorage.setItem("user", JSON.stringify(user));

// //     // ✅ THEN update React state in a single batch-like flow
// //     setToken(sessionId);
// //     setUser(user);

// //     return true;
// //   } catch (err) {
// //     console.error("Login error:", err);
// //     return false;
// //   }
// // };

// //   // ---------------- SIGNUP (ADDED) ----------------

// // const signup = async (email: string, password: string) => {
// //   try {
// //     const res = await fetch(
// //       "https://rag-app-ai1w.onrender.com/auth/signup",
// //       {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email, password }),
// //       }
// //     );

// //     const data = await res.json();

// //     console.log("Signup response:", data); // 👈 DEBUG

// //     if (res.ok) {
// //       return true; // ✅ success
// //     } else {
// //       return data.detail || "Signup failed";
// //     }
// //   } catch (err) {
// //     console.error("Signup error:", err);
// //     return "Network error";
// //   }
// // };
// //   // ---------------- LOGOUT ----------------
// //   const logout = () => {
// //     setUser(null);
// //     setToken(null);

// //     localStorage.removeItem("token");
// //     localStorage.removeItem("user");
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         token,
// //         login,
// //         signup, // ✅ IMPORTANT ADDED
// //         logout,
// //         isAuthenticated: !!token,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => useContext(AuthContext);


// // "use client";

// // import { createContext, useContext, useState, useEffect } from "react";

// // const AuthContext = createContext<any>(null);

// // export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [user, setUser] = useState<any>(null);
// //   const [token, setToken] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   // ---------------- LOAD SESSION (FIXED) ----------------
// //   useEffect(() => {
// //     const savedToken = localStorage.getItem("session_id"); // ✅ FIXED
// //     const savedUser = localStorage.getItem("user");

// //     if (savedToken) setToken(savedToken);
// //     if (savedUser) setUser(JSON.parse(savedUser));

// //     setLoading(false);
// //   }, []);

// //   // ---------------- LOGIN ----------------
// //   const login = async (email: string, password: string) => {
// //     try {
// //       const res = await fetch(
// //         "https://rag-app-ai1w.onrender.com/auth/login",
// //         {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({ email, password }),
// //         }
// //       );

// //       const data = await res.json();

// //       if (!res.ok) {
// //         console.log("Login failed:", data);
// //         return false;
// //       }

// //       const sessionId = data?.session_id;
// //       if (!sessionId) {
// //         console.error("No session_id returned", data);
// //         return false;
// //       }

// //       const userData = data?.user ?? { email };

// //       // ✅ SINGLE SOURCE OF TRUTH
// //       localStorage.setItem("session_id", sessionId);
// //       localStorage.setItem("user", JSON.stringify(userData));

// //       setToken(sessionId);
// //       setUser(userData);

// //       return true;
// //     } catch (err) {
// //       console.error("Login error:", err);
// //       return false;
// //     }
// //   };

// //   // ---------------- SIGNUP ----------------
// //   const signup = async (email: string, password: string) => {
// //     try {
// //       const res = await fetch(
// //         "https://rag-app-ai1w.onrender.com/auth/signup",
// //         {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({ email, password }),
// //         }
// //       );

// //       const data = await res.json();

// //       if (res.ok) return true;

// //       return data.detail || "Signup failed";
// //     } catch (err) {
// //       return "Network error";
// //     }
// //   };

// //   // ---------------- LOGOUT ----------------
// //   const logout = () => {
// //     setUser(null);
// //     setToken(null);

// //     localStorage.removeItem("session_id"); // ✅ FIXED
// //     localStorage.removeItem("user");
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         token,
// //         login,
// //         signup,
// //         logout,
// //         loading, // ✅ IMPORTANT
// //         isAuthenticated: !!token,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => useContext(AuthContext);
// "use client";

// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext<any>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // ---------------- LOAD SESSION ----------------
//   useEffect(() => {
//     const session = localStorage.getItem("session_id");
//     const savedUser = localStorage.getItem("user");

//     if (session) setToken(session);
//     if (savedUser) setUser(JSON.parse(savedUser));

//     setLoading(false);
//   }, []);

//   // ---------------- LOGIN ----------------
//   const login = async (email: string, password: string) => {
//     try {
//       const res = await fetch(
//         "https://rag-app-ai1w.onrender.com/auth/login",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, password }),
//         }
//       );

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
//       const res = await fetch(
//         "https://rag-app-ai1w.onrender.com/auth/signup",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, password }),
//         }
//       );

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
//       value={{
//         user,
//         token,
//         login,
//         signup,
//         logout,
//         loading,
//         isAuthenticated: !!token,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage (client-only, runs after hydration)
  useEffect(() => {
    try {
      const session = localStorage.getItem("session_id");
      const savedUser = localStorage.getItem("user");

      if (session) setToken(session);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      // localStorage unavailable (SSR guard)
      console.warn("Could not read from localStorage", e);
    } finally {
      // Always unblock the UI — this is the critical line
      setLoading(false);
    }
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("https://rag-app-ai1w.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return false;

      const sessionId = data.session_id;
      if (!sessionId) return false;

      const userData = data.user ?? { email };

      localStorage.setItem("session_id", sessionId);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(sessionId);
      setUser(userData);

      return true;
    } catch {
      return false;
    }
  };

  // ---------------- SIGNUP ----------------
  const signup = async (email: string, password: string) => {
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
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
