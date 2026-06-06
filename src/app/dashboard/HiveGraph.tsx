"use client";

import { useMemo, useRef, useState } from "react";
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Task = { title: string; agent: string; status: string };
type Entity = { id: string; type: string; label: string };

const PALETTE = ["#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#22d3ee", "#fb7185", "#818cf8"];

type Node = {
  id: string; label: string; sub: string; x: number; y: number; r: number;
  kind: "agent" | "task" | "entity"; agent: string; color: string;
};
type Edge = { a: string; b: string; color: string };

const CX = 400, CY = 300, R = 190;

export default function HiveGraph({
  agents, tasks, entities,
}: { agents: string[]; tasks: Task[]; entities: Entity[] }) {
  const colorOf = useMemo(() => {
    const m: Record<string, string> = {};
    agents.forEach((a, i) => (m[a] = PALETTE[i % PALETTE.length]));
    return m;
  }, [agents]);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const N = Math.max(agents.length, 1);

    agents.forEach((agent, i) => {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      const ax = CX + Math.cos(ang) * R;
      const ay = CY + Math.sin(ang) * R;
      const color = colorOf[agent];
      nodes.push({ id: `a:${agent}`, label: agent, sub: "agent", x: ax, y: ay, r: 13, kind: "agent", agent, color });

      const mine = tasks.filter((t) => t.agent === agent);
      mine.forEach((t, j) => {
        const m = mine.length;
        const spread = Math.PI * 0.9;
        const ta = ang + (m > 1 ? (j / (m - 1) - 0.5) * spread : 0);
        const tr = 70 + (j % 2) * 26;
        const tx = ax + Math.cos(ta) * tr;
        const ty = ay + Math.sin(ta) * tr;
        const nid = `t:${agent}:${j}`;
        nodes.push({ id: nid, label: t.title, sub: `${agent} · ${t.status}`, x: tx, y: ty, r: 6, kind: "task", agent, color });
        edges.push({ a: `a:${agent}`, b: nid, color });
      });
    });

    // entités au centre, reliées à un agent déterministe
    entities.forEach((e, i) => {
      const ang = (i / Math.max(entities.length, 1)) * Math.PI * 2;
      const ex = CX + Math.cos(ang) * 56;
      const ey = CY + Math.sin(ang) * 56;
      const agent = agents[i % Math.max(agents.length, 1)] ?? "";
      nodes.push({ id: `e:${e.id}`, label: e.label, sub: e.type, x: ex, y: ey, r: 5, kind: "entity", agent, color: "#52525b" });
      if (agent) edges.push({ a: `a:${agent}`, b: `e:${e.id}`, color: "#3f3f46" });
    });

    return { nodes, edges };
  }, [agents, tasks, entities, colorOf]);

  const [active, setActive] = useState<Set<string>>(new Set(agents));
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<{ x: number; y: number; label: string; sub: string } | null>(null);

  // pan / zoom
  const [view, setView] = useState({ s: 1, tx: 0, ty: 0 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const toggle = (a: string) =>
    setActive((prev) => {
      const n = new Set(prev);
      n.has(a) ? n.delete(a) : n.add(a);
      return n;
    });

  const visible = (n: Node) => n.kind === "entity" ? true : active.has(n.agent);
  const matches = (n: Node) => query.length > 0 && n.kind === "task" && n.label.toLowerCase().includes(query.toLowerCase());
  const dim = (n: Node) => query.length > 0 && !matches(n) && n.kind !== "agent";

  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const zoom = (f: number) => setView((v) => ({ ...v, s: Math.min(2.4, Math.max(0.5, v.s * f)) }));
  const reset = () => setView({ s: 1, tx: 0, ty: 0 });

  const dist = useMemo(
    () => agents.map((a) => ({ a, n: tasks.filter((t) => t.agent === a).length, color: colorOf[a] })),
    [agents, tasks, colorOf]
  );
  const maxN = Math.max(...dist.map((d) => d.n), 1);

  return (
    <div className="space-y-4">
      {/* contrôles */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 h-8 rounded-lg bg-[var(--bg-card)] border-2 border-[var(--border)] focus-within:border-blue-500/40">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une tâche…"
            className="bg-transparent text-sm placeholder:text-[var(--text-muted)] outline-none w-44"
          />
        </div>
        <div className="flex-1" />
        <button onClick={() => zoom(1 / 1.2)} className="w-8 h-8 grid place-items-center rounded-lg border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"><ZoomOut className="w-4 h-4" /></button>
        <button onClick={() => zoom(1.2)} className="w-8 h-8 grid place-items-center rounded-lg border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={reset} className="w-8 h-8 grid place-items-center rounded-lg border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"><Maximize2 className="w-4 h-4" /></button>
      </div>

      {/* toggles agents */}
      <div className="flex flex-wrap gap-2">
        {agents.map((a) => {
          const on = active.has(a);
          return (
            <button
              key={a}
              onClick={() => toggle(a)}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs border transition-colors ${
                on ? "border-[var(--border)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
              style={on ? { background: `${colorOf[a]}1a` } : undefined}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: on ? colorOf[a] : "#3f3f46" }} />
              {a}
            </button>
          );
        })}
      </div>

      {/* graphe */}
      <div className="relative rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-[460px] cursor-grab active:cursor-grabbing touch-none"
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.08 : 1 / 1.08)}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setView((v) => ({ ...v, tx: drag.current!.tx + (e.clientX - drag.current!.x), ty: drag.current!.ty + (e.clientY - drag.current!.y) }));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => { drag.current = null; setHover(null); }}
        >
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.s})`}>
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodeById[e.a], b = nodeById[e.b];
              if (!a || !b || !visible(a) || !visible(b)) return null;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.color} strokeOpacity={0.35} strokeWidth={1} />;
            })}
            {/* nodes */}
            {nodes.filter(visible).map((n) => (
              <g key={n.id}
                 onPointerEnter={() => setHover({ x: n.x, y: n.y, label: n.label, sub: n.sub })}
                 onPointerLeave={() => setHover(null)}
                 style={{ cursor: "pointer" }}>
                {n.kind === "agent" && (
                  <circle cx={n.x} cy={n.y} r={n.r + 6} fill="none" stroke={n.color} strokeOpacity={0.25} />
                )}
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  fill={n.color}
                  fillOpacity={dim(n) ? 0.12 : n.kind === "agent" ? 0.9 : 0.8}
                  stroke={matches(n) ? "var(--text)" : "none"}
                  strokeWidth={matches(n) ? 2 : 0}
                />
                {n.kind === "agent" && (
                  <text x={n.x} y={n.y + n.r + 14} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{n.label}</text>
                )}
              </g>
            ))}
          </g>
        </svg>

        {hover && (
          <div
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border-2 border-[var(--border)] text-xs max-w-[220px] shadow-xl"
            style={{
              left: `${(hover.x * view.s + view.tx) / 800 * 100}%`,
              top: `${(hover.y * view.s + view.ty) / 600 * 100}%`,
              transform: "translate(-50%, -130%)",
            }}
          >
            <p className="text-[var(--text)] leading-tight">{hover.label}</p>
            <p className="text-[var(--text-muted)] mt-0.5">{hover.sub}</p>
          </div>
        )}
      </div>

      {/* distribution */}
      <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Distribution par agent</p>
        <div className="space-y-2">
          {dist.map((d) => (
            <div key={d.a} className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] w-24 shrink-0">{d.a}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-card-hover)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.n / maxN) * 100}%`, background: d.color }} />
              </div>
              <span className="text-xs text-[var(--text-muted)] w-6 text-right tabular-nums">{d.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
