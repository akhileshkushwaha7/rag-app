// // // "use client";

// // // import { useState, useEffect, FormEvent, memo } from "react";
// // // import { useAuth } from "@/app/lib/auth-context";
// // // import { api } from "@/app/lib/api";
// // // import TextareaAutosize from "react-textarea-autosize";
// // // import { Button } from "@/app/components/ui/button";
// // // import {
// // //   Send, LogOut, MessageSquarePlus, PanelLeftOpen, PanelLeftClose, Paperclip,
// // // } from "lucide-react";

// // // interface Message {
// // //   role: "user" | "assistant";
// // //   message: string;
// // // }

// // // interface ChatSession {
// // //   id: string;
// // //   title: string;
// // // }

// // // function getToken(stateToken: string | null): string | null {
// // //   return stateToken || localStorage.getItem("session_id");
// // // }

// // // // ---------------- Sidebar ----------------
// // // const Sidebar = memo(function Sidebar(props: any) {
// // //   return (
// // //     <div
// // //       style={{ width: props.isCollapsed ? 64 : 280 }}
// // //       className="bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden transition-all duration-200"
// // //     >
// // //       <div className="p-4 border-b border-gray-800 flex justify-between items-center">
// // //         {!props.isCollapsed && (
// // //           <Button onClick={props.onNewChat} size="sm">
// // //             <MessageSquarePlus size={16} className="mr-1" /> New Chat
// // //           </Button>
// // //         )}
// // //         <Button variant="ghost" size="icon" onClick={props.onToggleCollapse}>
// // //           {props.isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
// // //         </Button>
// // //       </div>

// // //       <div className="flex-1 overflow-y-auto p-2">
// // //         {props.chatSessions.map((s: ChatSession) => (
// // //           <Button
// // //             key={s.id}
// // //             variant={props.activeSessionId === s.id ? "secondary" : "ghost"}
// // //             className="w-full justify-start mb-1 truncate"
// // //             onClick={() => props.onSelectSession(s.id)}
// // //           >
// // //             {props.isCollapsed ? s.title.charAt(0) : s.title}
// // //           </Button>
// // //         ))}
// // //       </div>

// // //       <div className="p-4 border-t border-gray-800">
// // //         <Button variant="ghost" onClick={props.onLogout} className="w-full justify-start">
// // //           <LogOut size={16} className="mr-2" />
// // //           {!props.isCollapsed && "Logout"}
// // //         </Button>
// // //       </div>
// // //     </div>
// // //   );
// // // });

// // // // ---------------- Chat Page ----------------
// // // export default function ChatPage() {
// // //   const [messages, setMessages] = useState<Message[]>([]);
// // //   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
// // //   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
// // //   const [input, setInput] = useState("");
// // //   const [file, setFile] = useState<File | null>(null);
// // //   const [loadingMsg, setLoadingMsg] = useState(false);
// // //   const [collapsed, setCollapsed] = useState(false);

// // //   const { token, loading, logout } = useAuth();

// // //   // Auth guard — middleware handles it at edge, this is a client-side backup
// // //   useEffect(() => {
// // //     if (!loading && !getToken(token)) {
// // //       window.location.href = "/auth/login";
// // //     }
// // //   }, [loading, token]);

// // //   // NOTE: /api/chat/sessions removed — endpoint returns 401
// // //   // Sessions are tracked locally in state instead

// // //   if (loading) {
// // //     return (
// // //       <div className="flex items-center justify-center h-screen bg-black text-white">
// // //         Loading...
// // //       </div>
// // //     );
// // //   }

// // //   if (!getToken(token)) return null;

// // //   // ---------------- LOAD MESSAGES ----------------
// // //   const fetchSessionMessages = async (sessionId: string) => {
// // //     setActiveSessionId(sessionId);
// // //     try {
// // //       const res = await api.get(`/api/chat/history/${sessionId}`);
// // //       setMessages(res.data);
// // //     } catch {
// // //       setMessages([{ role: "assistant", message: "⚠️ Error loading chat history" }]);
// // //     }
// // //   };

// // //   // ---------------- SEND MESSAGE ----------------
// // //   const send = async (e: FormEvent) => {
// // //     e.preventDefault();
// // //     if (!input.trim() || loadingMsg) return;

// // //     const sessionId = activeSessionId || getToken(token) || crypto.randomUUID();

// // //     setMessages((p) => [...p, { role: "user", message: input }]);
// // //     const currentInput = input;
// // //     setInput("");
// // //     setFile(null);
// // //     setLoadingMsg(true);

// // //     try {
// // //       const res = await api.post("/api/chat", {
// // //         query: currentInput,
// // //         session_id: sessionId,
// // //       });

