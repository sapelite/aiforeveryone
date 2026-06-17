"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type RawSkill = { name?: string; title?: string; category?: string };
type RawProject = { slug: string; name: string; status: string };
type RawTask = { id: string; title: string; status: string; updatedAt?: string };
type RawCtx = { name: string; path: string; type: string };
type Brain = { skills: RawSkill[]; projects: RawProject[]; tasks: RawTask[]; ctx: RawCtx[] };

type GNode = { id: string; label: string; sub: string; x: number; y: number; size: number; color: string; kind: "core" | "cluster" | "leaf"; cluster: string };
type GEdge = { a: string; b: string; color: string };

const CX = 400, CY = 300;
const ACCENT = "var(--accent)", WARN = "var(--warning)", DEST = "var(--destructive)", MUT = "var(--text-muted)";

const CLUSTERS = [
  { id: "skills", label: "SKILLS", color: ACCENT, pos: { x: CX, y: CY - 160 } },
  { id: "projects", label: "PROJETS", color: WARN, pos: { x: CX + 185, y: CY + 10 } },
  { id: "tasks", label: "TÂCHES", color: ACCENT, pos: { x: CX, y: CY + 160 } },
  { id: "memory", label: "MÉMOIRE", color: MUT, pos: { x: CX - 185, y: CY + 10 } },
];

const taskColor = (s: string) =>
  s === "done" || s === "completed" ? ACCENT : s === "running" ? WARN : s === "failed" || s === "error" ? DEST : MUT;

function buildGraph(d: Brain | null): { nodes: GNode[]; edges: GEdge[] } {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  nodes.push({ id: "core", label: "CERVEAU", sub: "Agentic OS", x: CX, y: CY, size: 28, color: ACCENT, kind: "core", cluster: "core" });
  if (!d) return { nodes, edges };

  const leavesFor = (id: string): { label: string; sub: string; color: string }[] => {
    if (id === "skills") {
      const cats: Record<string, number> = {};
      d.skills.forEach((s) => { const c = s.category || "autres"; cats[c] = (cats[c] || 0) + 1; });
      return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, n]) => ({ label: c, sub: `${n} skills`, color: ACCENT }));
    }
    if (id === "projects") return d.projects.slice(0, 10).map((p) => ({ label: p.name, sub: p.status, color: WARN }));
    if (id === "tasks") return d.tasks.slice(0, 12).map((t) => ({ label: t.title, sub: t.status, color: taskColor(t.status) }));
    if (id === "memory") return d.ctx.slice(0, 10).map((c) => ({ label: c.name, sub: c.type, color: MUT }));
    return [];
  };

  CLUSTERS.forEach((cl) => {
    nodes.push({ id: `cl:${cl.id}`, label: cl.label, sub: "", x: cl.pos.x, y: cl.pos.y, size: 16, color: cl.color, kind: "cluster", cluster: cl.id });
    edges.push({ a: "core", b: `cl:${cl.id}`, color: cl.color });
    const leaves = leavesFor(cl.id);
    const baseAng = Math.atan2(cl.pos.y - CY, cl.pos.x - CX);
    const m = leaves.length;
    leaves.forEach((lf, j) => {
      const ang = baseAng + (m > 1 ? (j / (m - 1) - 0.5) * Math.PI * 1.15 : 0);
      const rr = 66 + (j % 2) * 24;
      const id = `lf:${cl.id}:${j}`;
      nodes.push({ id, label: lf.label, sub: lf.sub, x: cl.pos.x + Math.cos(ang) * rr, y: cl.pos.y + Math.sin(ang) * rr, size: 8, color: lf.color, kind: "leaf", cluster: cl.id });
      edges.push({ a: `cl:${cl.id}`, b: id, color: cl.color });
    });
  });
  return { nodes, edges };
}

