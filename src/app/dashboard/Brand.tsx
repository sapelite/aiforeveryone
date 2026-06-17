"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

type Brand = { hasBrandContext: boolean; files: { voiceProfile: boolean; positioning: boolean; icp: boolean } };
type Piece = { key: "voiceProfile" | "positioning" | "icp"; label: string; file: string; desc: string };
type Preview = { content: string | null; truncated: boolean; binary: boolean };

const PIECES: Piece[] = [
  { key: "voiceProfile", label: "Voix de marque", file: "brand_context/voice-profile.md", desc: "Ton, style et vocabulaire de votre marque." },
  { key: "positioning", label: "Positionnement", file: "brand_context/positioning.md", desc: "Ce qui vous distingue sur le marché." },
  { key: "icp", label: "Client idéal", file: "brand_context/icp.md", desc: "Le profil de votre client cible." },
];

export default function Brand() {
  const tr = useT();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [open, setOpen] = useState<Piece | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState<string | null>(null);

  const load = () => fetch("/api/engine/brand").then((r) => r.json()).then(setBrand).catch(() => setBrand({ hasBrandContext: false, files: { voiceProfile: false, positioning: false, icp: false } }));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openFile(p: Piece) {
    setOpen(p); setPreview(null);
    fetch(`/api/engine/file?path=${encodeURIComponent(p.file)}`).then((r) => r.json()).then(setPreview).catch(() => setPreview({ content: null, truncated: false, binary: false }));
  }

  async function build() {
    setLaunching(true);
    try {
      const goal = "Construis la fondation de marque : voix de marque, positionnement et client idéal. Utilise les skills mkt-brand-voice, mkt-positioning et mkt-icp, puis sauvegarde les livrables dans brand_context/ (voice-profile.md, positioning.md, icp.md).";
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, model: "auto", permissionMode: "acceptEdits" }) });
      const j = await res.json();
      if (j.ok) setLaunched(j.taskId);
    } catch { /* offline */ }
    finally { setLaunching(false); }
  }

  if (brand === null) return <p role="status" className="text-base text-[var(--text-muted)]">{tr("brand.loading", "chargement de la marque")}<span className="blink">_</span></p>;

  const defined = PIECES.filter((p) => brand.files[p.key]).length;

  return (
    <div className="space-y-4">
      <div className="win-flat p-3">
        <p className="text-base leading-snug">{defined === 3 ? tr("brand.foundationComplete", "Votre fondation de marque est complète. Les agents s'appuient dessus pour rester cohérents.") : `${defined}${tr("brand.foundationProgress", "/3 éléments définis. Complétez la fondation pour que les agents écrivent dans votre voix.")}`}</p>
        {launched && <p className="text-sm text-[var(--accent)] mt-2">{tr("brand.agentLaunchedPrefix", "Agent lancé (tâche")} {launched.slice(0, 8)}{tr("brand.agentLaunchedSuffix", "). Suivez-le dans Runs.")}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PIECES.map((p) => {
          const has = brand.files[p.key];
          return (
            <div key={p.key} className="win-flat p-3 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-6 h-6 grid place-items-center border-2 border-[var(--border)] shrink-0 ${has ? "bg-[var(--accent)] text-[#1b1b1b]" : "bg-[var(--bg)] text-[var(--text-muted)]"}`}><PixelIcon name={has ? "check" : "close"} size={12} /></span>
                <p className="font-mono text-base flex-1">{tr(`brand.piece.${p.key}.label`, p.label)}</p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-snug flex-1">{tr(`brand.piece.${p.key}.desc`, p.desc)}</p>
              {has
                ? <button onClick={() => openFile(p)} className="pbtn pbtn-sm mt-2 self-start"><PixelIcon name="article" size={12} /> {tr("brand.read", "Lire")}</button>
                : <span className="text-sm text-[var(--text-muted)] mt-2">{tr("brand.toDefine", "à définir")}</span>}
            </div>
          );
        })}
      </div>

      {defined < 3 && (
        <button onClick={build} disabled={launching} className="pbtn pbtn-primary pbtn-sm"><PixelIcon name="zap" size={12} /> {launching ? "…" : tr("brand.buildFoundation", "Construire la fondation avec un agent")}</button>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate">{tr(`brand.piece.${open.key}.label`, open.label)}</span>
              <button onClick={() => setOpen(null)} className="win-btn shrink-0" aria-label={tr("brand.close", "Fermer")}><PixelIcon name="close" size={11} /></button>
            </div>
            <div className="overflow-auto p-3">
              {preview === null && <p role="status" className="text-sm text-[var(--text-muted)]">{tr("brand.previewLoading", "chargement")}<span className="blink">_</span></p>}
              {preview && (preview.binary || !preview.content) && <p className="text-sm text-[var(--text-muted)]">{tr("brand.previewUnavailable", "Aperçu indisponible.")}</p>}
              {preview && !preview.binary && preview.content && <pre className="font-mono text-sm whitespace-pre-wrap leading-snug">{preview.content}{preview.truncated ? tr("brand.truncated", "\n…(tronqué)") : ""}</pre>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