// // //       setMessages((p) => [...p, { role: "assistant", message: res.data.response }]);

// // //       if (!activeSessionId) {
// // //         setActiveSessionId(sessionId);
// // //         setChatSessions((p) => [{ id: sessionId, title: currentInput.slice(0, 40) }, ...p]);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //       setMessages((p) => [...p, { role: "assistant", message: "⚠️ Error generating response" }]);
// // //     } finally {
// // //       setLoadingMsg(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="flex h-screen bg-black text-white">
// // //       <Sidebar
// // //         chatSessions={chatSessions}
// // //         activeSessionId={activeSessionId}
// // //         isCollapsed={collapsed}
// // //         onToggleCollapse={() => setCollapsed(!collapsed)}
// // //         onNewChat={() => { setMessages([]); setActiveSessionId(null); }}
// // //         onSelectSession={fetchSessionMessages}
// // //         onLogout={() => { logout(); window.location.href = "/auth/login"; }}
// // //       />

// // //       <div className="flex-1 flex flex-col">
// // //         <div className="flex-1 p-4 overflow-y-auto space-y-4">
// // //           {messages.length === 0 && (
// // //             <div className="text-gray-500 text-center mt-20">
// // //               Start a conversation or upload a file to get started.
// // //             </div>
// // //           )}
// // //           {messages.map((m, i) => (
// // //             <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
// // //               <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
// // //                 m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
// // //               }`}>
// // //                 {m.message}
// // //               </div>
// // //             </div>
// // //           ))}
// // //           {loadingMsg && (
// // //             <div className="flex justify-start">
// // //               <div className="bg-gray-800 text-gray-400 rounded-lg px-4 py-2 text-sm animate-pulse">
// // //                 Thinking...
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>

// // //         <form onSubmit={send} className="p-4 border-t border-gray-800 flex gap-2 items-end">
// // //           <label className="cursor-pointer text-gray-400 hover:text-white flex items-center">
// // //             <Paperclip size={20} />
// // //             <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
// // //           </label>

// // //           {file && <span className="text-xs text-gray-400 truncate max-w-[120px]">{file.name}</span>}

// // //           <TextareaAutosize
// // //             value={input}
// // //             onChange={(e) => setInput(e.target.value)}
// // //             onKeyDown={(e) => {
// // //               if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as any); }
// // //             }}
// // //             className="flex-1 bg-gray-900 text-white p-2 rounded resize-none focus:outline-none"
// // //             placeholder="Type your message... (Shift+Enter for new line)"
// // //             maxRows={6}
// // //           />

// // //           <Button type="submit" disabled={loadingMsg}>
// // //             <Send size={16} />
// // //           </Button>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// "use client";

// import { useState, useEffect, FormEvent, memo } from "react";
// import { useAuth } from "@/app/lib/auth-context";
// import { api } from "@/app/lib/api";
// import TextareaAutosize from "react-textarea-autosize";
// import { Button } from "@/app/components/ui/button";
// import {
//   Send,
//   LogOut,
//   MessageSquarePlus,
//   PanelLeftOpen,
//   PanelLeftClose,
//   Paperclip,
// } from "lucide-react";

// interface Message {
//   role: "user" | "assistant";
//   message: string;
// }

// interface ChatSession {
//   id: string;
//   title: string;
// }

// function getSession(): string | null {
//   return localStorage.getItem("session_id");
// }

// const Sidebar = memo(function Sidebar(props: any) {
//   return (
//     <div className="w-[280px] bg-gray-950 border-r border-gray-800 flex flex-col">
//       <div className="p-4 flex justify-between">
//         <Button onClick={props.onNewChat} size="sm">
//           <MessageSquarePlus size={16} /> New Chat
//         </Button>
//         <Button variant="ghost" onClick={props.onToggleCollapse}>
//           {props.isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
//         </Button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-2">
//         {props.chatSessions.map((s: ChatSession) => (
//           <Button key={s.id} onClick={() => props.onSelectSession(s.id)}>
//             {s.title}
//           </Button>
//         ))}
//       </div>

//       <Button onClick={props.onLogout}>
//         <LogOut size={16} /> Logout
//       </Button>
//     </div>
//   );
// });

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
//   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
//   const [input, setInput] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [loadingMsg, setLoadingMsg] = useState(false);

//   const { loading, logout } = useAuth();

//   useEffect(() => {
//     const session = getSession();
//     if (!loading && !session) {
//       window.location.href = "/auth/login";
//     }
//   }, [loading]);

//   if (loading) return <div className="text-white">Loading...</div>;

// // ---------------- SEND MESSAGE ----------------
// const send = async (e: FormEvent) => {
//   e.preventDefault();
//   if (!input.trim() || loadingMsg) return;

