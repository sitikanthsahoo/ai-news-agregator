"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, removeToken } from "@/utils/auth";
import axios from "axios";

export default function AuthNav() {
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoaded(true);
      return;
    }
    // Fetch /me to get username from the token
    axios
      .get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsername(res.data.username))
      .catch(() => {
        // Token may be expired — clear it
        removeToken();
      })
      .finally(() => setLoaded(true));
  }, []);

  const handleLogout = () => {
    removeToken();
    setUsername(null);
    window.location.href = "/";
  };

  if (!loaded) return null; // avoid hydration flash

  if (username) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono-data text-[11px] uppercase tracking-wider text-on-surface-variant">
          ◉ {username}
        </span>
        <button
          onClick={handleLogout}
          className="bg-error text-on-error px-2 py-0.5 rounded-sm font-mono-data text-[11px] uppercase hover:opacity-90 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="hover:text-primary transition-colors">
      Sign In
    </Link>
  );
}
