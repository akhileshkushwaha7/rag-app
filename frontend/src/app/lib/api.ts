import axios from "axios";

export const api = axios.create({
  baseURL: "https://rag-app-ai1w.onrender.com",
  // withCredentials removed: you are using Bearer tokens via localStorage, not cookies
});
