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


// "use client";

// import { useState, FormEvent, memo } from "react";
// import { api } from "@/app/lib/api";
// import TextareaAutosize from "react-textarea-autosize";
// import { Button } from "@/app/components/ui/button";
// import {
//   Send,
//   LogOut,
//   MessageSquarePlus,
//   PanelLeftOpen,
//   PanelLeftClose,
// } from "lucide-react";

// interface Message {
//   role: "user" | "assistant";
//   message: string;
// }

// interface ChatSession {
//   id: string;
//   title: string;
// }

// // ---------------- Sidebar ----------------
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

//       {/* Optional logout button removed auth dependency */}
//       <Button onClick={props.onLogout}>
//         <LogOut size={16} /> Clear Chat
//       </Button>
//     </div>
//   );
// });

// // ---------------- CHAT ----------------
// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
//   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
//   const [input, setInput] = useState("");
//   const [loadingMsg, setLoadingMsg] = useState(false);

//   // 🔥 SIMPLE SESSION (NO AUTH SYSTEM)
//   function getSessionId() {
//     if (typeof window === "undefined") return null;

//     let id = localStorage.getItem("session_id");

//     if (!id) {
//       id = crypto.randomUUID();
//       localStorage.setItem("session_id", id);
//     }

//     return id;
//   }

//   // ---------------- SEND MESSAGE ----------------
//   const send = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || loadingMsg) return;

//     const sessionId = activeSessionId || getSessionId();

//     setMessages((p) => [...p, { role: "user", message: input }]);

//     const currentInput = input;
//     setInput("");
//     setLoadingMsg(true);

//     try {
//       const res = await api.post("/api/chat", {
//         query: currentInput,
//         session_id: sessionId,
//       });

//       setMessages((p) => [
//         ...p,
//         { role: "assistant", message: res.data.response },
//       ]);

//       if (!activeSessionId) {
//         setActiveSessionId(sessionId);

//         setChatSessions((p) => [
//           { id: sessionId!, title: currentInput.slice(0, 40) },
//           ...p,
//         ]);
//       }
//     } finally {
//       setLoadingMsg(false);
//     }
//   };

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
//           // just clear local chat
//           setMessages([]);
//           setChatSessions([]);
//           setActiveSessionId(null);
//         }}
//       />

//       <div className="flex-1 flex flex-col">

//         <div className="flex-1 p-4 overflow-y-auto">
//           {messages.length === 0 && (
//             <div className="text-gray-500 text-center mt-20">
//               Start chatting...
//             </div>
//           )}

//           {messages.map((m, i) => (
//             <div key={i} className="mb-2">
//               {m.message}
//             </div>
//           ))}
//         </div>

//         <form onSubmit={send} className="p-4 flex gap-2">
//           <TextareaAutosize
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1 bg-gray-900 p-2"
//             placeholder="Type your message..."
//           />

//           <Button type="submit" disabled={loadingMsg}>
//             <Send size={16} />
//           </Button>
//         </form>

//       </div>
//     </div>
//   );
// }
