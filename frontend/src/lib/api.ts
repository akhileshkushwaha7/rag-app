import axios from "axios";

const BASE_URL = "https://rag-app-ai1w.onrender.com";

/* =========================
   FETCH VERSION (optional)
========================= */
export async function sendChatMessage(query: string, session_id: string) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 🔥 IMPORTANT: send session here too
      "session_id": session_id,
    },
    body: JSON.stringify({
      query,
      session_id,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to connect to backend");
  }

  return res.json();
}

/* =========================
   AXIOS INSTANCE
========================= */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* =========================
   AUTO ATTACH SESSION
========================= */


api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("session_id");

  if (sessionId) {
    config.headers["session_id"] = sessionId;
  }

  return config;
});