//   // ✅ FIXED (NO random UUID)
//   const sessionId = activeSessionId || getToken(token);

//   if (!sessionId) {
//     console.error("No session found");
//     window.location.href = "/auth/login";
//     return;
//   }

//   setMessages((p) => [...p, { role: "user", message: input }]);
//   const currentInput = input;
//   setInput("");
//   setFile(null);
//   setLoadingMsg(true);

//   try {
//     const res = await api.post("/api/chat", {
//       query: currentInput,
//       session_id: sessionId,
//     });

//     setMessages((p) => [...p, { role: "assistant", message: res.data.response }]);

//     if (!activeSessionId) {
//       setActiveSessionId(sessionId);
//       setChatSessions((p) => [{ id: sessionId, title: currentInput.slice(0, 40) }, ...p]);
//     }
//   } catch (err) {
//     console.error(err);
//     setMessages((p) => [...p, { role: "assistant", message: "⚠️ Error generating response" }]);
//   } finally {
//     setLoadingMsg(false);
//   }
// };
//   return (
//     <div className="flex h-screen bg-black text-white">
//       <Sidebar
//         chatSessions={chatSessions}
//         activeSessionId={activeSessionId}
//         isCollapsed={false}
//         onToggleCollapse={() => {}}
//         onNewChat={() => {
//           setMessages([]);
//           setActiveSessionId(null);
//         }}
//         onSelectSession={(id: string) => setActiveSessionId(id)}
//         onLogout={() => {
//           localStorage.removeItem("session_id");
//           logout();
//           window.location.href = "/auth/login";
//         }}
//       />

//       <div className="flex-1 flex flex-col">
//         <div className="flex-1 p-4 overflow-y-auto">
//           {messages.map((m, i) => (
//             <div key={i}>{m.message}</div>
//           ))}
//         </div>

//         <form onSubmit={send} className="p-4 flex gap-2">
//           <TextareaAutosize
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1 bg-gray-900 p-2"
//           />
//           <Button type="submit">
//             <Send size={16} />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, FormEvent, memo } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { api } from "@/app/lib/api";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/app/components/ui/button";
import {
  Send,
  LogOut,
  MessageSquarePlus,
  PanelLeftOpen,
  PanelLeftClose,
  Paperclip,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  message: string;
}

interface ChatSession {
  id: string;
  title: string;
}

function getSession(): string | null {
  return localStorage.getItem("session_id");
}

const Sidebar = memo(function Sidebar(props: any) {
  return (
    <div className="w-[280px] bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="p-4 flex justify-between">
        <Button onClick={props.onNewChat} size="sm">
          <MessageSquarePlus size={16} /> New Chat
        </Button>
        <Button variant="ghost" onClick={props.onToggleCollapse}>
          {props.isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {props.chatSessions.map((s: ChatSession) => (
          <Button key={s.id} onClick={() => props.onSelectSession(s.id)}>
            {s.title}
          </Button>
        ))}
      </div>

      <Button onClick={props.onLogout}>
        <LogOut size={16} /> Logout
      </Button>
    </div>
  );
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const { loading, logout } = useAuth();

  useEffect(() => {
    const session = getSession();
    if (!loading && !session) {
      window.location.href = "/auth/login";
    }
  }, [loading]);

  if (loading) return <div className="text-white">Loading...</div>;

  // ---------------- SEND MESSAGE ----------------
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingMsg) return;

    // ✅ FIXED HERE
    const sessionId = activeSessionId || getSession();

    if (!sessionId) {
      console.error("No session found");
      window.location.href = "/auth/login";
      return;
    }

    setMessages((p) => [...p, { role: "user", message: input }]);
    const currentInput = input;
    setInput("");
    setFile(null);
    setLoadingMsg(true);

    try {
      const res = await api.post("/api/chat", {
        query: currentInput,
        session_id: sessionId,
      });

      setMessages((p) => [
        ...p,
        { role: "assistant", message: res.data.response },
      ]);

      if (!activeSessionId) {
        setActiveSessionId(sessionId);
        setChatSessions((p) => [
          { id: sessionId, title: currentInput.slice(0, 40) },
          ...p,
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((p) => [
        ...p,
        { role: "assistant", message: "⚠️ Error generating response" },
      ]);
    } finally {
      setLoadingMsg(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        onNewChat={() => {
          setMessages([]);
          setActiveSessionId(null);
        }}
        onSelectSession={(id: string) => setActiveSessionId(id)}
        onLogout={() => {
          localStorage.removeItem("session_id");
          logout();
          window.location.href = "/auth/login";
        }}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i}>{m.message}</div>
          ))}
        </div>

        <form onSubmit={send} className="p-4 flex gap-2">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 p-2"
          />
          <Button type="submit">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
