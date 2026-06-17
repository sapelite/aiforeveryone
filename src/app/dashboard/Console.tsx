"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { InstanceData, Status } from "@/lib/instance";
import HiveGraph from "./HiveGraph";
import WarRoom from "./WarRoom";
import Chat from "./Chat";
import Brain from "./Brain";
import Integrations from "./Integrations";
import AgentInsights from "./AgentInsights";
import Runs from "./Runs";
import Board from "./Board";
import Inbox from "./Inbox";
import Agents from "./Agents";
import Context from "./Context";
import Brand from "./Brand";
import Deliverables from "./Deliverables";
import History from "./History";
import AttentionBell from "./AttentionBell";
import PanicButton from "./PanicButton";
import RecentActivity from "./RecentActivity";
import Tutorial from "./Tutorial";
import Skills from "./Skills";
import Scheduled from "./Scheduled";
import Memory from "./Memory";
import Usage from "./Usage";
import Audit from "./Audit";
import EngineKpis from "./EngineKpis";
import EngineSettings from "./EngineSettings";
import { useSettings, ACCENT_PRESETS, MODELS } from "./useSettings";
import ThemeToggle from "@/components/ThemeToggle";
import SoundToggle from "@/components/SoundToggle";
import EngineStatus from "@/components/EngineStatus";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";
import { PixelIcon } from "@/components/PixelIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutGrid, Users, Sparkles, TrendingUp, Zap, Bot, Search, Plus,
  AlertTriangle, Fingerprint, Power, RotateCcw,
} from "lucide-react";

type ViewId =
  | "mission" | "scheduled" | "agents" | "chat" | "inbox" | "runs" | "board" | "deliverables"
  | "memories" | "skills" | "memory" | "context" | "brand" | "hive" | "usage" | "audit" | "history" | "warroom" | "integrations" | "settings";

const nav: { section: string; items: { id: ViewId; label: string; pic: string }[] }[] = [
  { section: "Espace", items: [
    { id: "mission", label: "Mission", pic: "dashboard" },
    { id: "scheduled", label: "Planifié", pic: "calendar" },
    { id: "agents", label: "Agents", pic: "users" },
    { id: "chat", label: "Chat", pic: "message-text" },
    { id: "inbox", label: "Inbox", pic: "inbox" },
    { id: "runs", label: "Runs", pic: "terminal" },
    { id: "board", label: "Tableau", pic: "list" },
    { id: "deliverables", label: "Livrables", pic: "folder" },
  ]},
  { section: "Intelligence", items: [
    { id: "memories", label: "Brain", pic: "notebook" },
    { id: "skills", label: "Skills", pic: "command" },
    { id: "memory", label: "Mémoire", pic: "memory-stick" },
    { id: "context", label: "Contexte", pic: "article" },
    { id: "brand", label: "Marque", pic: "bookmark" },
    { id: "hive", label: "Hive Mind", pic: "share" },
    { id: "usage", label: "Usage", pic: "chart-bar" },
    { id: "audit", label: "Audit", pic: "shield" },
    { id: "history", label: "Historique", pic: "clock" },
  ]},
  { section: "Collaborer", items: [{ id: "warroom", label: "War Room", pic: "sword" }] },
  { section: "Configurer", items: [
    { id: "integrations", label: "Intégrations", pic: "blocks" },
    { id: "settings", label: "Réglages", pic: "settings-2" },
  ]},
];
const ALL_ITEMS = nav.flatMap((g) => g.items);

const VIEW_META: Record<ViewId, { title: string; pic: string; w: number; h: number }> = {
  mission: { title: "MISSION", pic: "dashboard", w: 960, h: 640 },
  scheduled: { title: "PLANIFIE", pic: "calendar", w: 780, h: 520 },
  agents: { title: "AGENTS", pic: "users", w: 900, h: 600 },
  chat: { title: "CHAT", pic: "message-text", w: 720, h: 580 },
  inbox: { title: "INBOX", pic: "inbox", w: 760, h: 600 },
  runs: { title: "RUNS", pic: "terminal", w: 860, h: 640 },
  board: { title: "TABLEAU", pic: "list", w: 1000, h: 640 },
  deliverables: { title: "LIVRABLES", pic: "folder", w: 900, h: 620 },
  memories: { title: "BRAIN", pic: "notebook", w: 920, h: 640 },
  skills: { title: "SKILLS", pic: "command", w: 920, h: 620 },
  memory: { title: "MEMOIRE", pic: "memory-stick", w: 880, h: 640 },
  context: { title: "CONTEXTE", pic: "article", w: 880, h: 640 },
  brand: { title: "MARQUE", pic: "bookmark", w: 820, h: 560 },
  hive: { title: "HIVE MIND", pic: "share", w: 880, h: 620 },
  usage: { title: "USAGE", pic: "chart-bar", w: 800, h: 460 },
  audit: { title: "AUDIT", pic: "shield", w: 760, h: 540 },
  history: { title: "HISTORIQUE", pic: "clock", w: 860, h: 620 },
  warroom: { title: "WAR ROOM", pic: "sword", w: 900, h: 600 },
  integrations: { title: "INTEGRATIONS", pic: "blocks", w: 920, h: 620 },
  settings: { title: "REGLAGES", pic: "settings-2", w: 720, h: 620 },
};

