"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type RawSkill = { name?: string; id?: string; slug?: string; title?: string; category?: string; description?: string; desc?: string };
type Skill = { name: string; category: string; desc: string };

const norm = (s: RawSkill): Skill => ({
  name: s.title || s.name || s.slug || s.id || "skill",
  category: s.category || "autres",
  desc: s.description || s.desc || "",
});

export default function Skills() {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/engine/skills")
      .then((r) => r.json())
      .then((j) => setSkills(Array.isArray(j.skills) ? (j.skills as RawSkill[]).map(norm) : []))
      .catch(() => setSkills([]));
  }, []);

  function toggle(name: string) {
    if (open === name) { setOpen(null); return; }
    setOpen(name);
    if (content[name] === undefined) {
      fetch(`/api/engine/skill?name=${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((j) => setContent((c) => ({ ...c, [name]: j.content ?? "(introuvable)" })))
        .catch(() => setContent((c) => ({ ...c, [name]: "(erreur)" })));
    }
  }

  if (skills === null) return <p role="status" className="text-base text-[var(--text-muted)]">chargement des skills<span className="blink">_</span></p>;
  if (skills.length === 0) return <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">Aucun skill détecté. Le moteur est-il en ligne ? Les skills vivent dans <span className="font-mono">.claude/skills</span> du workspace.</div>;

  const filtered = skills.filter((s) => (s.name + s.category + s.desc).toLowerCase().includes(q.toLowerCase()));
  const groups = filtered.reduce<Record<string, Skill[]>>((m, s) => { (m[s.category] = m[s.category] || []).push(s); return m; }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 h-10 win-flat max-w-md">
        <PixelIcon name="search" size={16} className="text-[var(--text-muted)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un skill…" className="flex-1 bg-transparent outline-none text-base placeholder:text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-muted)]">{filtered.length}/{skills.length}</span>
      </div>
      {Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).map(([cat, items]) => (
        <section key={cat}>
          <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">{cat} · {items.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((s) => (
              <div key={s.name} className="win-flat">
                <button onClick={() => toggle(s.name)} className="w-full text-left p-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-7 h-7 grid place-items-center border-2 border-[var(--border)] bg-[var(--accent)] shrink-0"><PixelIcon name="command" size={14} className="text-[#1b1b1b]" /></span>
                    <p className="font-mono text-base truncate flex-1">{s.name}</p>
                    <PixelIcon name={open === s.name ? "chevron-down" : "chevron-right"} size={14} className="text-[var(--text-muted)]" />
                  </div>
                  {s.desc && <p className="text-sm text-[var(--text-muted)] leading-snug line-clamp-3">{s.desc}</p>}
                </button>
                {open === s.name && (
                  <pre className="px-3 pb-3 pt-2 text-sm font-mono whitespace-pre-wrap leading-snug max-h-72 overflow-auto border-t-2 border-[var(--border)]">{content[s.name] ?? "chargement…"}</pre>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
