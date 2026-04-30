"use client";

import { useState, useEffect, FormEvent, memo } from "react";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  message: string;
}

interface ChatSession {
  id: string;
  title: string;
}

// ---------------- Sidebar ----------------
const Sidebar = memo(function Sidebar(props: any) {
  return (
    <motion.div
      animate={{ width: props.isCollapsed ? 64 : 280 }}
      className="bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {!props.isCollapsed && (
          <Button onClick={props.onNewChat} size="sm">
            <MessageSquarePlus size={16} className="mr-1" /> New Chat
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={props.onToggleCollapse}>
          {props.isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {props.chatSessions.map((s: ChatSession) => (
          <Button
            key={s.id}
            variant={props.activeSessionId === s.id ? "secondary" : "ghost"}
            className="w-full justify-start mb-1 truncate"
            onClick={() => props.onSelectSession(s.id)}
          >
            {props.isCollapsed ? s.title.charAt(0) : s.title}
          </Button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button variant="ghost" onClick={props.onLogout} className="w-full justify-start">
          <LogOut size={16} className="mr-2" />
          {!props.isCollapsed && "Logout"}
        </Button>
      </div>
    </motion.div>
  );
});

// ---------------- Chat Page ----------------
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

  // FIX: hooks must come BEFORE any conditional returns
  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/auth/login");
    }
  }, [loading, token, router]);

  // ---------------- LOAD SESSIONS ----------------
  useEffect(() => {
    if (!token) return;

    const loadSessions = async () => {
      try {
        const res = await api.get("/api/chat/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatSessions(res.data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };

    loadSessions();
  }, [token]);

  // ---------------- LOAD MESSAGES ----------------
  const fetchSessionMessages = async (sessionId: string) => {
    if (!token) return;
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/chat/history/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch {
      setMessages([{ role: "assistant", message: "⚠️ Error loading chat history" }]);
    }
  };

  // FIX: loading/auth gate AFTER all hooks
  if (loading) {
    return <div className="text-white p-4 bg-black h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token) return null;

  // ---------------- SEND MESSAGE ----------------
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingMsg) return;

    // FIX: use a fresh UUID for new chats, not the auth session_id
    const sessionId = activeSessionId || crypto.randomUUID();

    const form = new FormData();
    form.append("query", input);
    form.append("session_id", sessionId);
    if (file) form.append("file", file);

    setMessages((p) => [...p, { role: "user", message: input }]);
    setInput("");
    setFile(null);
    setLoadingMsg(true);

    try {
      const res = await api.post("/api/chat", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((p) => [
        ...p,
        { role: "assistant", message: res.data.response },
      ]);

      if (!activeSessionId) {
        setActiveSessionId(sessionId);
        setChatSessions((p) => [{ id: sessionId, title: input.slice(0, 40) }, ...p]);
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
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onNewChat={() => {
          setMessages([]);
          setActiveSessionId(null);
        }}
        onSelectSession={fetchSessionMessages}
        onLogout={() => {
          logout();
          router.replace("/auth/login");
        }}
      />

      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-gray-500 text-center mt-20">
              Start a conversation or upload a file to get started.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
          {loadingMsg && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-400 rounded-lg px-4 py-2 text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={send} className="p-4 border-t border-gray-800 flex gap-2 items-end">
          <label className="cursor-pointer text-gray-400 hover:text-white flex items-center">
            <Paperclip size={20} />
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {file && (
            <span className="text-xs text-gray-400 truncate max-w-[120px]">
              {file.name}
            </span>
          )}

          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(e as any);
              }
            }}
            className="flex-1 bg-gray-900 text-white p-2 rounded resize-none focus:outline-none"
            placeholder="Type your message... (Shift+Enter for new line)"
            maxRows={6}
          />

          <Button type="submit" disabled={loadingMsg}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