const agentIcon: Record<string, typeof Bot> = {
  "strategist-agent": Sparkles, "operations-agent": Zap, "sales-agent": TrendingUp,
  "reporting-agent": LayoutGrid, "support-agent": Users,
};
const iconFor = (slug: string) => agentIcon[slug] ?? Bot;

const statusMeta: Record<Status, { label: string; dot: string; text: string }> = {
  running: { label: "En cours", dot: "bg-[var(--accent)]", text: "text-[var(--accent)]" },
  queued: { label: "En file", dot: "bg-[var(--warning)]", text: "text-[var(--warning)]" },
  blocked: { label: "Bloqué", dot: "bg-[var(--destructive)]", text: "text-[var(--destructive)]" },
  done: { label: "Terminé", dot: "bg-[var(--text-muted)]", text: "text-[var(--text-muted)]" },
};
const prioDot: Record<string, string> = { high: "bg-[var(--destructive)]", med: "bg-[var(--warning)]", low: "bg-[var(--text-muted)]" };
const loadDot: Record<string, string> = { high: "bg-[var(--destructive)]", med: "bg-[var(--warning)]", low: "bg-[var(--accent)]" };

/* ─── inner panels (pixel group boxes) ─── */
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`win-flat ${className}`}>{children}</div>;
}
function PanelHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[var(--border)]">
      <h3 className="font-display text-[9px] uppercase">{title}</h3>
      {action}
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center h-60 text-center gap-3">
      <div className="w-12 h-12 border-2 border-[var(--border)] grid place-items-center"><PixelIcon name="inbox" size={24} /></div>
      <p className="text-base text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

/* ─── desktop icon ─── */
function DesktopIcon({ pic, label, onOpen }: { pic: string; label: string; onOpen: () => void }) {
  return (
    <button onDoubleClick={onOpen} onClick={onOpen} data-sfx="open"
      className="w-[88px] flex flex-col items-center gap-1.5 p-2 group select-none focus:outline-none">
      <span className="w-12 h-12 grid place-items-center border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] group-hover:bg-[var(--accent)] group-hover:text-[#1b1b1b] transition-colors" style={{ boxShadow: "2px 2px 0 0 var(--border)" }}>
        <PixelIcon name={pic} size={26} />
      </span>
      <span className="text-sm text-center leading-tight px-1 group-hover:bg-[var(--accent)] group-hover:text-[#1b1b1b]">{label}</span>
    </button>
  );
}

/* ─── clock ─── */
function Clock() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    f(); const id = setInterval(f, 10000); return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm px-2 border-l-2 border-[var(--border)] ml-1">{t}</span>;
}

type Win = { id: ViewId; z: number; max: boolean; min: boolean };
type Rect = { x: number; y: number; w: number; h: number };

/* Tiling : range les fenêtres visibles en grille, qui se réajuste à chaque ouverture/fermeture. */
function tileRect(i: number, n: number, W: number, H: number): Rect {
  const gap = 8, pad = 8;
  const maxCols = Math.max(1, Math.floor(W / 360));
  const cols = Math.min(Math.ceil(Math.sqrt(n)), maxCols);
  const rows = Math.ceil(n / cols);
  const row = Math.floor(i / cols);
  const itemsInRow = row === rows - 1 ? n - cols * (rows - 1) : cols;
  const col = i - row * cols;
  const availW = W - pad * 2 - gap * (itemsInRow - 1);
  const availH = H - pad * 2 - gap * (rows - 1);
  const tileW = availW / itemsInRow;
  const tileH = availH / rows;
  return { x: pad + col * (tileW + gap), y: pad + row * (tileH + gap), w: tileW, h: tileH };
}

const WIN_Z_BASE = 10;
/**
 * Re-pack window z-indices into a compact band [WIN_Z_BASE, +N) with `id` on top.
 * Keeps windows below overlays (dropdowns z-9999, modals z-50+) no matter how many
 * times they are focused, instead of an ever-growing counter that climbs over them.
 */
