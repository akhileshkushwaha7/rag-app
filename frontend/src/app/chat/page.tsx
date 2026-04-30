// // // "use client";

// // // import {
// // //   useState,
// // //   useEffect,
// // //   FormEvent,
// // //   memo,
// // // } from "react";
// // // import { useRouter } from "next/navigation";
// // // import { useAuth } from "@/app/lib/auth-context";
// // // import { api } from "@/app/lib/api";
// // // import axios from "axios";
// // // import TextareaAutosize from "react-textarea-autosize";
// // // import { Button } from "@/app/components/ui/button";
// // // import {
// // //   Send,
// // //   LogOut,
// // //   MessageSquarePlus,
// // //   PanelLeftOpen,
// // //   PanelLeftClose,
// // //   Trash2,
// // // } from "lucide-react";
// // // import { motion } from "framer-motion";

// // // // ---------------- Types ----------------
// // // interface Message {
// // //   role: "user" | "assistant";
// // //   message: string;
// // // }

// // // interface ChatSession {
// // //   id: string;
// // //   title: string;
// // // }

// // // // ---------------- Sidebar ----------------
// // // const Sidebar = memo(function Sidebar({
// // //   chatSessions,
// // //   activeSessionId,
// // //   onNewChat,
// // //   onSelectSession,
// // //   onLogout,
// // //   isCollapsed,
// // //   onToggleCollapse,
// // //   onDeleteSession,
// // // }: any) {
// // //   return (
// // //     <motion.div
// // //       animate={{ width: isCollapsed ? 64 : 280 }}
// // //       className="bg-gray-950 border-r border-gray-800 flex flex-col"
// // //     >
// // //       <div className="p-4 border-b border-gray-800 flex justify-between">
// // //         {!isCollapsed && (
// // //           <Button onClick={onNewChat}>
// // //             <MessageSquarePlus size={16} /> New Chat
// // //           </Button>
// // //         )}
// // //         <Button onClick={onToggleCollapse}>
// // //           {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
// // //         </Button>
// // //       </div>

// // //       <div className="flex-1 overflow-y-auto p-2">
// // //         {chatSessions.map((s: ChatSession) => (
// // //           <div key={s.id} className="group relative">
// // //             <Button
// // //               variant={activeSessionId === s.id ? "secondary" : "ghost"}
// // //               className="w-full justify-start"
// // //               onClick={() => onSelectSession(s.id)}
// // //             >
// // //               {isCollapsed ? s.title.charAt(0) : s.title}
// // //             </Button>

// // //             <Button
// // //               size="icon"
// // //               variant="ghost"
// // //               className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
// // //               onClick={(e: any) => {
// // //                 e.stopPropagation();
// // //                 onDeleteSession(s.id);
// // //               }}
// // //             >
// // //               <Trash2 size={12} />
// // //             </Button>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       <div className="p-4 border-t border-gray-800">
// // //         <Button onClick={onLogout}>
// // //           <LogOut /> Logout
// // //         </Button>
// // //       </div>
// // //     </motion.div>
// // //   );
// // // });

// // // // ---------------- Chat Page ----------------
// // // export default function ChatPage() {
// // //   const [messages, setMessages] = useState<Message[]>([]);
// // //   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
// // //   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
// // //   const [input, setInput] = useState("");
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// // //   const router = useRouter();
// // //   const { logout, isAuthenticated, isLoading: authLoading } = useAuth();

// // //   const getToken = () => {
// // //     if (typeof window === "undefined") return null;
// // //     return localStorage.getItem("token");
// // //   };

// // //   // ---------------- FIXED AUTH GUARD ----------------
// // //   useEffect(() => {
// // //     if (authLoading) return; // ⛔ wait until auth is ready

// // //     const token = getToken();

// // //     if (!token) {
// // //       router.replace("/auth/login");
// // //     }
// // //   }, [authLoading, router]);

// // //   // ---------------- Load Sessions ----------------
// // //   useEffect(() => {
// // //     const fetchChatSessions = async () => {
// // //       try {
// // //         const token = getToken();
// // //         if (!token) return;

