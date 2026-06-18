"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";
import { useDialogFocus } from "@/lib/useDialogFocus";

export default function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tr = useT();
  const [i, setI] = useState(0);
  const panelRef = useDialogFocus<HTMLDivElement>(open);

  const STEPS: { icon: string; title: string; body: React.ReactNode }[] = [
    {
      icon: "cpu",
      title: tr("tutorial.step1Title", "Bienvenue dans votre OS agentique"),
      body: <>{tr("tutorial.step1Body1", "Ceci est un système d'exploitation piloté par des agents IA. Le bureau contient des fenêtres : ouvrez-les depuis les icônes, le menu de gauche, ou la palette")} <b>Ctrl/Cmd&nbsp;+&nbsp;K</b>. {tr("tutorial.step1Body2", "Le moteur tourne en local et fait le vrai travail.")}</>,
    },
    {
      icon: "terminal",
      title: tr("tutorial.step2Title", "Lancer un but"),
      body: <>{tr("tutorial.step2Body1", "Ouvrez")} <b>Runs</b>, {tr("tutorial.step2Body2", "écrivez un objectif (ex : « rédige 3 posts LinkedIn ») puis cliquez")} <b>{tr("tutorial.step2Execute", "Exécuter")}</b>. {tr("tutorial.step2Body3", "Le modèle")} <b>Auto</b> {tr("tutorial.step2Body4", "choisit haiku / sonnet / opus selon la complexité, pour limiter les coûts. Des raccourcis de buts sont proposés sous le champ.")}</>,
    },
    {
      icon: "shield",
      title: tr("tutorial.step3Title", "Garder le contrôle"),
      body: <>{tr("tutorial.step3Body1", "En mode")} <b>{tr("tutorial.step3ValidationRequired", "Validation requise")}</b>, {tr("tutorial.step3Body2", "l'agent demande votre accord avant chaque action : autorisez ou refusez via les cartes. Passez en")} <b>{tr("tutorial.step3AutonomousMode", "Mode autonome")}</b> {tr("tutorial.step3Body3", "pour le laisser travailler seul. La cloche du menu signale les tâches qui attendent une réponse.")}</>,
    },
    {
      icon: "folder",
      title: tr("tutorial.step4Title", "Récupérer le travail"),
      body: <>{tr("tutorial.step4Body1", "Les fichiers produits arrivent dans")} <b>{tr("tutorial.step4Deliverables", "Livrables")}</b> {tr("tutorial.step4Body2", "(aperçu + téléchargement).")} <b>{tr("tutorial.step4History", "Historique")}</b> {tr("tutorial.step4Body3", "liste les tâches passées avec filtres (état, période, tri), et chaque tâche s'ouvre pour lire son journal.")}</>,
    },
    {
      icon: "command",
      title: tr("tutorial.step5Title", "Le cerveau du moteur"),
      body: <><b>Skills</b> {tr("tutorial.step5Body1", "liste les compétences (cliquez pour lire),")} <b>{tr("tutorial.step5Memory", "Mémoire")}</b> {tr("tutorial.step5Body2", "montre ce que le moteur retient,")} <b>{tr("tutorial.step5Scheduled", "Planifié")}</b> {tr("tutorial.step5Body3", "gère les jobs récurrents, et")} <b>Usage</b> {tr("tutorial.step5Body4", "suit le coût réel et la part de tâches sur modèles économiques.")}</>,
    },
    {
      icon: "article",
      title: tr("tutorial.step6Title", "Astuces"),
      body: <>{tr("tutorial.step6Body1", "La palette")} <b>Ctrl/Cmd&nbsp;+&nbsp;K</b> {tr("tutorial.step6Body2", "ouvre n'importe quelle fenêtre. Les tuiles de la Mission sont cliquables. Vous pouvez rouvrir ce guide à tout moment via le bouton")} <b>?</b> {tr("tutorial.step6Body3", "du menu en haut.")}</>,
    },
  ];

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
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="tutorial-title" tabIndex={-1} className="win-flat w-full max-w-lg bg-[var(--bg)] outline-none" onClick={(e) => e.stopPropagation()}>
        <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between">
          <span className="flex items-center gap-2"><PixelIcon name="article" size={12} /> {tr("tutorial.headerTitle", "Tutoriel")} · {i + 1}/{STEPS.length}</span>
          <button onClick={onClose} className="win-btn" aria-label={tr("tutorial.closeAria", "Fermer")}><PixelIcon name="close" size={11} /></button>
        </div>
        <div className="p-5 text-center">
          <div className="w-14 h-14 grid place-items-center border-2 border-[var(--border)] bg-[var(--accent)] mx-auto mb-4" style={{ boxShadow: "3px 3px 0 0 var(--border)" }}>
            <PixelIcon name={step.icon} size={26} className="text-[#1b1b1b]" />
          </div>
          <h3 id="tutorial-title" className="font-display text-[11px] uppercase mb-3 leading-relaxed">{step.title}</h3>
          <p className="text-base text-[var(--text-muted)] leading-snug">{step.body}</p>
        </div>
        <div className="px-3 py-2 border-t-2 border-[var(--border)] flex items-center justify-between gap-2">
          <button onClick={onClose} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">{tr("tutorial.skip", "Passer")}</button>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, n) => <span key={n} className={`w-2 h-2 ${n === i ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />)}
          </div>
          {last
            ? <button onClick={onClose} className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="check" size={12} /> {tr("tutorial.start", "Commencer")}</button>
            : (
              <div className="flex gap-1.5">
                {i > 0 && <button onClick={() => setI((n) => Math.max(n - 1, 0))} className="pbtn pbtn-sm"><PixelIcon name="chevron-left" size={12} /></button>}
                <button onClick={() => setI((n) => Math.min(n + 1, STEPS.length - 1))} className="pbtn pbtn-sm pbtn-primary">{tr("tutorial.next", "Suivant")} <PixelIcon name="chevron-right" size={12} /></button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
