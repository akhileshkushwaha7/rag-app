// import axios from "axios";
// export const api = axios.create({
//   baseURL: "https://rag-app-ai1w.onrender.com",
//   withCredentials: true,
// });


import axios from "axios";

export const api = axios.create({
  baseURL: "https://rag-app-ai1w.onrender.com",
  withCredentials: true,
});

// 🔥 AUTO ATTACH SESSION
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("session_id");

    if (session) {
      config.headers.Authorization = `Bearer ${session}`;
    }
  }

  return config;
});