// // //         const res = await api.get("/api/chat/sessions", {
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //           },
// // //         });

// // //         setChatSessions(res.data);
// // //       } catch (err) {
// // //         if (axios.isAxiosError(err) && err.response?.status === 401) {
// // //           router.replace("/auth/login");
// // //         }
// // //       }
// // //     };

// // //     if (!authLoading) fetchChatSessions();
// // //   }, [authLoading, router]);

// // //   // ---------------- Load Messages ----------------
// // //   const fetchSessionMessages = async (sessionId: string) => {
// // //     try {
// // //       setActiveSessionId(sessionId);

// // //       const token = getToken();
// // //       if (!token) return;

// // //       const res = await api.get(`/chat/history/${sessionId}`, {
// // //         headers: {
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       });

// // //       setMessages(res.data);
// // //     } catch {
// // //       setMessages([
// // //         { role: "assistant", message: "⚠️ Error loading chat history" },
// // //       ]);
// // //     }
// // //   };

// // //   // ---------------- Send Message ----------------
// // //   const handleSubmit = async (e: FormEvent) => {
// // //     e.preventDefault();

// // //     if (!input.trim() || isLoading) return;

// // //     const token = getToken();
// // //     if (!token) {
// // //       router.replace("/auth/login");
// // //       return;
// // //     }

// // //     const userMsg: Message = { role: "user", message: input };
// // //     setMessages((prev) => [...prev, userMsg]);

// // //     const sessionId = activeSessionId || crypto.randomUUID();

// // //     setInput("");
// // //     setIsLoading(true);

// // //     try {
// // //       const res = await api.post(
// // //         "/api/chat",
// // //         {
// // //           query: input,
// // //           session_id: sessionId,
// // //         },
// // //         {
// // //           headers: {
// // //             Authorization: `Bearer ${token}`,
// // //           },
// // //         }
// // //       );

// // //       setMessages((prev) => [
// // //         ...prev,
// // //         { role: "assistant", message: res.data.response },
// // //       ]);

// // //       if (!activeSessionId) {
// // //         setActiveSessionId(sessionId);
// // //         setChatSessions((prev) => [
// // //           { id: sessionId, title: input },
// // //           ...prev,
// // //         ]);
// // //       }
// // //     } catch {
// // //       setMessages((prev) => [
// // //         ...prev,
// // //         { role: "assistant", message: "⚠️ Error generating response" },
// // //       ]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   // ---------------- Logout ----------------
// // //   const handleLogout = () => {
// // //     logout();
// // //     localStorage.removeItem("token");
// // //     router.replace("/auth/login");
// // //   };

// // //   return (
// // //     <div className="flex h-screen bg-black text-white">
// // //       <Sidebar
// // //         chatSessions={chatSessions}
// // //         activeSessionId={activeSessionId}
// // //         onNewChat={() => setMessages([])}
// // //         onSelectSession={fetchSessionMessages}
// // //         onLogout={handleLogout}
// // //         isCollapsed={isSidebarCollapsed}
// // //         onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
// // //         onDeleteSession={() => {}}
// // //       />

// // //       {/* Chat Area */}
// // //       <div className="flex-1 flex flex-col">
// // //         <div className="flex-1 overflow-y-auto p-4">
// // //           {messages.map((m, i) => (
// // //             <div key={i} className="mb-2">
// // //               <b>{m.role}:</b> {m.message}
// // //             </div>
// // //           ))}
// // //         </div>

// // //         <form onSubmit={handleSubmit} className="p-4 flex gap-2">
// // //           <TextareaAutosize
// // //             value={input}
// // //             onChange={(e) => setInput(e.target.value)}
// // //             className="flex-1 bg-gray-900 p-2 rounded"
// // //           />
// // //           <Button type="submit" disabled={isLoading}>
// // //             <Send />
// // //           </Button>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // "use client";

