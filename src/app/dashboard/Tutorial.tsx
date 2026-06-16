"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

const STEPS: { icon: string; title: string; body: React.ReactNode }[] = [
  {
    icon: "cpu",
    title: "Bienvenue dans votre OS agentique",
    body: <>Ceci est un système d&apos;exploitation piloté par des agents IA. Le bureau contient des fenêtres : ouvrez-les depuis les icônes, le menu de gauche, ou la palette <b>Ctrl/Cmd&nbsp;+&nbsp;K</b>. Le moteur tourne en local et fait le vrai travail.</>,
  },
  {
    icon: "terminal",
    title: "Lancer un but",
    body: <>Ouvrez <b>Runs</b>, écrivez un objectif (ex&nbsp;: « rédige 3 posts LinkedIn ») puis cliquez <b>Exécuter</b>. Le modèle <b>Auto</b> choisit haiku / sonnet / opus selon la complexité, pour limiter les coûts. Des raccourcis de buts sont proposés sous le champ.</>,
  },
  {
    icon: "shield",
    title: "Garder le contrôle",
    body: <>En mode <b>Validation requise</b>, l&apos;agent demande votre accord avant chaque action : autorisez ou refusez via les cartes. Passez en <b>Mode autonome</b> pour le laisser travailler seul. La cloche du menu signale les tâches qui attendent une réponse.</>,
  },
  {
    icon: "folder",
    title: "Récupérer le travail",
    body: <>Les fichiers produits arrivent dans <b>Livrables</b> (aperçu + téléchargement). <b>Historique</b> liste les tâches passées avec filtres (état, période, tri), et chaque tâche s&apos;ouvre pour lire son journal.</>,
  },
  {
    icon: "command",
    title: "Le cerveau du moteur",
    body: <><b>Skills</b> liste les compétences (cliquez pour lire), <b>Mémoire</b> montre ce que le moteur retient, <b>Planifié</b> gère les jobs récurrents, et <b>Usage</b> suit le coût réel et la part de tâches sur modèles économiques.</>,
  },
  {
    icon: "article",
    title: "Astuces",
    body: <>La palette <b>Ctrl/Cmd&nbsp;+&nbsp;K</b> ouvre n&apos;importe quelle fenêtre. Les tuiles de la Mission sont cliquables. Vous pouvez rouvrir ce guide à tout moment via le bouton <b>?</b> du menu en haut.</>,
  },
];

export default function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => { if (open) setI(0); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="win-flat w-full max-w-lg bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
        <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between">
          <span className="flex items-center gap-2"><PixelIcon name="article" size={12} /> Tutoriel · {i + 1}/{STEPS.length}</span>
          <button onClick={onClose} className="win-btn" aria-label="Fermer"><PixelIcon name="close" size={11} /></button>
        </div>
        <div className="p-5 text-center">
          <div className="w-14 h-14 grid place-items-center border-2 border-[var(--border)] bg-[var(--accent)] mx-auto mb-4" style={{ boxShadow: "3px 3px 0 0 var(--border)" }}>
            <PixelIcon name={step.icon} size={26} className="text-[#1b1b1b]" />
          </div>
          <h3 className="font-display text-[11px] uppercase mb-3 leading-relaxed">{step.title}</h3>
          <p className="text-base text-[var(--text-muted)] leading-snug">{step.body}</p>
        </div>
        <div className="px-3 py-2 border-t-2 border-[var(--border)] flex items-center justify-between gap-2">
          <button onClick={onClose} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">Passer</button>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, n) => <span key={n} className={`w-2 h-2 ${n === i ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />)}
          </div>
          {last
            ? <button onClick={onClose} className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="check" size={12} /> Commencer</button>
            : (
              <div className="flex gap-1.5">
                {i > 0 && <button onClick={() => setI((n) => Math.max(n - 1, 0))} className="pbtn pbtn-sm"><PixelIcon name="chevron-left" size={12} /></button>}
                <button onClick={() => setI((n) => Math.min(n + 1, STEPS.length - 1))} className="pbtn pbtn-sm pbtn-primary">Suivant <PixelIcon name="chevron-right" size={12} /></button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
