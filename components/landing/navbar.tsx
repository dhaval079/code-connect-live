"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/components/landing/room-context";
import { ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#changelog", label: "Changelog" },
];

export function Navbar() {
  const { startRoom: onStart } = useRoom();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-line transition-all duration-300"
      style={{
        background: compact
          ? "rgba(247,246,242,0.95)"
          : "rgba(247,246,242,0.75)",
        backdropFilter: compact ? "saturate(180%) blur(20px)" : "saturate(180%) blur(16px)",
        WebkitBackdropFilter: compact ? "saturate(180%) blur(20px)" : "saturate(180%) blur(16px)",
        boxShadow: compact ? "0 12px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(10,15,30,0.06)" : "none",
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-6 px-8 py-4">
        <Logo />

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-underline text-ink-2 hover:text-ink text-[13px] font-medium leading-none py-1 no-underline transition-colors duration-[220ms]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="hidden md:block text-muted text-[11px] font-medium tracking-[0.04em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            v2.4 · stable
          </span>
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="primary" size="sm" onClick={onStart} className="flex items-center gap-2">
            Start a room <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