function bringToFront(wins: Win[], id: ViewId): Win[] {
  const ordered = [...wins].sort((a, b) => a.z - b.z).filter((w) => w.id !== id);
  const top = wins.find((w) => w.id === id);
  const order = top ? [...ordered, top] : ordered;
  return wins.map((w) => ({ ...w, z: WIN_Z_BASE + order.findIndex((o) => o.id === w.id) }));
}

/* ─── auto-tiled window ─── */
function PixWindow({
  win, rect, active, onFocus, onClose, onMin, onMax, children,
}: {
  win: Win; rect: Rect; active: boolean;
  onFocus: () => void; onClose: () => void; onMin: () => void; onMax: () => void;
  children: React.ReactNode;
}) {
  const tr = useT();
  const m = VIEW_META[win.id];
  const style: React.CSSProperties = win.max
    ? { left: 6, top: 6, right: 6, bottom: 6, zIndex: win.z }
    : { left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: win.z, transition: "left .16s ease, top .16s ease, width .16s ease, height .16s ease" };
  return (
    <div className="absolute win flex flex-col" style={style} onMouseDown={onFocus}>
      <div className={`win-title ${active ? "" : "opacity-70"}`} onDoubleClick={onMax}>
        <span className="flex items-center gap-1.5 truncate"><PixelIcon name={m.pic} size={11} /> {m.title}</span>
        <span className="flex items-center gap-1 shrink-0">
          <button className="win-btn" data-sfx="min" onClick={(e) => { e.stopPropagation(); onMin(); }} aria-label={tr("console.minimize", "Réduire")}>_</button>
          <button className="win-btn" data-sfx="max" onClick={(e) => { e.stopPropagation(); onMax(); }} aria-label={tr("console.maximize", "Agrandir")}>o</button>
          <button className="win-btn" data-sfx="close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label={tr("console.close", "Fermer")}>x</button>
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-[var(--bg-card)] p-3 md:p-4">{children}</div>
    </div>
  );
}

