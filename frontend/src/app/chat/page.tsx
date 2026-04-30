
"use client";
import {
  useState,
  useRef,
  useEffect,
  FormEvent,
  ChangeEvent,
  memo,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { api } from "@/app/lib/api";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/app/components/ui/button";
import {
  Paperclip,
  Send,
  LogOut,
  MessageSquarePlus,
  PanelLeftOpen,
  PanelLeftClose,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------- Types ----------------
interface Message {
  role: "user" | "assistant";
  message: string;
}
interface ChatSession {
  id: string;
  title: string;
}

// ---------------- Sidebar ----------------
const Sidebar = memo(function Sidebar({
  chatSessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  onDeleteSession,
}: any) {
  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 280 }}
      className="bg-gray-950 border-r border-gray-800 flex flex-col"
    >
      <div className="p-4 border-b border-gray-800 flex justify-between">
        {!isCollapsed && (
          <Button onClick={onNewChat}>
            <MessageSquarePlus size={16} /> New Chat
          </Button>
        )}
        <Button onClick={onToggleCollapse}>
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chatSessions.map((s: ChatSession) => (
          <div key={s.id} className="group relative">
            <Button
              variant={activeSessionId === s.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectSession(s.id)}
            >
              {isCollapsed ? s.title.charAt(0) : s.title}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 opacity-0 group-hover:opacity-100"
              onClick={(e: any) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button onClick={onLogout}>
          <LogOut /> Logout
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const router = useRouter();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();

  const getToken = () => localStorage.getItem("token");

  // ---------------- Auth Guard ----------------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ---------------- Load Sessions ----------------
  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const token = getToken();

        const res = await api.get("/chat/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChatSessions(res.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/auth/login");
        }
      }
    };

    if (isAuthenticated) fetchChatSessions();
  }, [isAuthenticated, router]);

  // ---------------- Load Session Messages ----------------
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);

      const token = getToken();

      const res = await api.get(`/chat/history/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data);
    } catch {
      setMessages([
        { role: "assistant", message: "⚠️ Error loading chat history" },
      ]);
    }
  };

  // ---------------- Send Message (/api/chat FIXED) ----------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", message: input };
    setMessages((prev) => [...prev, userMsg]);

    const token = getToken();
    const sessionId = activeSessionId || crypto.randomUUID();

    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post(
        "/api/chat",
        {
          query: input,
          session_id: sessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: res.data.response },
      ]);

      if (!activeSessionId) {
        setActiveSessionId(sessionId);
        setChatSessions((prev) => [
          { id: sessionId, title: input },
          ...prev,
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: "⚠️ Error generating response" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Logout ----------------
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onNewChat={() => setMessages([])}
        onSelectSession={fetchSessionMessages}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onDeleteSession={() => {}}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              <b>{m.role}:</b> {m.message}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex gap-2">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 p-2 rounded"
          />
          <Button type="submit" disabled={isLoading}>
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
