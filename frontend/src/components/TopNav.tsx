"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Live", href: "/dispatch" },
    { name: "Channels", href: "/channels" },
    { name: "Archive", href: "/archive" },
    { name: "Analytics", href: "/analytics" },
    { name: "World", href: "/category/world" },
    { name: "Business", href: "/category/business" },
    { name: "Tech", href: "/category/technology" },
  ];

  return (
    <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono-label text-[13px] uppercase tracking-wider text-on-surface-variant font-bold h-full">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.name}
            href={link.href} 
            className={`h-full flex items-center border-b-2 whitespace-nowrap px-1 transition-all duration-300 ${
              isActive 
                ? "border-primary text-secondary" 
                : "border-transparent hover:border-primary hover:text-primary"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
