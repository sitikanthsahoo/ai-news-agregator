import type { Metadata } from "next";
import { Lora, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import ThemeToggle from "@/components/ThemeToggle";
import TopNav from "@/components/TopNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthNav from "@/components/AuthNav";
import FooterSubscribeForm from "@/components/FooterSubscribeForm";
import "./globals.css";

const lora = Lora({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseNews AI Aggregator",
  description: "Your daily intelligence brief powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <html
      lang="en"
      className={`${lora.variable} ${spaceGrotesk.variable} min-h-screen`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed antialiased transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Top Mini-Bar */}
        <div className="w-full bg-surface-container-low border-b border-stone-200 py-1.5 px-4 flex justify-between items-center text-[11px] font-mono-data text-on-surface-variant uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">public</span> Edition IN
            </span>
            <span className="hidden sm:inline">English</span>
            <span className="hidden md:inline">{today}</span>
            <span className="hidden lg:flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span> Delhi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/subscribe" className="bg-error text-on-error px-2 py-0.5 rounded-sm hover:opacity-90 transition-opacity">
              Subscribe to Syndicate+
            </Link>
            <AuthNav />
            <div className="flex items-center gap-4 border-l border-stone-300 pl-4">
               <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-primary transition-colors">language</span>
               <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Logo Area */}
        <div className="w-full py-8 flex flex-col items-center justify-center bg-surface">
          <Link href="/" className="group">
            <h1 className="font-serif text-5xl md:text-7xl font-semibold text-primary tracking-wide hover:opacity-80 transition-opacity duration-300" style={{fontFamily: 'var(--font-newsreader)', letterSpacing: '0.08em'}}>
              THE CHRONICLE
            </h1>
          </Link>
          <p className="font-mono-label text-[10px] uppercase tracking-[0.3em] text-outline mt-3">
          </p>
        </div>

        {/* Main Navigation Bar */}
        <div className="w-full border-y border-stone-900 bg-surface sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1280px] mx-auto px-4 flex justify-between items-center h-14">
            <TopNav />
            <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Breaking News Ticker */}
        <BreakingNewsTicker />

        {/* Main Content Area */}
        <main className="flex-1 w-full bg-surface-container-low flex justify-center py-8 px-4">
          <div className="w-full max-w-[1280px]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full bg-stone-900 text-stone-400 py-12 mt-12 border-t-4 border-primary">
          <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <h2 className="font-serif text-2xl font-bold text-stone-50 mb-4">THE CHRONICLE</h2>
              <p className="font-mono-data text-[12px] leading-relaxed">
                Aggregating the world's intelligence into actionable insights using advanced language models and algorithmic curation.
              </p>
            </div>
            <div>
              <h3 className="font-mono-label text-stone-50 uppercase tracking-widest mb-4">Sections</h3>
              <ul className="space-y-2 font-mono-data text-[13px]">
                <li><Link href="/" className="hover:text-stone-50 transition-colors">Home</Link></li>
                <li><Link href="/dispatch" className="hover:text-stone-50 transition-colors">Live Dispatch</Link></li>
                <li><Link href="/channels" className="hover:text-stone-50 transition-colors">Channels</Link></li>
                <li><Link href="/archive" className="hover:text-stone-50 transition-colors">Archive</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono-label text-stone-50 uppercase tracking-widest mb-4">Company</h3>
              <ul className="space-y-2 font-mono-data text-[13px]">
                <li><Link href="/about" className="hover:text-stone-50 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-stone-50 transition-colors">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-stone-50 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-stone-50 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono-label text-stone-50 uppercase tracking-widest mb-4">Subscribe</h3>
              <p className="font-mono-data text-[12px] mb-4">Get the daily intelligence brief delivered to your inbox.</p>
              <FooterSubscribeForm />
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