// // import { useState, useEffect, FormEvent, memo } from "react";
// // import { useRouter } from "next/navigation";
// // import { useAuth } from "@/app/lib/auth-context";
// // import { api } from "@/app/lib/api";
// // import axios from "axios";
// // import TextareaAutosize from "react-textarea-autosize";
// // import { Button } from "@/app/components/ui/button";
// // import {
// //   Send,
// //   LogOut,
// //   MessageSquarePlus,
// //   PanelLeftOpen,
// //   PanelLeftClose,
// //   Trash2,
// // } from "lucide-react";
// // import { motion } from "framer-motion";

// // // ---------------- Types ----------------
// // interface Message {
// //   role: "user" | "assistant";
// //   message: string;
// // }

// // interface ChatSession {
// //   id: string;
// //   title: string;
// // }

// // // ---------------- Sidebar ----------------
// // const Sidebar = memo(function Sidebar({
// //   chatSessions,
// //   activeSessionId,
// //   onNewChat,
// //   onSelectSession,
// //   onLogout,
// //   isCollapsed,
// //   onToggleCollapse,
// //   onDeleteSession,
// // }: any) {
// //   return (
// //     <motion.div
// //       animate={{ width: isCollapsed ? 64 : 280 }}
// //       className="bg-gray-950 border-r border-gray-800 flex flex-col"
// //     >
// //       <div className="p-4 border-b border-gray-800 flex justify-between">
// //         {!isCollapsed && (
// //           <Button onClick={onNewChat}>
// //             <MessageSquarePlus size={16} /> New Chat
// //           </Button>
// //         )}
// //         <Button onClick={onToggleCollapse}>
// //           {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
// //         </Button>
// //       </div>

// //       <div className="flex-1 overflow-y-auto p-2">
// //         {chatSessions.map((s: ChatSession) => (
// //           <div key={s.id} className="group relative">
// //             <Button
// //               variant={activeSessionId === s.id ? "secondary" : "ghost"}
// //               className="w-full justify-start"
// //               onClick={() => onSelectSession(s.id)}
// //             >
// //               {isCollapsed ? s.title.charAt(0) : s.title}
// //             </Button>

// //             <Button
// //               size="icon"
// //               variant="ghost"
// //               className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
// //               onClick={(e: any) => {
// //                 e.stopPropagation();
// //                 onDeleteSession(s.id);
// //               }}
// //             >
// //               <Trash2 size={12} />
// //             </Button>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="p-4 border-t border-gray-800">
// //         <Button onClick={onLogout}>
// //           <LogOut /> Logout
// //         </Button>
// //       </div>
// //     </motion.div>
// //   );
// // });

// // // ---------------- Chat Page ----------------
// // export default function ChatPage() {
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
// //   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
// //   const [input, setInput] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// //   // 🔥 NEW: prevents flicker
// //   const [ready, setReady] = useState(false);

// //   const router = useRouter();
// //   const { logout, isLoading: authLoading } = useAuth();

// //   // ---------------- FIXED TOKEN ----------------
// //   const getToken = () => {
// //     if (typeof window === "undefined") return null;
// //     return localStorage.getItem("session_id"); // ✅ unified key
// //   };

// //   // ---------------- AUTH GUARD (FIXED) ----------------
// //   useEffect(() => {
// //     if (authLoading) return;

// //     const token = getToken();

// //     setReady(true);

// //     if (!token) {
// //       router.replace("/auth/login");
// //     }
// //   }, [authLoading, router]);

// //   // ---------------- LOAD SESSIONS ----------------
// //   useEffect(() => {
// //     const fetchChatSessions = async () => {
// //       try {
// //         const token = getToken();
// //         if (!token) return;

// //         const res = await api.get("/api/chat/sessions", {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });

// //         setChatSessions(res.data);
// //       } catch (err) {
// //         if (axios.isAxiosError(err) && err.response?.status === 401) {
// //           router.replace("/auth/login");
// //         }
// //       }
// //     };

// //     if (!authLoading) fetchChatSessions();
// //   }, [authLoading, router]);

