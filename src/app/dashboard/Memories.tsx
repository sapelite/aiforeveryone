"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, FileText, Star, X, Loader2 } from "lucide-react";

type Fiche = { name: string; title: string; excerpt: string; rel: string; cat: string };
type Category = { cat: string; dir: string; files: Omit<Fiche, "cat">[] };

const PIN_KEY = "aios.pins";

export default function Memories({ instanceId }: { instanceId: string }) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pins, setPins] = useState<string[]>([]);
  const [open, setOpen] = useState<Fiche | null>(null);
  const [content, setContent] = useState<string>("");
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(PIN_KEY); if (raw) setPins(JSON.parse(raw)); } catch {}
    fetch(`/api/memories?id=${instanceId}`)
      .then((r) => r.json())
      .then((j) => setCats(j.categories ?? []))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }, [instanceId]);

  const allFiches = useMemo<Fiche[]>(
    () => cats.flatMap((c) => c.files.map((f) => ({ ...f, cat: c.cat }))),
    [cats]
  );

  const togglePin = (rel: string) =>
    setPins((p) => {
      const n = p.includes(rel) ? p.filter((x) => x !== rel) : [...p, rel];
      try { localStorage.setItem(PIN_KEY, JSON.stringify(n)); } catch {}
      return n;
    });

  async function openFiche(f: Fiche) {
    setOpen(f);
    setLoadingDoc(true);
    setContent("");
    try {
      const j = await (await fetch(`/api/memories?id=${instanceId}&file=${encodeURIComponent(f.rel)}`)).json();
      setContent(j.content ?? "(vide)");
    } catch { setContent("Erreur de chargement."); }
    finally { setLoadingDoc(false); }
  }

  const q = query.trim().toLowerCase();
  const filtered = q ? allFiches.filter((f) => (f.title + f.excerpt + f.cat).toLowerCase().includes(q)) : null;
  const pinned = allFiches.filter((f) => pins.includes(f.rel));

  if (loading) return <div className="grid place-items-center h-64 text-zinc-600"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* search */}
      <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] acc-ring max-w-md">
        <Search className="w-4 h-4 text-zinc-500" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher dans la mémoire…"
          className="flex-1 bg-transparent text-sm placeholder:text-zinc-600 outline-none" />
        <span className="text-xs text-zinc-600">{allFiches.length} fiches</span>
      </div>

      {/* search results */}
      {filtered ? (
        <FicheGrid fiches={filtered} pins={pins} onPin={togglePin} onOpen={openFiche} empty="Aucune fiche trouvée." />
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 acc-text-strong" /> Épinglées
              </h3>
              <FicheGrid fiches={pinned} pins={pins} onPin={togglePin} onOpen={openFiche} />
            </section>
          )}
          {cats.map((c) => (
            <section key={c.dir}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">{c.cat} · {c.files.length}</h3>
              <FicheGrid fiches={c.files.map((f) => ({ ...f, cat: c.cat }))} pins={pins} onPin={togglePin} onOpen={openFiche} />
            </section>
          ))}
          {cats.length === 0 && <p className="text-sm text-zinc-600">Aucune fiche dans le company-brain de cette instance.</p>}
        </>
      )}

      {/* viewer */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#101218] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{open.title}</h3>
                <p className="text-xs text-zinc-600 font-mono truncate">01-company-brain/{open.rel}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePin(open.rel)} className={`w-8 h-8 grid place-items-center rounded-lg ${pins.includes(open.rel) ? "acc-text" : "text-zinc-500 hover:text-white"}`}>
                  <Star className={`w-4 h-4 ${pins.includes(open.rel) ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => setOpen(null)} className="w-8 h-8 grid place-items-center rounded-lg text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {loadingDoc ? <Loader2 className="w-5 h-5 animate-spin text-zinc-600" /> : (
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FicheGrid({ fiches, pins, onPin, onOpen, empty }: {
  fiches: Fiche[]; pins: string[]; onPin: (rel: string) => void; onOpen: (f: Fiche) => void; empty?: string;
}) {
  if (fiches.length === 0) return empty ? <p className="text-sm text-zinc-600">{empty}</p> : null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {fiches.map((f) => (
        <div key={f.rel} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-colors">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => onOpen(f)} className="flex items-center gap-2 min-w-0 text-left">
              <FileText className="w-4 h-4 acc-text shrink-0" />
              <span className="text-sm font-medium truncate">{f.title}</span>
            </button>
            <button onClick={() => onPin(f.rel)} className={`shrink-0 ${pins.includes(f.rel) ? "acc-text" : "text-zinc-600 opacity-0 group-hover:opacity-100"} transition-opacity`}>
              <Star className={`w-3.5 h-3.5 ${pins.includes(f.rel) ? "fill-current" : ""}`} />
            </button>
          </div>
          <button onClick={() => onOpen(f)} className="block text-left w-full">
            <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{f.excerpt || "—"}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-700 mt-2">{f.cat}</p>
          </button>
        </div>
      ))}
    </div>
  );
}
