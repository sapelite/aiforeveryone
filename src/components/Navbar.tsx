"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { PixelIcon } from "@/components/PixelIcon";

const links = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#how", label: "Étapes" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/dashboard", label: "Démo" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <nav className="bg-[var(--bg-card)] border-b-2 border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-3 h-11 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 font-display text-[10px] shrink-0">
              <PixelIcon name="computer" size={16} className="text-[var(--accent)]" /> AIFOREVERYONE
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="px-2.5 py-1.5 text-base hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)] transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Link href="/onboarding" className="pbtn pbtn-primary pbtn-sm">Commencer</Link>
          </div>

          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <button onClick={() => setOpen(!open)} className="win-btn" style={{ width: 28, height: 28 }} aria-label="Menu">
              <PixelIcon name={open ? "close" : "menu"} size={16} />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t-2 border-[var(--border)] px-3 py-2 space-y-1 bg-[var(--bg-card)]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-2 py-2 text-lg hover:bg-[var(--bg-card-hover)]">{l.label}</Link>
            ))}
            <Link href="/onboarding" onClick={() => setOpen(false)} className="pbtn pbtn-primary w-full mt-1">Commencer</Link>
          </div>
        )}
      </nav>
    </div>
  );
}