// //   // ---------------- LOAD MESSAGES ----------------
// //   const fetchSessionMessages = async (sessionId: string) => {
// //     try {
// //       setActiveSessionId(sessionId);

// //       const token = getToken();
// //       if (!token) return;

// //       const res = await api.get(`/chat/history/${sessionId}`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });

// //       setMessages(res.data);
// //     } catch {
// //       setMessages([
// //         { role: "assistant", message: "⚠️ Error loading chat history" },
// //       ]);
// //     }
// //   };

// //   // ---------------- SEND MESSAGE ----------------
// //   const handleSubmit = async (e: FormEvent) => {
// //     e.preventDefault();

// //     if (!input.trim() || isLoading) return;

// //     const token = getToken();
// //     if (!token) {
// //       router.replace("/auth/login");
// //       return;
// //     }

// //     const userMsg: Message = { role: "user", message: input };
// //     setMessages((prev) => [...prev, userMsg]);

// //     const sessionId = activeSessionId || crypto.randomUUID();

// //     setInput("");
// //     setIsLoading(true);

// //     try {
// //       const res = await api.post(
// //         "/api/chat",
// //         {
// //           query: input,
// //           session_id: sessionId,
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       setMessages((prev) => [
// //         ...prev,
// //         { role: "assistant", message: res.data.response },
// //       ]);

// //       if (!activeSessionId) {
// //         setActiveSessionId(sessionId);
// //         setChatSessions((prev) => [
// //           { id: sessionId, title: input },
// //           ...prev,
// //         ]);
// //       }
// //     } catch {
// //       setMessages((prev) => [
// //         ...prev,
// //         { role: "assistant", message: "⚠️ Error generating response" },
// //       ]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // ---------------- LOGOUT FIXED ----------------
// //   const handleLogout = () => {
// //     logout();
// //     localStorage.removeItem("session_id"); // ✅ FIXED
// //     localStorage.removeItem("user");
// //     router.replace("/auth/login");
// //   };

// //   // ---------------- 🔥 ANTI-FLICKER GATE ----------------
// //   if (!ready || authLoading) {
// //     return (
// //       <div className="text-white p-4 bg-black h-screen">
// //         Loading...
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex h-screen bg-black text-white">
// //       <Sidebar
// //         chatSessions={chatSessions}
// //         activeSessionId={activeSessionId}
// //         onNewChat={() => setMessages([])}
// //         onSelectSession={fetchSessionMessages}
// //         onLogout={handleLogout}
// //         isCollapsed={isSidebarCollapsed}
// //         onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
// //         onDeleteSession={() => {}}
// //       />

// //       {/* Chat Area */}
// //       <div className="flex-1 flex flex-col">
// //         <div className="flex-1 overflow-y-auto p-4">
// //           {messages.map((m, i) => (
// //             <div key={i} className="mb-2">
// //               <b>{m.role}:</b> {m.message}
// //             </div>
// //           ))}
// //         </div>

// //         <form onSubmit={handleSubmit} className="p-4 flex gap-2">
// //           <TextareaAutosize
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             className="flex-1 bg-gray-900 p-2 rounded"
// //           />
// //           <Button type="submit" disabled={isLoading}>
// //             <Send />
// //           </Button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { useState, useEffect, FormEvent, memo } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/lib/auth-context";
// import { api } from "@/app/lib/api";
// import axios from "axios";
// import TextareaAutosize from "react-textarea-autosize";
// import { Button } from "@/app/components/ui/button";
// import {
//   Send,
//   LogOut,
//   MessageSquarePlus,
//   PanelLeftOpen,
//   PanelLeftClose,
//   Trash2,
//   Paperclip,
// } from "lucide-react";
// import { motion } from "framer-motion";

// // ---------------- Types ----------------
// interface Message {
//   role: "user" | "assistant";
//   message: string;
// }

// interface ChatSession {
//   id: string;
//   title: string;
// }

// // ---------------- Sidebar ----------------
// const Sidebar = memo(function Sidebar({
//   chatSessions,
//   activeSessionId,
//   onNewChat,
//   onSelectSession,
//   onLogout,
//   isCollapsed,
//   onToggleCollapse,
//   onDeleteSession,
// }: any) {
//   return (
//     <motion.div
//       animate={{ width: isCollapsed ? 64 : 280 }}
//       className="bg-gray-950 border-r border-gray-800 flex flex-col"
//     >
//       <div className="p-4 border-b border-gray-800 flex justify-between">
//         {!isCollapsed && (
//           <Button onClick={onNewChat}>
//             <MessageSquarePlus size={16} /> New Chat
//           </Button>
//         )}
//         <Button onClick={onToggleCollapse}>
//           {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
//         </Button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-2">
//         {chatSessions.map((s: ChatSession) => (
//           <div key={s.id} className="group relative">
//             <Button
//               variant={activeSessionId === s.id ? "secondary" : "ghost"}
//               className="w-full justify-start"
//               onClick={() => onSelectSession(s.id)}
//             >
//               {isCollapsed ? s.title.charAt(0) : s.title}
//             </Button>

//             <Button
//               size="icon"
//               variant="ghost"
//               className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
//               onClick={(e: any) => {
//                 e.stopPropagation();
//                 onDeleteSession(s.id);
//               }}
//             >
//               <Trash2 size={12} />
//             </Button>
//           </div>
//         ))}
//       </div>

//       <div className="p-4 border-t border-gray-800">
//         <Button onClick={onLogout}>
//           <LogOut /> Logout
//         </Button>
//       </div>
//     </motion.div>
//   );
// });

// // ---------------- Chat Page ----------------
// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
//   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
//   const [input, setInput] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

//   const router = useRouter();

//   // 🔥 REQUIRED (as you asked)
//   const { token, loading, logout } = useAuth();

//   // ---------------- AUTH GUARD ----------------
//   useEffect(() => {
//     if (loading) return;

//     if (!token) {
//       router.replace("/auth/login");
//     }
//   }, [loading, token, router]);

//   // ---------------- LOAD SESSIONS ----------------
//   useEffect(() => {
//     const fetchChatSessions = async () => {
//       try {
//         if (!token) return;

//         const res = await api.get("/api/chat/sessions", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setChatSessions(res.data);
//       } catch (err) {
//         if (axios.isAxiosError(err) && err.response?.status === 401) {
//           router.replace("/auth/login");
//         }
//       }
//     };

//     if (!loading) fetchChatSessions();
//   }, [loading, token, router]);

//   // ---------------- LOAD MESSAGES ----------------
//   const fetchSessionMessages = async (sessionId: string) => {
//     try {
//       setActiveSessionId(sessionId);

//       if (!token) return;

//       const res = await api.get(`/chat/history/${sessionId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setMessages(res.data);
//     } catch {
//       setMessages([
//         { role: "assistant", message: "⚠️ Error loading chat history" },
//       ]);
//     }
//   };

//   // ---------------- SEND MESSAGE ----------------
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!input.trim() || isLoading) return;

//     if (!token) {
//       router.replace("/auth/login");
//       return;
//     }

//     const userMsg: Message = { role: "user", message: input };
//     setMessages((prev) => [...prev, userMsg]);

//     const sessionId = activeSessionId || crypto.randomUUID();

//     setInput("");
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("query", input);
//       formData.append("session_id", sessionId);

//       if (file) {
//         formData.append("file", file);
//       }

//       const res = await api.post("/api/chat", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", message: res.data.response },
//       ]);

//       if (!activeSessionId) {
//         setActiveSessionId(sessionId);
//         setChatSessions((prev) => [
//           { id: sessionId, title: input },
//           ...prev,
//         ]);
//       }

//       setFile(null);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", message: "⚠️ Error generating response" },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ---------------- LOGOUT ----------------
//   const handleLogout = () => {
//     logout();
//     router.replace("/auth/login");
//   };

//   // ---------------- LOADING / AUTH GATE ----------------
//   if (loading) {
//     return (
//       <div className="text-white p-4 bg-black h-screen">Loading...</div>
//     );
//   }

//   if (!token) return null;

//   return (
//     <div className="flex h-screen bg-black text-white">
//       <Sidebar
//         chatSessions={chatSessions}
//         activeSessionId={activeSessionId}
//         onNewChat={() => setMessages([])}
//         onSelectSession={fetchSessionMessages}
//         onLogout={handleLogout}
//         isCollapsed={isSidebarCollapsed}
//         onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//         onDeleteSession={() => {}}
//       />

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         <div className="flex-1 overflow-y-auto p-4">
//           {messages.map((m, i) => (
//             <div key={i} className="mb-2">
//               <b>{m.role}:</b> {m.message}
//             </div>
//           ))}
//         </div>

//         {/* INPUT AREA */}
//         <form onSubmit={handleSubmit} className="p-4 flex gap-2 items-center">
          
//           {/* FILE UPLOAD */}
//           <label className="cursor-pointer">
//             <Paperclip />
//             <input
//               type="file"
//               hidden
//               onChange={(e) => setFile(e.target.files?.[0] || null)}
//             />
//           </label>

//           <TextareaAutosize
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1 bg-gray-900 p-2 rounded"
//             placeholder="Type your message..."
//           />

//           <Button type="submit" disabled={isLoading}>
//             <Send />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, FormEvent, memo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { api } from "@/app/lib/api";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/app/components/ui/button";
import {
  Send,
  LogOut,
  MessageSquarePlus,
  PanelLeftOpen,
  PanelLeftClose,
  Trash2,
  Paperclip,
} from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  message: string;
}

