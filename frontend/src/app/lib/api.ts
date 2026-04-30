import axios from "axios";

export const api = axios.create({
  baseURL: "https://rag-app-ai1w.onrender.com",
  withCredentials: true,
});

// REMOVE session injection completely (clean approach)