export default function Console({ data }: { data: InstanceData }) {
  const tr = useT();
  const router = useRouter();
  const { settings, update, reset } = useSettings();
  const deskRef = useRef<HTMLDivElement>(null);

  const [windows, setWindows] = useState<Win[]>([]);
  const [deskSize, setDeskSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1280, h: typeof window !== "undefined" ? window.innerHeight - 68 : 700 });
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addPrefill, setAddPrefill] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [taskModal, setTaskModal] = useState<null | "new" | InstanceData["tasks"][number]>(null);
  const [menuHint, setMenuHint] = useState(false);

  const openWindow = (id: ViewId) => setWindows((prev) => {
    const base = prev.some((w) => w.id === id)
      ? prev.map((w) => (w.id === id ? { ...w, min: false } : w))
      : [...prev, { id, z: 0, max: false, min: false }];
    return bringToFront(base, id);
  });
  const focusWindow = (id: ViewId) => setWindows((prev) => bringToFront(prev.map((w) => (w.id === id ? { ...w, min: false } : w)), id));
  const closeWindow = (id: ViewId) => setWindows((prev) => prev.filter((w) => w.id !== id));
  const toggleMin = (id: ViewId) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, min: !w.min } : w)));
  const toggleMax = (id: ViewId) => setWindows((prev) => bringToFront(prev.map((w) => (w.id === id ? { ...w, max: !w.max } : w)), id));

  // ⌘K palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Taille du bureau (pour recalculer la grille de fenêtres à l'ouverture/fermeture/resize).
  useEffect(() => {
    const el = deskRef.current;
    if (!el) return;
    const update = () => setDeskSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Astuce "Menu" : montrée une fois, puis mémorisée.
  useEffect(() => {
    try { if (!localStorage.getItem("aios.menuHint")) setMenuHint(true); } catch { /* ignore */ }
  }, []);
  const dismissHint = () => { setMenuHint(false); try { localStorage.setItem("aios.menuHint", "1"); } catch { /* ignore */ } };

  // Boot: bureau vide par défaut. On ouvre une fenêtre seulement si l'URL le demande (?view=brain, via Clio).
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const closeTutorial = () => { setTutorialOpen(false); try { localStorage.setItem("aiforeveryone.tutorial.seen", "1"); } catch { /* no storage */ } };

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("view");
    const alias: Record<string, ViewId> = { brain: "memories", memory: "memories" };
    const valid = ALL_ITEMS.map((i) => i.id);
    const target = (raw && (alias[raw] ?? (raw as ViewId))) || null;
    if (target && valid.includes(target)) openWindow(target);
    else openWindow("runs"); // greet with the live agentic Runs window so the fusion is front-and-centre
    try { if (!localStorage.getItem("aiforeveryone.tutorial.seen")) setTutorialOpen(true); } catch { /* no storage */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = (prefill?: string) => { setAddPrefill(prefill); setAddOpen(true); };

  const onlineAgents = data.agents.filter((a) => a.status === "online");
  const counts = useMemo(() => ({
    active: data.tasks.filter((t) => t.status === "running").length,
    queued: data.tasks.filter((t) => t.status === "queued").length,
    total: data.tasks.length,
  }), [data.tasks]);
  const filteredTasks = useMemo(
    () => data.tasks.filter((t) => (t.title + t.agent).toLowerCase().includes(query.toLowerCase())),
    [data.tasks, query]
  );

  async function toggleKill(slug: string, killed: boolean) {
    setBusy(true);
    await fetch("/api/agents", { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: data.id, slug, killed }) });
    setBusy(false);
    toast[killed ? "warning" : "success"](killed ? tr("console.agentStopped", "Agent arrêté") : tr("console.agentReactivated", "Agent réactivé"), { description: slug });
    play(killed ? "error" : "success");
    router.refresh();
  }

  /* ─── per-view content (rendered inside windows) ─── */
  function renderView(v: ViewId): React.ReactNode {
    switch (v) {
      case "mission":
        return (
          <div className="space-y-4">
            <EngineKpis onOpen={(v) => openWindow(v as ViewId)} />

            <RecentActivity onOpen={() => openWindow("runs")} />

            <AgentInsights data={data} onCreate={(name) => openAdd(name)} />

            {data.personality && (
              <Panel className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="font-display text-[9px] uppercase">{tr("console.businessPersonality", "Business Personality")}</h3>
                </div>
                <p className="text-base text-[var(--text-muted)] leading-snug mb-4">{data.personality.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-[var(--text-muted)] uppercase mb-2">{tr("console.dominantFunctions", "Fonctions dominantes")}</p>
                    <div className="space-y-1.5">
                      {(() => {
                        const total = Object.values(data.personality.functions).reduce((a, b) => a + b, 0) || 1;
                        return Object.entries(data.personality.functions).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f, n]) => (
                          <div key={f} className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-muted)] w-24 shrink-0 truncate">{f}</span>
                            <div className="flex-1 h-2.5 border-2 border-[var(--border)] overflow-hidden">
                              <div className="h-full bg-[var(--accent)]" style={{ width: `${(n / total) * 100}%` }} />
                            </div>
                            <span className="text-sm text-[var(--text-muted)] w-8 text-right">{Math.round((n / total) * 100)}%</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)] uppercase mb-2">{tr("console.voiceTraits", "Traits de voix")}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {data.personality.traits.map((t) => <Badge key={t} variant="default">{t}</Badge>)}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] uppercase mb-2">{tr("console.connectedTools", "Outils connectés")} · {data.personality.tools.length}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.personality.tools.map((t) => <Badge key={t.name} variant="secondary">{t.name}</Badge>)}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel className="xl:col-span-2">
                <PanelHead title={tr("console.tasks", "Tâches")} action={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 h-7 border-2 border-[var(--border)]">
                      <Search className="w-3 h-3 text-[var(--text-muted)]" />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("console.filter", "Filtrer")}
                        className="bg-transparent text-sm placeholder:text-[var(--text-muted)] outline-none w-16 sm:w-24" />
                    </div>
                    <button className="pbtn pbtn-sm pbtn-primary" onClick={() => setTaskModal("new")}><Plus className="w-3 h-3" /> {tr("console.task", "Tâche")}</button>
                  </div>
                } />
                <div className="divide-y-2 divide-[var(--border)]">
                  {filteredTasks.map((t) => {
                    const sm = statusMeta[t.status];
                    return (
                      <button key={t.id} onClick={() => setTaskModal(t)} className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-card-hover)] transition-colors">
                        <span className={`w-2 h-2 shrink-0 ${prioDot[t.prio]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-base truncate">{t.title}</p>
                          <p className="text-sm text-[var(--text-muted)]">{t.agent || tr("console.unassigned", "Non assigné")} · {t.when}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-sm ${sm.text} shrink-0`}>
                          <span className={`w-2 h-2 ${sm.dot} ${t.status === "running" ? "pulse-dot" : ""}`} />{sm.label}
                        </span>
                      </button>
                    );
                  })}
                  {filteredTasks.length === 0 && <Empty label={tr("console.noMatchingTask", "Aucune tâche ne correspond.")} />}
                </div>
              </Panel>

              <div className="space-y-4">
                <Panel>
                  <PanelHead title={tr("console.agents", "Agents")} />
                  <div className="divide-y-2 divide-[var(--border)]">
                    {onlineAgents.map((a) => {
                      const Icon = iconFor(a.slug);
                      return (
                        <div key={a.slug} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="w-7 h-7 border-2 border-[var(--border)] grid place-items-center shrink-0"><Icon className="w-3.5 h-3.5 text-[var(--accent)]" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base">{a.display}</p>
                            <p className="text-sm text-[var(--text-muted)] truncate">{a.task}</p>
                          </div>
                          <span className={`w-2 h-2 shrink-0 ${loadDot[a.load]}`} />
                        </div>
                      );
                    })}
                  </div>
                </Panel>
                <Panel>
                  <PanelHead title={tr("console.alerts", "Alertes")} />
                  <div className="p-2.5 space-y-2">
                    {data.alerts.map((al, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 border-2 border-[var(--border)]">
                        <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${al.level === "red" ? "text-[var(--destructive)]" : "text-[var(--warning)]"}`} />
                        <p className="text-sm text-[var(--text-muted)] leading-snug">{al.text}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        );

      case "scheduled": return <Scheduled />;

      case "agents": return <Agents />;

      case "memories": return <Brain instanceId={data.id} />;
      case "runs": return <Runs />;
      case "board": return <Board />;
      case "deliverables": return <Deliverables />;
      case "history": return <History />;
      case "skills": return <Skills />;
      case "memory": return <Memory />;
      case "context": return <Context />;
      case "brand": return <Brand />;
      case "hive": return <HiveGraph />;
      case "warroom": return <WarRoom />;
      case "chat": return <Chat instanceId={data.id} name={data.name} />;
      case "inbox": return <Inbox />;
      case "integrations": return <Integrations instanceId={data.id} onConnectBrain={() => openWindow("memories")} />;

      case "usage": return <Usage />;

      case "audit": return <Audit />;

      case "settings":
        return (
          <div className="space-y-4 max-w-2xl">
            <EngineSettings />
            <Panel className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[9px] uppercase">{tr("console.themeAndBrand", "Thème & marque")}</h3>
                <button className="pbtn pbtn-sm" onClick={reset}><RotateCcw className="w-3 h-3" /> {tr("console.reset", "Reset")}</button>
              </div>
              <p className="text-sm text-[var(--text-muted)] uppercase mb-2">{tr("console.accentColor", "Couleur d'accent")}</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {ACCENT_PRESETS.map((p) => (
                  <button key={p.hex} onClick={() => update({ accent: p.hex })} title={p.name}
                    className={`w-8 h-8 border-2 ${settings.accent.toLowerCase() === p.hex.toLowerCase() ? "border-[var(--text)]" : "border-[var(--border)]"}`}
                    style={{ background: p.hex }} />
                ))}
                <label className="flex items-center gap-2 ml-1">
                  <input type="color" value={settings.accent} onChange={(e) => update({ accent: e.target.value })} className="w-8 h-8 bg-transparent border-2 border-[var(--border)] cursor-pointer" />
                  <span className="text-sm font-mono text-[var(--text-muted)]">{settings.accent}</span>
                </label>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm text-[var(--text-muted)] uppercase">{tr("console.scale", "Échelle")}</p>
                  <span className="text-sm font-mono text-[var(--text-muted)]">{settings.scale}%</span>
                </div>
                <input type="range" min={85} max={125} step={5} value={settings.scale} onChange={(e) => update({ scale: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)] uppercase mb-1.5">{tr("console.defaultModel", "Modèle par défaut")}</p>
                <select value={settings.model} onChange={(e) => update({ model: e.target.value })} className="modal-input font-mono">
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </Panel>

            <Panel>
              <PanelHead title={tr("console.instance", "Instance")} />
              <div className="divide-y-2 divide-[var(--border)]">
                {[
                  { k: tr("console.folder", "Dossier"), v: `clients/${data.id}` },
                  { k: tr("console.personalityScannedOn", "Personality scannée le"), v: data.personality?.scannedAt ?? "—" },
                  { k: tr("console.systemMaturity", "Maturité du système"), v: data.personality?.maturity ?? "—" },
                  { k: tr("console.agents", "Agents"), v: `${data.agents.length} (${onlineAgents.length} ${tr("console.online", "en ligne")})` },
                  { k: tr("console.connectedTools", "Outils connectés"), v: data.personality?.tools.map((t) => t.name).join(" · ") ?? "—" },
                  { k: tr("console.outboundActionValidation", "Validation actions sortantes"), v: tr("console.enabled", "Activée") },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between px-3 py-3 gap-4">
                    <span className="text-sm text-[var(--text-muted)] shrink-0">{row.k}</span>
                    <span className="text-sm text-right truncate font-mono">{row.v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        );
    }
  }

  const topZ = Math.max(0, ...windows.filter((w) => !w.min).map((w) => w.z));

  return (
    <div className="os-desktop h-screen w-screen overflow-hidden flex flex-col text-[var(--text)]">
      {/* ─── MENU BAR ─── */}
      <div className="h-8 shrink-0 flex items-center justify-between bg-[var(--bg-card)] border-b-2 border-[var(--border)] text-base">
        <div className="flex items-center h-full">
          <span className="font-display text-[9px] px-3 flex items-center gap-1.5"><PixelIcon name="computer" size={14} className="text-[var(--accent)]" /> <span className="hidden sm:inline">AIFOREVERYONE.OS</span></span>
          <MenuDropdown label={tr("console.file", "Fichier")} items={[
            { label: tr("console.newAgent", "Nouvel agent"), pic: "user-plus", onSelect: () => openAdd() },
            { label: tr("console.newTask", "Nouvelle tâche"), pic: "note-plus", onSelect: () => setTaskModal("new") },
            { label: tr("console.palette", "Palette (⌘K)"), pic: "search", onSelect: () => setPaletteOpen(true) },
          ]} />
          <div className="relative">
            {menuHint && (
              <div className="absolute top-full left-0 mt-2 w-64 win p-2.5 z-[9999] animate-fade-in-up">
                <div className="flex items-start gap-2">
                  <PixelIcon name="arrow-up" size={18} className="text-[var(--accent)] mt-0.5 shrink-0 blink" />
                  <p className="text-sm leading-snug">{tr("console.menuHintBefore", "Ouvre tes fenêtres ici, dans")} <span className="text-[var(--accent)]">{tr("console.view", "Affichage")}</span>{tr("console.menuHintAfter", ". Elles se rangent toutes seules en grille.")}</p>
                </div>
                <button onClick={dismissHint} className="pbtn pbtn-sm pbtn-primary w-full mt-2">{tr("console.gotIt", "Compris")}</button>
              </div>
            )}
            <MenuDropdown label={tr("console.view", "Affichage")} onOpen={dismissHint} items={ALL_ITEMS.map((i) => ({ label: i.label, pic: i.pic, onSelect: () => openWindow(i.id) }))} />
          </div>
        </div>
        <div className="flex items-center h-full pr-1 gap-1">
          <button onClick={() => setTutorialOpen(true)} title={tr("console.tutorial", "Tutoriel")} aria-label={tr("console.tutorial", "Tutoriel")} className="hidden sm:flex items-center justify-center w-6 h-6 border-2 border-[var(--border)] hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors"><span className="font-display text-[9px]">?</span></button>
          <AttentionBell onOpen={() => openWindow("runs")} />
          <PanicButton />
          <EngineStatus />
          <SoundToggle />
          <ThemeToggle />
          <Clock />
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div ref={deskRef} className="relative flex-1 overflow-hidden">
        {/* icons */}
        <div className="absolute top-3 left-2 flex flex-col flex-wrap gap-1 max-h-[calc(100%-1.5rem)] content-start">
          {ALL_ITEMS.map((i) => <DesktopIcon key={i.id} pic={i.pic} label={i.label} onOpen={() => openWindow(i.id)} />)}
          <DesktopIcon pic="zap" label="Nouvel agent" onOpen={() => openAdd()} />
        </div>

        {/* windows — auto-tiled grid */}
        {(() => {
          const vis = windows.filter((w) => !w.min);
          return vis.map((w, i) => (
            <PixWindow key={w.id} win={w} rect={tileRect(i, vis.length, deskSize.w, deskSize.h)} active={w.z === topZ}
              onFocus={() => focusWindow(w.id)} onClose={() => closeWindow(w.id)}
              onMin={() => toggleMin(w.id)} onMax={() => toggleMax(w.id)}>
              {renderView(w.id)}
            </PixWindow>
          ));
        })()}
      </div>

      {/* ─── TASKBAR ─── */}
      <div className="h-9 shrink-0 flex items-center gap-1 px-1.5 bg-[var(--bg-card)] border-t-2 border-[var(--border)]">
        <div className="shrink-0">
          <DropdownMenu onOpenChange={(o) => o && dismissHint()}>
            <DropdownMenuTrigger asChild>
              <button className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="menu" size={12} /> {tr("console.menu", "Menu")}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuLabel>{data.name}</DropdownMenuLabel>
              {ALL_ITEMS.map((i) => (
                <DropdownMenuItem key={i.id} onClick={() => openWindow(i.id)}><PixelIcon name={i.pic} size={16} /> {i.label}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openAdd()}><PixelIcon name="user-plus" size={16} /> {tr("console.newAgent", "Nouvel agent")}</DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/"><PixelIcon name="external-link" size={16} /> {tr("console.website", "Site web")}</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {windows.map((w) => (
            <button key={w.id} onClick={() => (w.min ? focusWindow(w.id) : w.z === topZ ? toggleMin(w.id) : focusWindow(w.id))}
              className={`flex items-center gap-1.5 px-2 h-7 border-2 border-[var(--border)] text-sm shrink-0 max-w-[160px] ${w.z === topZ && !w.min ? "bg-[var(--accent)] text-[#1b1b1b]" : "bg-[var(--bg)]"}`}>
              <PixelIcon name={VIEW_META[w.id].pic} size={13} /> <span className="truncate">{VIEW_META[w.id].title}</span>
            </button>
          ))}
        </div>
        <Clock />
      </div>

      {/* ─── COMMAND PALETTE ─── */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder={tr("console.palettePlaceholder", "Aller à… ou exécuter une action")} />
        <CommandList>
          <CommandEmpty>{tr("console.noResult", "Aucun résultat.")}</CommandEmpty>
          {nav.map((group) => (
            <CommandGroup key={group.section} heading={group.section}>
              {group.items.map((item) => (
                <CommandItem key={item.id} onSelect={() => { openWindow(item.id); setPaletteOpen(false); }}>
                  <PixelIcon name={item.pic} size={16} /> {item.label}
                  {windows.some((w) => w.id === item.id && !w.min) && <CommandShortcut>{tr("console.open", "ouvert")}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading={tr("console.actions", "Actions")}>
            <CommandItem onSelect={() => { openAdd(); setPaletteOpen(false); }}><PixelIcon name="user-plus" size={16} /> {tr("console.newAgent", "Nouvel agent")}</CommandItem>
            <CommandItem onSelect={() => { openWindow("settings"); setPaletteOpen(false); }}><PixelIcon name="settings-2" size={16} /> {tr("console.settings", "Réglages")}</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ─── TUTORIEL ─── */}
      <Tutorial open={tutorialOpen} onClose={closeTutorial} />

      {/* ─── ADD AGENT ─── */}
      <AddAgentModal
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) setAddPrefill(undefined); }}
        id={data.id}
        initialName={addPrefill}
        defaultModel={settings.model}
        onCreated={(slug) => { setAddOpen(false); setAddPrefill(undefined); toast.success(tr("console.agentCreated", "Agent créé"), { description: slug }); play("success"); router.refresh(); }}
      />

      {/* ─── TASK CREATE / EDIT ─── */}
      <TaskModal
        taskModal={taskModal}
        instanceId={data.id}
        agentNames={data.agents.map((a) => a.display)}
        onClose={() => setTaskModal(null)}
        onDone={() => { setTaskModal(null); router.refresh(); }}
      />
    </div>
  );
}

/* ─── menu-bar dropdown ─── */
function MenuDropdown({ label, items, onOpen }: { label: string; items: { label: string; pic: string; onSelect: () => void }[]; onOpen?: () => void }) {
  return (
    <DropdownMenu onOpenChange={(o) => o && onOpen?.()}>
      <DropdownMenuTrigger asChild>
        <button className="h-8 px-3 text-base hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors outline-none">{label}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-[70vh] overflow-auto">
        {items.map((it) => (
          <DropdownMenuItem key={it.label} onClick={it.onSelect}><PixelIcon name={it.pic} size={16} /> {it.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm text-[var(--text-muted)] mb-1.5 block uppercase">{label}</span>{children}</label>;
}

/* ─── Add agent modal ─── */
function AddAgentModal({
  open, onOpenChange, id, initialName, defaultModel, onCreated,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; id: string;
  initialName?: string; defaultModel: string; onCreated: (slug: string) => void;
}) {
  const tr = useT();
  const kebab = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const [form, setForm] = useState({ name: "", displayName: "", description: "", model: defaultModel });
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ slug: string; env: string } | null>(null);

  useEffect(() => {
    if (open) {
      setCreated(null);
      setForm({ name: initialName ? `${kebab(initialName)}-agent` : "", displayName: initialName ?? "", description: "", model: defaultModel });
    }
  }, [open, initialName, defaultModel]);

  async function submit() {
    if (!form.displayName.trim()) return;
    setBusy(true);
    const res = await fetch("/api/agents", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form, name: form.name || form.displayName }),
    });
    const json = await res.json();
    setBusy(false);
    if (json.ok) setCreated({ slug: json.slug, env: `${json.slug.toUpperCase().replace(/-/g, "_")}_BOT_TOKEN` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{tr("console.agentCreated", "Agent créé")}</DialogTitle>
              <DialogDescription>{tr("console.personaWrittenToDisk", "Persona et config écrits sur le disque.")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-base text-[var(--text-muted)]">
                <span className="text-[var(--text)] font-mono">{created.slug}</span> : <code className="text-[var(--accent)] font-mono">03-agents/{created.slug}.md</code> + <code className="text-[var(--accent)] font-mono">{created.slug}.config.yaml</code>.
              </p>
              <div className="border-2 border-[var(--border)] bg-[var(--bg)] p-3">
                <p className="text-sm text-[var(--text-muted)] mb-1">{tr("console.plugBotToken", "Branche ton bot token Telegram :")}</p>
                <code className="text-base text-[var(--accent)] break-all font-mono">{created.env}=&lt;ton_token&gt;</code>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onCreated(created.slug)}>{tr("console.done", "Terminé")}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{tr("console.newAgent", "Nouvel agent")}</DialogTitle>
              <DialogDescription>{tr("console.newAgentDescription", "Crée un agent spécialisé avec son propre persona et modèle.")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field label={tr("console.technicalNameSlug", "Nom technique (slug)")}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="finance-agent" className="font-mono" /></Field>
              <Field label={tr("console.displayName", "Nom affiché *")}><Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Finance" /></Field>
              <Field label={tr("console.description", "Description")}><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder={tr("console.agentDescriptionPlaceholder", "Planification financière, MRR, budgets…")} className="modal-input resize-none" /></Field>
              <Field label={tr("console.defaultModel", "Modèle par défaut")}>
                <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="modal-input font-mono">{MODELS.map((m) => <option key={m}>{m}</option>)}</select>
              </Field>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{tr("console.cancel", "Annuler")}</Button>
              <Button onClick={submit} disabled={busy || !form.displayName.trim()}>{busy ? tr("console.creating", "Création…") : tr("console.createAgent", "Créer l'agent")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Task create / edit modal (real CRUD) ─── */
function TaskModal({ taskModal, instanceId, agentNames, onClose, onDone }: {
  taskModal: null | "new" | InstanceData["tasks"][number];
  instanceId: string; agentNames: string[]; onClose: () => void; onDone: () => void;
}) {
  const tr = useT();
  const editing = taskModal && taskModal !== "new" ? taskModal : null;
  const open = taskModal !== null;
  const [form, setForm] = useState({ title: "", agent: "", status: "queued", prio: "med" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) setForm({ title: editing.title, agent: editing.agent, status: editing.status, prio: editing.prio });
    else setForm({ title: "", agent: agentNames[0] ?? "", status: "queued", prio: "med" });
  }, [taskModal]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      if (editing) {
        await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, taskId: editing.id, ...form }) });
        toast.success(tr("console.taskUpdated", "Tâche mise à jour"));
      } else {
        await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, ...form }) });
        toast.success(tr("console.taskCreated", "Tâche créée"));
      }
      play("success");
      onDone();
    } finally { setBusy(false); }
  }
  async function remove() {
    if (!editing) return;
    setBusy(true);
    try {
      await fetch(`/api/tasks?id=${instanceId}&taskId=${editing.id}`, { method: "DELETE" });
      toast.message(tr("console.taskDeleted", "Tâche supprimée"));
      play("close");
      onDone();
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? tr("console.editTask", "Modifier la tâche") : tr("console.newTask", "Nouvelle tâche")}</DialogTitle>
          <DialogDescription>{tr("console.taskPersistedBefore", "Persistée dans")} <code className="font-mono">tasks.json</code>{tr("console.taskPersistedAfter", ", assignable à un agent.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label={tr("console.title", "Titre")}><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={tr("console.taskTitlePlaceholder", "Qualifier les nouveaux leads…")} onKeyDown={(e) => e.key === "Enter" && save()} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr("console.agent", "Agent")}>
              <select value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} className="modal-input">
                <option value="">{tr("console.unassigned", "Non assigné")}</option>
                {agentNames.map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label={tr("console.priority", "Priorité")}>
              <select value={form.prio} onChange={(e) => setForm({ ...form, prio: e.target.value })} className="modal-input">
                <option value="high">{tr("console.priorityHigh", "Haute")}</option><option value="med">{tr("console.priorityMed", "Moyenne")}</option><option value="low">{tr("console.priorityLow", "Basse")}</option>
              </select>
            </Field>
          </div>
          <Field label={tr("console.status", "Statut")}>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="modal-input">
              <option value="queued">{tr("console.statusQueued", "En file")}</option><option value="running">{tr("console.statusRunning", "En cours")}</option><option value="blocked">{tr("console.statusBlocked", "Bloqué")}</option><option value="done">{tr("console.statusDone", "Terminé")}</option>
            </select>
          </Field>
        </div>
        <DialogFooter className="sm:justify-between">
          {editing ? <Button variant="ghost" className="text-[var(--destructive)]" onClick={remove} disabled={busy}>{tr("console.delete", "Supprimer")}</Button> : <span />}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>{tr("console.cancel", "Annuler")}</Button>
            <Button onClick={save} disabled={busy || !form.title.trim()}>{busy ? "…" : editing ? tr("console.save", "Enregistrer") : tr("console.create", "Créer")}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