interface ChatSession {
  id: string;
  title: string;
}

const Sidebar = memo(function Sidebar(props: any) {
  return (
    <motion.div
      animate={{ width: props.isCollapsed ? 64 : 280 }}
      className="bg-gray-950 border-r border-gray-800 flex flex-col"
    >
      <div className="p-4 border-b border-gray-800 flex justify-between">
        {!props.isCollapsed && (
          <Button onClick={props.onNewChat}>
            <MessageSquarePlus size={16} /> New Chat
          </Button>
        )}
        <Button onClick={props.onToggleCollapse}>
          {props.isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {props.chatSessions.map((s: ChatSession) => (
          <Button
            key={s.id}
            className="w-full justify-start"
            onClick={() => props.onSelectSession(s.id)}
          >
            {props.isCollapsed ? s.title.charAt(0) : s.title}
          </Button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button onClick={props.onLogout}>
          <LogOut /> Logout
        </Button>
      </div>
    </motion.div>
  );
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const router = useRouter();
  const { token, loading, logout } = useAuth();

  // ---------------- FIX FLICKER GUARD ----------------
  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!token) return null;

  // ---------------- LOAD SESSIONS ----------------
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/chat/sessions");
      setChatSessions(res.data);
    };
    load();
  }, []);

  // ---------------- SEND ----------------
  const send = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const sessionId = activeSessionId || crypto.randomUUID();

    const form = new FormData();
    form.append("query", input);
    form.append("session_id", sessionId);
    if (file) form.append("file", file);

    setMessages((p) => [...p, { role: "user", message: input }]);
    setInput("");
    setLoadingMsg(true);

    try {
      const res = await api.post("/api/chat", form);

      setMessages((p) => [
        ...p,
        { role: "assistant", message: res.data.response },
      ]);

      if (!activeSessionId) {
        setActiveSessionId(sessionId);
        setChatSessions((p) => [
          { id: sessionId, title: input },
          ...p,
        ]);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", message: "Error" },
      ]);
    } finally {
      setLoadingMsg(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        chatSessions={chatSessions}
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onNewChat={() => setMessages([])}
        onSelectSession={() => {}}
        onLogout={() => {
          logout();
          router.replace("/auth/login");
        }}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i}>
              <b>{m.role}:</b> {m.message}
            </div>
          ))}
        </div>

        <form onSubmit={send} className="p-4 flex gap-2">
          <label>
            <Paperclip />
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 p-2"
          />

          <Button type="submit" disabled={loadingMsg}>
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
