"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setToken } from "@/utils/auth";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend UserLogin schema expects: { username: str, password: str }
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      setToken(response.data.access_token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Check username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-32 px-4 w-full">
      <div className="w-full max-w-md min-w-[300px] bg-surface p-8 brutalist-border brutalist-outset">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4">key</span>
          <h1 className="font-serif text-3xl font-black text-on-surface">Access Terminal</h1>
          <p className="font-mono-data text-outline mt-2 uppercase tracking-wider text-[11px]">Chronicle Syndicate Authentication</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 font-mono-data text-[12px] mb-6 brutalist-border flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-mono-label text-[12px] uppercase text-on-surface">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-surface-container border border-stone-400 p-3 font-mono-data text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono-label text-[12px] uppercase text-on-surface">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your passcode"
              className="w-full bg-surface-container border border-stone-400 p-3 font-mono-data text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3 font-mono-label uppercase tracking-widest text-[13px] hover:opacity-90 brutalist-outset mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> Authenticating...</>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <div className="mt-8 text-center font-mono-data text-[12px] text-on-surface-variant">
          Unregistered operative?{" "}
          <Link href="/register" className="text-secondary hover:underline">
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
}
