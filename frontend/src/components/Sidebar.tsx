"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "DASHBOARD", icon: "dashboard" },
    { href: "/archive", label: "ARCHIVE", icon: "inventory_2" },
    { href: "/dispatch", label: "DISPATCH", icon: "newspaper" },
    { href: "/channels", label: "CHANNELS", icon: "hub" },
    { href: "/analytics", label: "ANALYTICS", icon: "analytics" },
  ];

  const bottomLinks = [
    { href: "/support", label: "SUPPORT", icon: "help" },
    { href: "/logout", label: "LOGOUT", icon: "logout" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 flex flex-col pt-20 border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 z-50">
      <div className="px-6 mb-8">
        <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 transition-transform duration-300 hover:scale-105 cursor-pointer origin-left">
          THE CHRONICLE
        </h1>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {navLinks.map((link) => {
          // Check if active (if exact match, or if dispatch is active when at /dispatch)
          // For '/' dashboard, check exact match.
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 mx-2 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 shadow-sm scale-[0.98]"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 hover:-translate-y-[2px]"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                  !isActive ? "group-hover:scale-110" : ""
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className="font-mono-label text-mono-label uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="p-6">
        <button className="w-full bg-primary text-on-primary p-3 rounded-full font-mono-label text-mono-label uppercase tracking-wider shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:translate-y-0 active:shadow-sm">
          NEW EDITION
        </button>
      </div>
      <div className="mt-auto border-t border-stone-200 dark:border-stone-800 py-4 flex flex-col gap-2">
        {bottomLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 text-stone-600 dark:text-stone-400 p-3 mx-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-all duration-200 hover:-translate-y-[2px] group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="font-mono-label text-mono-label uppercase tracking-wider">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
      <div className="border-t border-stone-200 dark:border-stone-800 p-6 flex items-center gap-3 hover:bg-stone-200/50 cursor-pointer transition-colors duration-200">
        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-stone-600">person</span>
        </div>
        <div>
          <div className="font-mono-label text-mono-label uppercase text-stone-900 dark:text-stone-50 font-bold">
            EDITOR-IN-CHIEF
          </div>
          <div className="font-mono-data text-mono-data text-stone-600 dark:text-stone-400">
            Vol. 42 Issue 9
          </div>
        </div>
      </div>
    </nav>
  );
}
