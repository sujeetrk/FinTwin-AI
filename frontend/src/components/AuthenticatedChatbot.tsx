"use client";

import { useEffect, useState } from "react";
import FloatingAIChat from "./FloatingAIChat";

export default function AuthenticatedChatbot() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    setAuthenticated(!!token);
  }, []);

  if (!authenticated) {
    return null;
  }

  return <FloatingAIChat />;
}