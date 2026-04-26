"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        email,
        password,
        username
      });
      alert("Registration successful. Proceed to authentication.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-32 px-4 w-full">
      <div className="w-full max-w-md min-w-[300px] bg-surface p-8 brutalist-border brutalist-outset">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4">badge</span>
          <h1 className="font-serif text-3xl font-black text-on-surface">Registration</h1>
          <p className="font-mono-data text-outline mt-2 uppercase tracking-wider text-[11px]">Chronicle Syndicate Clearance</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 font-mono-data text-[12px] mb-6 brutalist-border">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-mono-label text-[12px] uppercase text-on-surface">Alias (Username)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-container border border-stone-900 p-3 font-mono-data focus:outline-none focus:ring-1 focus:ring-primary" 
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono-label text-[12px] uppercase text-on-surface">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-stone-900 p-3 font-mono-data focus:outline-none focus:ring-1 focus:ring-primary" 
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono-label text-[12px] uppercase text-on-surface">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-stone-900 p-3 font-mono-data focus:outline-none focus:ring-1 focus:ring-primary" 
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary py-3 font-mono-label uppercase tracking-widest text-[13px] hover:opacity-90 brutalist-outset mt-2">
            Initialize Clearance
          </button>
        </form>

        <div className="mt-8 text-center font-mono-data text-[12px] text-on-surface-variant">
          Already cleared? <Link href="/login" className="text-secondary hover:underline">Authenticate</Link>
        </div>
      </div>
    </div>
  );
}
