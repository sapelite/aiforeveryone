"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BrandLogo } from "./BrandLogo";
import { Loader2, Search, FileText, Plug, Save, Plus, FolderTree, Unplug } from "lucide-react";

type Note = { rel: string; title: string; dir: string };
type Status = { connected: boolean; vaultPath: string; isObsidian: boolean; connectedAt: string | null; count: number; notes: Note[] };

export default function Brain({ instanceId }: { instanceId: string }) {
  const [s, setS] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [vaultInput, setVaultInput] = useState("");
  const [connectErr, setConnectErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/brain?id=${instanceId}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setS(j); })
      .finally(() => setLoading(false));
  }, [instanceId]);

  useEffect(() => load(), [load]);

  async function openNote(n: Note) {
    setOpen(n); setDocLoading(true); setContent("");
    try {
      const j = await (await fetch(`/api/brain?id=${instanceId}&file=${encodeURIComponent(n.rel)}`)).json();
      setContent(j.content ?? "");
    } catch { setContent("Erreur de chargement."); }
    finally { setDocLoading(false); }
  }

  async function save() {
    if (!open) return;
    setSaving(true);
    try {
      const j = await (await fetch("/api/brain", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, file: open.rel, content }) })).json();
      if (j.ok) toast.success("Note enregistrée", { description: open.rel });
      else toast.error(j.error ?? "Échec");
      load();
    } finally { setSaving(false); }
  }

  async function connect() {
    setConnectErr(null); setBusy(true);
    try {
      const j = await (await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, vaultPath: vaultInput }) })).json();
      if (j.ok) { toast.success("Vault connecté", { description: `${j.count} notes${j.isObsidian ? " · vault Obsidian détecté" : ""}` }); setConnectOpen(false); setVaultInput(""); load(); }
      else setConnectErr(j.error ?? "Échec de la connexion");
    } finally { setBusy(false); }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, disconnect: true }) });
      toast.message("Vault déconnecté", { description: "Retour au Brain par défaut (company-brain)." });
      load();
    } finally { setBusy(false); }
  }

  async function createNote() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const file = name.toLowerCase().endsWith(".md") ? name : `${name}.md`;
      const j = await (await fetch("/api/brain", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: instanceId, file, content: `# ${name.replace(/\.md$/i, "")}\n\n` }) })).json();
      if (j.ok) {
        toast.success("Note créée", { description: file });
        setNewOpen(false); setNewName(""); load();
        openNote({ rel: file, title: name.replace(/\.md$/i, ""), dir: "" });
      }
    } finally { setBusy(false); }
  }

  const notes = s?.notes ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => (n.title + " " + n.rel).toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  const groups = useMemo(() => {
    const m = new Map<string, Note[]>();
    for (const n of filtered) { const k = n.dir || "/"; if (!m.has(k)) m.set(k, []); m.get(k)!.push(n); }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  if (loading) return <div className="grid place-items-center h-64 text-[var(--text-muted)]"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* connection banner */}
      <div className="rounded-3xl border-2 acc-border-soft bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl acc-bg-soft border-2 acc-border-soft grid place-items-center shrink-0">
              <BrandLogo domain="obsidian.md" name="Obsidian" size={26} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold tracking-tight">Le Brain</h3>
                {s?.connected
                  ? <Badge variant="success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {s.isObsidian ? "Vault Obsidian" : "Vault"} connecté</Badge>
                  : <Badge variant="secondary">Brain par défaut · company-brain</Badge>}
                <Badge variant="outline">{s?.count ?? 0} notes</Badge>
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mt-1.5 font-mono break-all">{s?.vaultPath}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {s?.connected && <Button variant="ghost" size="sm" disabled={busy} onClick={disconnect}><Unplug /> Déconnecter</Button>}
            <Button variant="outline" size="sm" onClick={() => { setVaultInput(s?.connected ? s.vaultPath : ""); setConnectOpen(true); }}>
              <Plug /> {s?.connected ? "Changer de vault" : "Connecter Obsidian"}
            </Button>
          </div>
        </div>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 h-10 rounded-full bg-[var(--bg-card)] border-2 border-[var(--border)] acc-ring flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une note…" className="flex-1 bg-transparent text-sm placeholder:text-[var(--text-muted)] outline-none" />
        </div>
        <Button size="sm" onClick={() => { setNewName(""); setNewOpen(true); }}><Plus /> Nouvelle note</Button>
      </div>

      {/* notes */}
      {groups.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Aucune note dans ce vault.</p>
      ) : groups.map(([dir, items]) => (
        <section key={dir}>
          <h4 className="text-[13px] font-medium text-[var(--text-muted)] mb-3 flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5" /> {dir === "/" ? "Racine" : dir}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((n) => (
              <button key={n.rel} onClick={() => openNote(n)} className="text-left rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-card)] p-4 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-light)] transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 acc-text shrink-0" />
                  <span className="text-sm font-medium truncate">{n.title}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-2 truncate">{n.rel}</p>
              </button>
            ))}
          </div>
        </section>
      ))}

      {/* editor */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{open?.rel}</DialogTitle>
            <DialogDescription>Édition en direct — l&apos;enregistrement écrit dans le vault sur le disque.</DialogDescription>
          </DialogHeader>
          {docLoading ? <div className="h-64 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" /></div> : (
            <textarea value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false}
              className="w-full h-[55vh] rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border)] p-4 text-sm font-mono leading-relaxed text-[var(--text)] outline-none focus:border-[var(--border-light)] resize-none" />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)}>Fermer</Button>
            <Button onClick={save} disabled={saving || docLoading}>{saving ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* connect dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecter un vault Obsidian</DialogTitle>
            <DialogDescription>Chemin absolu vers le dossier de votre vault. Le Brain le lira et l&apos;écrira directement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={vaultInput} onChange={(e) => setVaultInput(e.target.value)} placeholder="C:\Users\vous\Documents\MonVault" className="font-mono" onKeyDown={(e) => e.key === "Enter" && connect()} />
            {connectErr && <p className="text-xs text-red-400">{connectErr}</p>}
            <p className="text-xs text-[var(--text-muted)]">Astuce : dans Obsidian, clic droit sur le vault → « Reveal in Finder/Explorer » pour copier le chemin.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConnectOpen(false)}>Annuler</Button>
            <Button onClick={connect} disabled={busy || !vaultInput.trim()}>{busy ? "Connexion…" : "Connecter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* new note dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
            <DialogDescription>Créée dans le vault (sous-dossiers autorisés, ex. <span className="font-mono">decisions/note.md</span>).</DialogDescription>
          </DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ma-note" className="font-mono" onKeyDown={(e) => e.key === "Enter" && createNote()} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Annuler</Button>
            <Button onClick={createNote} disabled={busy || !newName.trim()}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
