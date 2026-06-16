"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteChat from "@/components/SiteChat";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Building2, Users, Sparkles,
  Package, Workflow, Database, Target, Send, BrainCircuit,
} from "lucide-react";

/* ─── STEP META ─── */
const stepsMeta = [
  { icon: Building2, label: "Entreprise" },
  { icon: Users, label: "Équipe" },
  { icon: Sparkles, label: "Identité" },
  { icon: Package, label: "Offres" },
  { icon: Workflow, label: "Processus" },
  { icon: Database, label: "Données & Brain" },
  { icon: Target, label: "Objectifs" },
];

/* ─── OPTIONS ─── */
const industryOptions = ["SaaS / Tech", "Finance / Banque", "Santé", "E-commerce / Retail", "Industrie", "Conseil / Services", "Immobilier", "Éducation", "Média / Contenu", "Autre"];
const businessModelOptions = ["B2B", "B2C", "B2B2C", "Marketplace", "SaaS", "Agence / Services", "Autre"];
const revenueOptions = ["< 100k €", "100k–500k €", "500k–2M €", "2–10M €", "10M+ €", "Préfère ne pas dire"];
const departmentOptions = ["Direction", "Ventes", "Marketing", "Produit", "Opérations", "Support", "Finance", "RH", "Tech / IT", "Juridique"];
const pricingOptions = ["Abonnement", "À l'usage", "Licence", "Forfait projet", "Commission", "Freemium", "Autre"];
const segmentOptions = ["PME", "ETI", "Grands comptes", "Startups", "Particuliers", "Secteur public", "Autre"];
const automationAreas = ["Qualification de leads", "Onboarding clients", "Support client", "Reporting / Analytics", "Gestion de projets", "RH / Recrutement", "Finance / Compta", "Marketing / Contenu", "Opérations internes", "Veille / Recherche"];
const toolOptions = ["Slack", "Google Workspace", "Microsoft 365", "Salesforce", "HubSpot", "Notion", "Jira / Linear", "SAP / ERP", "Stripe", "Intercom / Zendesk", "Make / Zapier", "Airtable", "GitHub", "Autre"];
const dataLocationOptions = ["Google Drive", "Notion", "Slack", "CRM", "Sheets / Excel", "Emails", "Dropbox", "SharePoint", "Confluence", "Serveur local"];
const brainOptions = ["Obsidian", "Notion", "Confluence", "Google Drive", "Aucun pour l'instant"];

type FormState = Record<string, string | string[]>;
type Update = (field: string, value: string | string[]) => void;
type Toggle = (field: string, val: string) => void;

const INPUT =
  "w-full px-3 py-2.5 bg-[var(--bg)] border-2 border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors";
const pillCls = (active: boolean) =>
  `px-3 py-2 text-sm text-left border-2 transition-colors ${
    active ? "border-[var(--border)] bg-[var(--accent)] text-[#1b1b1b]" : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
  }`;

/* ─── field components (module scope — stable identity, no focus loss) ─── */
function FieldLabel({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return <label className="block text-sm font-medium mb-2">{children}{req && " *"}</label>;
}
function TextField({ form, update, field, label, placeholder, type = "text", req }: { form: FormState; update: Update; field: string; label: string; placeholder?: string; type?: string; req?: boolean }) {
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      <input type={type} value={form[field] as string} onChange={(e) => update(field, e.target.value)} placeholder={placeholder} className={INPUT} />
    </div>
  );
}
function AreaField({ form, update, field, label, placeholder, rows = 4, req }: { form: FormState; update: Update; field: string; label: string; placeholder?: string; rows?: number; req?: boolean }) {
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      <textarea value={form[field] as string} onChange={(e) => update(field, e.target.value)} rows={rows} placeholder={placeholder} className={`${INPUT} resize-none`} />
    </div>
  );
}
function SingleField({ form, update, field, label, options, cols = "grid-cols-2 md:grid-cols-3", req }: { form: FormState; update: Update; field: string; label: string; options: string[]; cols?: string; req?: boolean }) {
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      <div className={`grid ${cols} gap-2`}>
        {options.map((o) => (
          <button key={o} type="button" onClick={() => update(field, o)} className={pillCls(form[field] === o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}
function MultiField({ form, toggle, field, label, options, cols = "grid-cols-2 md:grid-cols-3", hint, req }: { form: FormState; toggle: Toggle; field: string; label: string; options: string[]; cols?: string; hint?: string; req?: boolean }) {
  const sel = (form[field] as string[]) || [];
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      {hint && <p className="text-xs text-[var(--text-muted)] mb-3">{hint}</p>}
      <div className={`grid ${cols} gap-2`}>
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(field, o)} className={pillCls(sel.includes(o))}>{o}</button>
        ))}
      </div>
    </div>
  );
}

