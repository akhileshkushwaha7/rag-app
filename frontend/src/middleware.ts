"use client";

import { useEffect } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const session = localStorage.getItem("session_id");
    if (!session) {
      window.location.href = "/auth/login";
    }
  }, []);

  return <>{children}</>;
}
