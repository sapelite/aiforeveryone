"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BrandLogo } from "./BrandLogo";
import { Loader2, Plus, Check, Boxes } from "lucide-react";

type Item = {
  key: string; name: string; category: string; icon: string; domain?: string; brain?: boolean;
  desc: string; connected: boolean; detected: boolean; custom?: boolean;
};

export default function Integrations({ instanceId, onConnectBrain }: { instanceId: string; onConnectBrain?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "MCP" });

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/integrations?id=${instanceId}`)
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [instanceId]);

  useEffect(() => load(), [load]);

  async function toggle(it: Item) {
    setBusy(it.key);
    const connect = !it.connected;
    try {
      await fetch("/api/integrations", {
        method: connect ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: instanceId, key: it.key }),
      });
      toast[connect ? "success" : "message"](connect ? `${it.name} connecté` : `${it.name} déconnecté`,
        connect ? { description: it.brain ? "Vault Obsidian relié — données vivantes." : "Accès lecture activé · écriture validée." } : undefined);
      load();
    } finally { setBusy(null); }
  }

  async function addCustom() {
    if (!form.name.trim() || !form.url.trim()) return;
    setBusy("__custom");
    try {
      await fetch("/api/integrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: instanceId, custom: true, ...form }),
      });
      toast.success(`${form.name} connecté`, { description: "Serveur MCP personnalisé." });
      setAddOpen(false);
      setForm({ name: "", url: "", category: "MCP" });
      load();
    } finally { setBusy(null); }
  }

  const brain = items.find((i) => i.brain || i.key === "obsidian");
  const rest = items.filter((i) => !(i.brain || i.key === "obsidian"));
  const connected = rest.filter((i) => i.connected);
  const available = rest.filter((i) => !i.connected);

  if (loading) return <div className="grid place-items-center h-64 text-[var(--text-muted)]"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* ─── BRAIN (Obsidian) — the living vault ─── */}
      {brain && (
        <div className="rounded-2xl border-2 acc-border-soft bg-[var(--bg-card)] p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full acc-bg-soft blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl acc-bg-soft border-2 acc-border-soft grid place-items-center shrink-0">
                <BrandLogo domain={brain.domain} name="Obsidian" size={26} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-lg font-semibold">Le Brain</h3>
                  <Badge variant="default">Obsidian · vault vivant</Badge>
                  {brain.connected && <Badge variant="success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> relié</Badge>}
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl leading-relaxed">
                  Le cerveau de l&apos;entreprise : un vault Obsidian où chaque fiche, décision et mémoire est liée. Vos agents le <span className="text-[var(--text)]">lisent et l&apos;enrichissent en continu</span> — c&apos;est lui qui garde toutes vos données vivantes et à jour.
                </p>
              </div>
            </div>
            <Button onClick={() => onConnectBrain?.()} className="shrink-0">Ouvrir le Brain →</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
          Connecte les outils via <span className="acc-text font-medium">MCP</span>. Tes agents y gagnent un accès en <span className="text-[var(--text)]">lecture</span> (et <span className="text-[var(--text)]">écriture validée</span>). Les outils détectés à l&apos;ingestion sont signalés.
        </p>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="shrink-0"><Plus /> MCP personnalisé</Button>
      </div>

      {connected.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] font-mono mb-3 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Connectés · {connected.length}
          </h3>
          <Grid items={connected} busy={busy} onToggle={toggle} />
        </section>
      )}

      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] font-mono mb-3 flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5" /> Disponibles · {available.length}
        </h3>
        <Grid items={available} busy={busy} onToggle={toggle} />
      </section>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Serveur MCP personnalisé</DialogTitle>
            <DialogDescription>Connecte n&apos;importe quel serveur MCP par son URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block"><span className="text-xs text-[var(--text-muted)] mb-1.5 block">Nom</span>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mon outil interne" /></label>
            <label className="block"><span className="text-xs text-[var(--text-muted)] mb-1.5 block">URL du serveur MCP</span>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://mcp.exemple.com/sse" className="font-mono" /></label>
            <label className="block"><span className="text-xs text-[var(--text-muted)] mb-1.5 block">Catégorie</span>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="CRM, Données…" /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={addCustom} disabled={busy === "__custom" || !form.name.trim() || !form.url.trim()}>
              {busy === "__custom" ? "Connexion…" : "Connecter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Grid({ items, busy, onToggle }: { items: Item[]; busy: string | null; onToggle: (i: Item) => void }) {
  if (items.length === 0) return <p className="text-sm text-[var(--text-muted)]">Aucun connecteur.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.key} className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] p-5 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border)] grid place-items-center">
              <BrandLogo domain={it.domain} name={it.name} size={22} />
            </div>
            {it.connected
              ? <Badge variant="success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> connecté</Badge>
              : it.detected
                ? <Badge variant="warning">détecté</Badge>
                : <Badge variant="secondary">{it.category}</Badge>}
          </div>
          <p className="font-display font-semibold">{it.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4 flex-1 leading-relaxed break-words">{it.desc}</p>
          <Button
            variant={it.connected ? "outline" : "default"}
            size="sm"
            disabled={busy === it.key}
            onClick={() => onToggle(it)}
            className={it.connected ? "w-full border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]" : "w-full"}
          >
            {busy === it.key ? <Loader2 className="animate-spin" /> : it.connected ? "Déconnecter" : "Connecter"}
          </Button>
        </div>
      ))}
    </div>
  );
}