const initialForm: FormState = {
  company: "", website: "", industry: "", employees: "", founded: "", hq: "", businessModel: "", revenue: "", languages: "",
  contactName: "", role: "", email: "", phone: "", teamSize: "", departments: [], orgNotes: "",
  mission: "", vision: "", values: "", pitch: "", icp: "", competitors: "", differentiators: "", brandVoice: "",
  offers: "", pricingModel: "", segments: [], keyAccounts: "", dealSize: "",
  processes: "", painPoints: "", automationAreas: [],
  tools: [], dataLocations: [], brainTool: "", brainAccess: "", mcpClis: "",
  goals: "", kpis: "", timeline: "", budget: "", notes: "",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const update: Update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggle: Toggle = (field, val) => {
    const current = (form[field] as string[]) || [];
    update(field, current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
  };
  const fp = { form, update };
  const mp = { form, toggle };

  /* ─── validation : on ne peut avancer qu'avec les champs requis remplis ─── */
  const str = (f: string) => (typeof form[f] === "string" ? (form[f] as string).trim() : "");
  const has = (f: string) => str(f) !== "";
  const hasArr = (f: string) => Array.isArray(form[f]) && (form[f] as string[]).length > 0;
  const validEmail = (f: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(f));

  function stepValid(i: number): boolean {
    switch (i) {
      case 0: return has("company") && has("industry") && has("employees");
      case 1: return has("contactName") && has("role") && validEmail("email") && has("teamSize");
      case 2: return has("pitch");
      case 3: return has("offers");
      case 4: return has("processes") && has("painPoints") && hasArr("automationAreas");
      case 5: return true; // étape optionnelle
      case 6: return has("goals") && has("timeline");
      default: return true;
    }
  }
  const canGoTo = (i: number) => i <= step || Array.from({ length: i }, (_, j) => j).every(stepValid);
  const allValid = stepsMeta.every((_, i) => stepValid(i));
  const completedCount = stepsMeta.reduce((n, _, i) => n + (stepValid(i) ? 1 : 0), 0);

  const next = () => { if (stepValid(step)) setStep((s) => Math.min(s + 1, stepsMeta.length - 1)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const handleSubmit = async () => {
    if (!allValid) return;
    setSubmitted(true);
    try {
      const goal = `Construis la fondation de marque pour ${str("company")} (secteur : ${str("industry")}). Pitch : ${str("pitch")}. Client idéal : ${str("icp") || "à définir"}. Différenciateurs : ${str("differentiators") || "à définir"}. Voix souhaitée : ${str("brandVoice") || "à définir"}. Utilise les skills mkt-brand-voice, mkt-positioning et mkt-icp, puis sauvegarde les livrables dans projects/.`;
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, model: "auto", permissionMode: "acceptEdits" }) });
      const j = await res.json();
      if (j.ok) setTaskId(j.taskId);
    } catch { /* moteur hors ligne : on garde le message 48h */ }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-lg px-6">
            <div className="w-20 h-20 border-2 border-[var(--border)] bg-[var(--accent)] flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "4px 4px 0 0 var(--border)" }}>
              <CheckCircle2 className="w-10 h-10 text-[#1b1b1b]" />
            </div>
            <h1 className="font-display text-[clamp(0.9rem,3vw,1.3rem)] mb-4">{taskId ? "C'est lancé" : "Demande reçue"}</h1>
            <p className="text-lg text-[var(--text-muted)] mb-8 leading-snug">
              {taskId ? (
                <>Un agent construit votre fondation de marque en ce moment (tâche <span className="font-mono text-[var(--text)]">{taskId.slice(0, 8)}</span>) : voix, positionnement et client idéal. Suivez-la en direct dans la démo.</>
              ) : (
                <>Merci. Notre équipe analyse votre profil et revient sous 48h avec une architecture d&apos;AI OS sur mesure : agents, workflows, dashboard et votre <span className="text-[var(--text)]">Brain</span> (vault Obsidian) prêts à être instanciés.</>
              )}
            </p>
            <a href={taskId ? "/dashboard?view=runs" : "/"} className="pbtn pbtn-primary mx-auto">
              {taskId ? "Suivre dans la démo →" : "Retour à l'accueil"}
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10">
            <h1 className="font-display text-[clamp(0.95rem,3.4vw,1.5rem)] leading-relaxed mb-3">Configurez votre AI OS</h1>
            <p className="text-lg text-[var(--text-muted)]">
              Plus vous nous en dites, plus votre système sera précis. Tout reste confidentiel et sert à construire votre Brain et vos agents.
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {stepsMeta.map((s, i) => {
              const done = stepValid(i);
              const isCurrent = i === step;
              const reachable = canGoTo(i);
              return (
                <button key={s.label} type="button" disabled={!reachable} onClick={() => reachable && setStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors whitespace-nowrap border-2 ${
                    isCurrent ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-light)]"
                      : done ? "border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/5"
                      : reachable ? "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)] hover:text-[var(--text)]"
                      : "border-[var(--border)] text-[var(--text-muted)]/40 cursor-not-allowed"
                  }`}>
                  {done && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Progress bar (reflète les étapes réellement complétées) */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-3 border-2 border-[var(--border)] flex-1 overflow-hidden">
              <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${(completedCount / stepsMeta.length) * 100}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium tabular-nums">{completedCount}/{stepsMeta.length}</span>
          </div>

          <div className="win p-6 md:p-8">
            {/* 0 — Entreprise */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Parlez-nous de votre entreprise</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="company" label="Nom de l'entreprise" placeholder="Acme Corp" req />
                  <TextField {...fp} field="website" label="Site web" placeholder="https://acme.com" type="url" />
                </div>
                <SingleField {...fp} field="industry" label="Secteur d'activité" options={industryOptions} req />
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="founded" label="Année de création" placeholder="2019" />
                  <TextField {...fp} field="hq" label="Siège / localisation" placeholder="Paris, France" />
                </div>
                <SingleField {...fp} field="employees" label="Nombre d'employés" options={["1-10", "11-50", "51-200", "200+"]} cols="grid-cols-2 md:grid-cols-4" req />
                <SingleField {...fp} field="businessModel" label="Modèle économique" options={businessModelOptions} />
                <div className="grid md:grid-cols-2 gap-4">
                  <SingleField {...fp} field="revenue" label="Chiffre d'affaires annuel" options={revenueOptions} cols="grid-cols-2" />
                  <TextField {...fp} field="languages" label="Langues de travail" placeholder="Français, Anglais" />
                </div>
              </div>
            )}

            {/* 1 — Contact & équipe */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Contact & équipe</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="contactName" label="Votre nom" placeholder="Marie Dupont" req />
                  <TextField {...fp} field="role" label="Votre rôle" placeholder="Head of Operations" req />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="email" label="Email professionnel" placeholder="vous@entreprise.com" type="email" req />
                  <TextField {...fp} field="phone" label="Téléphone (optionnel)" placeholder="+33 6 12 34 56 78" type="tel" />
                </div>
                <SingleField {...fp} field="teamSize" label="Combien de personnes utiliseront le système ?" options={["1-5", "6-15", "16-50", "50+"]} cols="grid-cols-2 md:grid-cols-4" req />
                <MultiField {...mp} field="departments" label="Départements concernés" options={departmentOptions} hint="Quels pôles seront servis par l'AI OS ?" />
                <AreaField {...fp} field="orgNotes" label="Organisation de l'équipe (optionnel)" rows={3} placeholder="Qui décide de quoi, comment l'équipe est structurée, points de friction internes…" />
              </div>
            )}

            {/* 2 — Identité & positionnement */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Identité & positionnement</h2>
                <AreaField {...fp} field="pitch" label="En une phrase, que faites-vous ?" rows={2} placeholder="Acme aide les PME SaaS à automatiser leur reporting…" req />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="mission" label="Mission" rows={3} placeholder="Pourquoi l'entreprise existe." />
                  <AreaField {...fp} field="vision" label="Vision" rows={3} placeholder="Où vous voulez aller." />
                </div>
                <TextField {...fp} field="values" label="Valeurs clés" placeholder="Rigueur, transparence, vitesse…" />
                <AreaField {...fp} field="icp" label="Client idéal (ICP)" rows={2} placeholder="Profil type de votre meilleur client." />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="competitors" label="Principaux concurrents" rows={2} placeholder="Qui d'autre vos clients considèrent." />
                  <AreaField {...fp} field="differentiators" label="Vos différenciateurs" rows={2} placeholder="Ce qui vous rend uniques." />
                </div>
                <TextField {...fp} field="brandVoice" label="Ton / voix de marque" placeholder="Direct, sans jargon, orienté résultat…" />
              </div>
            )}

            {/* 3 — Offres & clients */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Offres & clients</h2>
                <AreaField {...fp} field="offers" label="Vos offres / produits" rows={4} placeholder="Décrivez vos principaux produits ou services, et leur positionnement prix." req />
                <SingleField {...fp} field="pricingModel" label="Modèle de prix" options={pricingOptions} />
                <MultiField {...mp} field="segments" label="Segments clients" options={segmentOptions} />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="keyAccounts" label="Comptes clés (optionnel)" rows={2} placeholder="Vos clients les plus importants." />
                  <TextField {...fp} field="dealSize" label="Panier moyen / taille de deal" placeholder="Ex : 12 000 € / an" />
                </div>
              </div>
            )}

            {/* 4 — Processus */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Vos processus actuels</h2>
                <AreaField {...fp} field="processes" label="Décrivez vos processus métier principaux" rows={4} placeholder="Ex : les leads arrivent via le site, un commercial les qualifie manuellement, puis les entre dans le CRM…" req />
                <AreaField {...fp} field="painPoints" label="Vos principaux points de douleur" rows={4} placeholder="Ex : trop de saisie manuelle, données éparpillées, décisions lentes…" req />
                <MultiField {...mp} field="automationAreas" label="Quels domaines automatiser en priorité ?" options={automationAreas} cols="grid-cols-2" req />
              </div>
            )}

            {/* 5 — Données & Brain */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Données & Brain</h2>

                <div className="border-2 border-[var(--accent)] bg-[var(--bg-card-hover)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--accent)] grid place-items-center shrink-0">
                      <BrainCircuit className="w-5 h-5 text-[#1b1b1b]" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Votre Brain — un vault vivant</p>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        Nous construisons un <span className="text-[var(--text)]">Brain</span> (vault Obsidian) qui centralise toute votre connaissance — relié, interrogeable, et maintenu à jour en continu par vos agents. Dites-nous où vit aujourd&apos;hui votre savoir.
                      </p>
                    </div>
                  </div>
                </div>

                <SingleField {...fp} field="brainTool" label="Où vit votre connaissance aujourd'hui ?" options={brainOptions} cols="grid-cols-2 md:grid-cols-3" />
                <MultiField {...mp} field="tools" label="Quels outils utilisez-vous ?" options={toolOptions} hint="Nous les connecterons via MCP à votre AI OS." />
                <MultiField {...mp} field="dataLocations" label="Où sont stockées vos données ?" options={dataLocationOptions} />
                <AreaField {...fp} field="mcpClis" label="MCP / CLI / scripts existants (optionnel)" rows={2} placeholder="Serveurs MCP, outils en ligne de commande, automatisations déjà en place." />
                <TextField {...fp} field="brainAccess" label="Pouvons-nous connecter votre vault / Drive ? (optionnel)" placeholder="Oui, lien à venir / À discuter / Non" />
              </div>
            )}

            {/* 6 — Objectifs */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">Vos objectifs</h2>
                <AreaField {...fp} field="goals" label="Que voulez-vous accomplir avec votre AI OS ?" rows={4} placeholder="Ex : réduire de 50% le temps de qualification des leads, centraliser la connaissance, accélérer le reporting…" req />
                <AreaField {...fp} field="kpis" label="Comment mesurerez-vous le succès ?" rows={2} placeholder="KPIs, indicateurs, résultats attendus." />
                <SingleField {...fp} field="timeline" label="Quel est votre délai idéal ?" options={["< 1 mois", "1-3 mois", "3-6 mois", "Pas pressé"]} cols="grid-cols-2 md:grid-cols-4" req />
                <SingleField {...fp} field="budget" label="Budget mensuel envisagé" options={["< 2 000 €", "2-5 000 €", "5-10 000 €", "> 10 000 €"]} cols="grid-cols-2 md:grid-cols-4" />
                <AreaField {...fp} field="notes" label="Autre chose à nous dire ? (optionnel)" rows={3} placeholder="Contraintes, contexte, attentes spécifiques…" />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-[var(--border)]">
              <button onClick={prev} disabled={step === 0} className="pbtn pbtn-sm">
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>

              {step < stepsMeta.length - 1 ? (
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={next} disabled={!stepValid(step)} className="pbtn pbtn-sm pbtn-primary">
                    Suivant <ArrowRight className="w-4 h-4" />
                  </button>
                  {!stepValid(step) && <span className="text-sm text-[var(--text-muted)]">Complétez les champs obligatoires (*)</span>}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={handleSubmit} disabled={!allValid} className="pbtn pbtn-sm pbtn-primary">
                    <Send className="w-4 h-4" /> Envoyer ma demande
                  </button>
                  {!allValid && <span className="text-sm text-[var(--text-muted)]">Toutes les étapes obligatoires doivent être complétées.</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SiteChat />
    </>
  );
}