export default function HiveGraph() {
  const [data, setData] = useState<Brain | null>(null);
  const [active, setActive] = useState<Set<string>>(new Set(["skills", "projects", "tasks", "memory"]));
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<{ x: number; y: number; label: string; sub: string } | null>(null);
  const [view, setView] = useState({ s: 1, tx: 0, ty: 0 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    let alive = true;
    const j = (u: string) => fetch(u).then((r) => r.json()).catch(() => null);
    Promise.all([j("/api/engine/skills"), j("/api/engine/projects"), j("/api/engine/tasks"), j("/api/engine/context")]).then(([sk, pr, ta, cx]) => {
      if (!alive) return;
      setData({
        skills: (sk?.skills ?? []) as RawSkill[],
        projects: (pr?.projects ?? []) as RawProject[],
        tasks: ((ta?.tasks ?? []) as RawTask[]).slice().sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))),
        ctx: (cx?.files ?? []) as RawCtx[],
      });
    });
    return () => { alive = false; };
  }, []);

  const { nodes, edges } = useMemo(() => buildGraph(data), [data]);
  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const toggle = (c: string) => setActive((p) => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const visible = (n: GNode) => n.kind === "core" || active.has(n.cluster);
  const matches = (n: GNode) => query.length > 0 && n.kind === "leaf" && n.label.toLowerCase().includes(query.toLowerCase());
  const dim = (n: GNode) => query.length > 0 && !matches(n) && n.kind === "leaf";
  const zoom = (f: number) => setView((v) => ({ ...v, s: Math.min(2.6, Math.max(0.5, v.s * f)) }));

  const counts = data ? { skills: data.skills.length, projects: data.projects.length, tasks: data.tasks.length, memory: data.ctx.length } : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 h-8 win-flat">
          <PixelIcon name="search" size={14} className="text-[var(--text-muted)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher un nœud…" className="bg-transparent text-sm placeholder:text-[var(--text-muted)] outline-none w-44" />
        </div>
        <div className="flex-1" />
        <button onClick={() => zoom(1 / 1.2)} className="win-btn" aria-label="Dézoomer"><PixelIcon name="minus" size={14} /></button>
        <button onClick={() => zoom(1.2)} className="win-btn" aria-label="Zoomer"><PixelIcon name="plus" size={14} /></button>
        <button onClick={() => setView({ s: 1, tx: 0, ty: 0 })} className="win-btn" aria-label="Recentrer"><PixelIcon name="reload" size={14} /></button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CLUSTERS.map((cl) => {
          const on = active.has(cl.id);
          return (
            <button key={cl.id} onClick={() => toggle(cl.id)} className={`flex items-center gap-1.5 px-2 py-1 text-sm border-2 border-[var(--border)] transition-colors ${on ? "" : "opacity-50"}`}>
              <span className="w-2.5 h-2.5" style={{ background: on ? cl.color : "var(--text-muted)" }} />
              {cl.label.toLowerCase()}{counts ? ` · ${counts[cl.id as keyof typeof counts]}` : ""}
            </button>
          );
        })}
      </div>

      <div className="relative win-flat bg-[var(--bg)] overflow-hidden">
        {!data && <p role="status" className="absolute inset-0 grid place-items-center text-base text-[var(--text-muted)]">tissage du graphe depuis le cerveau<span className="blink">_</span></p>}
        <svg
          viewBox="0 0 800 600"
          className="w-full h-[460px] cursor-grab active:cursor-grabbing touch-none"
          shapeRendering="crispEdges"
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.08 : 1 / 1.08)}
          onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (!drag.current) return; setView((v) => ({ ...v, tx: drag.current!.tx + (e.clientX - drag.current!.x), ty: drag.current!.ty + (e.clientY - drag.current!.y) })); }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => { drag.current = null; setHover(null); }}
        >
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.s})`}>
            {edges.map((e, i) => {
              const a = nodeById[e.a], b = nodeById[e.b];
              if (!a || !b || !visible(a) || !visible(b)) return null;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.color} strokeOpacity={0.4} strokeWidth={1} />;
            })}
            {nodes.filter(visible).map((n) => {
              const half = n.size / 2;
              return (
                <g key={n.id} onPointerEnter={() => setHover({ x: n.x, y: n.y, label: n.label, sub: n.sub })} onPointerLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                  {n.kind === "core" && (
                    <rect x={n.x - half - 6} y={n.y - half - 6} width={n.size + 12} height={n.size + 12} fill="none" stroke={n.color} strokeWidth={1}>
                      <animate attributeName="stroke-opacity" values="0.7;0.1;0.7" dur="2.2s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <rect x={n.x - half} y={n.y - half} width={n.size} height={n.size} fill={n.color} fillOpacity={dim(n) ? 0.15 : n.kind === "leaf" ? 0.85 : 1} stroke={matches(n) ? "var(--text)" : n.kind === "leaf" ? "none" : "var(--border)"} strokeWidth={matches(n) ? 2 : n.kind === "leaf" ? 0 : 1} />
                  {(n.kind === "core" || n.kind === "cluster") && (
                    <text x={n.x} y={n.y + half + 12} textAnchor="middle" fontSize={n.kind === "core" ? 11 : 9} fill="var(--text)" fontFamily="var(--font-press), monospace">{n.label}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {hover && (
          <div className="absolute pointer-events-none px-2.5 py-1.5 win-flat bg-[var(--bg-card)] text-xs max-w-[220px]" style={{ left: `${(hover.x * view.s + view.tx) / 800 * 100}%`, top: `${(hover.y * view.s + view.ty) / 600 * 100}%`, transform: "translate(-50%, -130%)" }}>
            <p className="text-[var(--text)] leading-tight truncate">{hover.label}</p>
            {hover.sub && <p className="text-[var(--text-muted)] mt-0.5">{hover.sub}</p>}
          </div>
        )}
      </div>

      <p className="text-sm text-[var(--text-muted)]">Graphe vivant tissé depuis le cerveau du moteur : skills, projets, tâches et mémoire réels. Clique un cluster pour le masquer, molette pour zoomer.</p>
    </div>
  );
}
