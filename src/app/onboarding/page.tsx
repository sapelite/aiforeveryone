"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
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
  // Value stays the French string (the agent prompt + validation rely on it);
  // only the display localizes, keyed by the French option text.
  const tr = useT();
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      <div className={`grid ${cols} gap-2`}>
        {options.map((o) => (
          <button key={o} type="button" aria-label={`${label} : ${tr(o, o)}`} onClick={() => update(field, o)} className={pillCls(form[field] === o)}>{tr(o, o)}</button>
        ))}
      </div>
    </div>
  );
}
function MultiField({ form, toggle, field, label, options, cols = "grid-cols-2 md:grid-cols-3", hint, req }: { form: FormState; toggle: Toggle; field: string; label: string; options: string[]; cols?: string; hint?: string; req?: boolean }) {
  const tr = useT();
  const sel = (form[field] as string[]) || [];
  return (
    <div>
      <FieldLabel req={req}>{label}</FieldLabel>
      {hint && <p className="text-xs text-[var(--text-muted)] mb-3">{hint}</p>}
      <div className={`grid ${cols} gap-2`}>
        {options.map((o) => (
          <button key={o} type="button" aria-label={`${label} : ${tr(o, o)}`} onClick={() => toggle(field, o)} className={pillCls(sel.includes(o))}>{tr(o, o)}</button>
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
  const tr = useT();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Keep the active step chip in view on the horizontally-scrolling indicator
  // (labels are hidden on phones, so otherwise later steps look absent).
  useEffect(() => {
    stepRefs.current[step]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [step]);

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
      else if (!j.offline) setSubmitError(j.error || tr("onboarding.submitFailed", "L'envoi a échoué. Réessayez."));
    } catch { /* moteur hors ligne : on garde le message 48h */ }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-lg px-6">
            <div className="w-20 h-20 border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "4px 4px 0 0 var(--border)", background: submitError && !taskId ? "var(--destructive)" : "var(--accent)" }}>
              <CheckCircle2 className="w-10 h-10 text-[#1b1b1b]" />
            </div>
            <h1 className="font-display text-[clamp(0.9rem,3vw,1.3rem)] mb-4">{taskId ? tr("onboarding.successTitleLaunched", "C'est lancé") : submitError ? tr("onboarding.successTitleError", "Envoi impossible") : tr("onboarding.successTitleReceived", "Demande reçue")}</h1>
            <p className="text-lg text-[var(--text-muted)] mb-8 leading-snug">
              {taskId ? (
                <>{tr("onboarding.successBodyLaunchedPre", "Un agent construit votre fondation de marque en ce moment (tâche")} <span className="font-mono text-[var(--text)]">{taskId.slice(0, 8)}</span>{tr("onboarding.successBodyLaunchedPost", ") : voix, positionnement et client idéal. Suivez-la en direct dans la démo.")}</>
              ) : submitError ? (
                <>{submitError}</>
              ) : (
                <>{tr("onboarding.successBodyReceivedPre", "Merci. Notre équipe analyse votre profil et revient sous 48h avec une architecture d'AI OS sur mesure : agents, workflows, dashboard et votre")} <span className="text-[var(--text)]">{tr("onboarding.brain", "Brain")}</span> {tr("onboarding.successBodyReceivedPost", "(vault Obsidian) prêts à être instanciés.")}</>
              )}
            </p>
            {submitError && !taskId ? (
              <button onClick={() => { setSubmitted(false); setSubmitError(null); }} className="pbtn pbtn-primary mx-auto">{tr("onboarding.retry", "Réessayer")}</button>
            ) : (
              <a href={taskId ? `/dashboard?view=runs&task=${taskId}` : "/"} className="pbtn pbtn-primary mx-auto">
                {taskId ? tr("onboarding.followInDemo", "Suivre dans la démo →") : tr("onboarding.backHome", "Retour à l'accueil")}
              </a>
            )}
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
            <h1 className="font-display text-[clamp(0.95rem,3.4vw,1.5rem)] leading-relaxed mb-3">{tr("onboarding.pageTitle", "Configurez votre AI OS")}</h1>
            <p className="text-lg text-[var(--text-muted)]">
              {tr("onboarding.pageIntro", "Plus vous nous en dites, plus votre système sera précis. Tout reste confidentiel et sert à construire votre Brain et vos agents.")}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {stepsMeta.map((s, i) => {
              const done = stepValid(i);
              const isCurrent = i === step;
              const reachable = canGoTo(i);
              return (
                <button key={s.label} type="button" ref={(el) => { stepRefs.current[i] = el; }} disabled={!reachable} onClick={() => reachable && setStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors whitespace-nowrap border-2 ${
                    isCurrent ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-light)]"
                      : done ? "border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/5"
                      : reachable ? "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)] hover:text-[var(--text)]"
                      : "border-[var(--border)] text-[var(--text-muted)]/40 cursor-not-allowed"
                  }`}>
                  {done && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{tr(`onboarding.stepNav${i}`, s.label)}</span>
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
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step0Title", "Parlez-nous de votre entreprise")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="company" label={tr("onboarding.companyLabel", "Nom de l'entreprise")} placeholder={tr("onboarding.companyPlaceholder", "Acme Corp")} req />
                  <TextField {...fp} field="website" label={tr("onboarding.websiteLabel", "Site web")} placeholder="https://acme.com" type="url" />
                </div>
                <SingleField {...fp} field="industry" label={tr("onboarding.industryLabel", "Secteur d'activité")} options={industryOptions} req />
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="founded" label={tr("onboarding.foundedLabel", "Année de création")} placeholder="2019" />
                  <TextField {...fp} field="hq" label={tr("onboarding.hqLabel", "Siège / localisation")} placeholder={tr("onboarding.hqPlaceholder", "Paris, France")} />
                </div>
                <SingleField {...fp} field="employees" label={tr("onboarding.employeesLabel", "Nombre d'employés")} options={["1-10", "11-50", "51-200", "200+"]} cols="grid-cols-2 md:grid-cols-4" req />
                <SingleField {...fp} field="businessModel" label={tr("onboarding.businessModelLabel", "Modèle économique")} options={businessModelOptions} />
                <div className="grid md:grid-cols-2 gap-4">
                  <SingleField {...fp} field="revenue" label={tr("onboarding.revenueLabel", "Chiffre d'affaires annuel")} options={revenueOptions} cols="grid-cols-2" />
                  <TextField {...fp} field="languages" label={tr("onboarding.languagesLabel", "Langues de travail")} placeholder={tr("onboarding.languagesPlaceholder", "Français, Anglais")} />
                </div>
              </div>
            )}

            {/* 1 — Contact & équipe */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step1Title", "Contact & équipe")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="contactName" label={tr("onboarding.contactNameLabel", "Votre nom")} placeholder={tr("onboarding.contactNamePlaceholder", "Marie Dupont")} req />
                  <TextField {...fp} field="role" label={tr("onboarding.roleLabel", "Votre rôle")} placeholder={tr("onboarding.rolePlaceholder", "Head of Operations")} req />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField {...fp} field="email" label={tr("onboarding.emailLabel", "Email professionnel")} placeholder={tr("onboarding.emailPlaceholder", "vous@entreprise.com")} type="email" req />
                  <TextField {...fp} field="phone" label={tr("onboarding.phoneLabel", "Téléphone (optionnel)")} placeholder={tr("onboarding.phonePlaceholder", "+33 6 12 34 56 78")} type="tel" />
                </div>
                <SingleField {...fp} field="teamSize" label={tr("onboarding.teamSizeLabel", "Combien de personnes utiliseront le système ?")} options={["1-5", "6-15", "16-50", "50+"]} cols="grid-cols-2 md:grid-cols-4" req />
                <MultiField {...mp} field="departments" label={tr("onboarding.departmentsLabel", "Départements concernés")} options={departmentOptions} hint={tr("onboarding.departmentsHint", "Quels pôles seront servis par l'AI OS ?")} />
                <AreaField {...fp} field="orgNotes" label={tr("onboarding.orgNotesLabel", "Organisation de l'équipe (optionnel)")} rows={3} placeholder={tr("onboarding.orgNotesPlaceholder", "Qui décide de quoi, comment l'équipe est structurée, points de friction internes…")} />
              </div>
            )}

            {/* 2 — Identité & positionnement */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step2Title", "Identité & positionnement")}</h2>
                <AreaField {...fp} field="pitch" label={tr("onboarding.pitchLabel", "En une phrase, que faites-vous ?")} rows={2} placeholder={tr("onboarding.pitchPlaceholder", "Acme aide les PME SaaS à automatiser leur reporting…")} req />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="mission" label={tr("onboarding.missionLabel", "Mission")} rows={3} placeholder={tr("onboarding.missionPlaceholder", "Pourquoi l'entreprise existe.")} />
                  <AreaField {...fp} field="vision" label={tr("onboarding.visionLabel", "Vision")} rows={3} placeholder={tr("onboarding.visionPlaceholder", "Où vous voulez aller.")} />
                </div>
                <TextField {...fp} field="values" label={tr("onboarding.valuesLabel", "Valeurs clés")} placeholder={tr("onboarding.valuesPlaceholder", "Rigueur, transparence, vitesse…")} />
                <AreaField {...fp} field="icp" label={tr("onboarding.icpLabel", "Client idéal (ICP)")} rows={2} placeholder={tr("onboarding.icpPlaceholder", "Profil type de votre meilleur client.")} />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="competitors" label={tr("onboarding.competitorsLabel", "Principaux concurrents")} rows={2} placeholder={tr("onboarding.competitorsPlaceholder", "Qui d'autre vos clients considèrent.")} />
                  <AreaField {...fp} field="differentiators" label={tr("onboarding.differentiatorsLabel", "Vos différenciateurs")} rows={2} placeholder={tr("onboarding.differentiatorsPlaceholder", "Ce qui vous rend uniques.")} />
                </div>
                <TextField {...fp} field="brandVoice" label={tr("onboarding.brandVoiceLabel", "Ton / voix de marque")} placeholder={tr("onboarding.brandVoicePlaceholder", "Direct, sans jargon, orienté résultat…")} />
              </div>
            )}

            {/* 3 — Offres & clients */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step3Title", "Offres & clients")}</h2>
                <AreaField {...fp} field="offers" label={tr("onboarding.offersLabel", "Vos offres / produits")} rows={4} placeholder={tr("onboarding.offersPlaceholder", "Décrivez vos principaux produits ou services, et leur positionnement prix.")} req />
                <SingleField {...fp} field="pricingModel" label={tr("onboarding.pricingModelLabel", "Modèle de prix")} options={pricingOptions} />
                <MultiField {...mp} field="segments" label={tr("onboarding.segmentsLabel", "Segments clients")} options={segmentOptions} />
                <div className="grid md:grid-cols-2 gap-4">
                  <AreaField {...fp} field="keyAccounts" label={tr("onboarding.keyAccountsLabel", "Comptes clés (optionnel)")} rows={2} placeholder={tr("onboarding.keyAccountsPlaceholder", "Vos clients les plus importants.")} />
                  <TextField {...fp} field="dealSize" label={tr("onboarding.dealSizeLabel", "Panier moyen / taille de deal")} placeholder={tr("onboarding.dealSizePlaceholder", "Ex : 12 000 € / an")} />
                </div>
              </div>
            )}

            {/* 4 — Processus */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step4Title", "Vos processus actuels")}</h2>
                <AreaField {...fp} field="processes" label={tr("onboarding.processesLabel", "Décrivez vos processus métier principaux")} rows={4} placeholder={tr("onboarding.processesPlaceholder", "Ex : les leads arrivent via le site, un commercial les qualifie manuellement, puis les entre dans le CRM…")} req />
                <AreaField {...fp} field="painPoints" label={tr("onboarding.painPointsLabel", "Vos principaux points de douleur")} rows={4} placeholder={tr("onboarding.painPointsPlaceholder", "Ex : trop de saisie manuelle, données éparpillées, décisions lentes…")} req />
                <MultiField {...mp} field="automationAreas" label={tr("onboarding.automationAreasLabel", "Quels domaines automatiser en priorité ?")} options={automationAreas} cols="grid-cols-2" req />
              </div>
            )}

            {/* 5 — Données & Brain */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step5Title", "Données & Brain")}</h2>

                <div className="border-2 border-[var(--accent)] bg-[var(--bg-card-hover)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--accent)] grid place-items-center shrink-0">
                      <BrainCircuit className="w-5 h-5 text-[#1b1b1b]" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{tr("onboarding.brainCalloutTitle", "Votre Brain — un vault vivant")}</p>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        {tr("onboarding.brainCalloutPre", "Nous construisons un")} <span className="text-[var(--text)]">{tr("onboarding.brain", "Brain")}</span> {tr("onboarding.brainCalloutPost", "(vault Obsidian) qui centralise toute votre connaissance — relié, interrogeable, et maintenu à jour en continu par vos agents. Dites-nous où vit aujourd'hui votre savoir.")}
                      </p>
                    </div>
                  </div>
                </div>

                <SingleField {...fp} field="brainTool" label={tr("onboarding.brainToolLabel", "Où vit votre connaissance aujourd'hui ?")} options={brainOptions} cols="grid-cols-2 md:grid-cols-3" />
                <MultiField {...mp} field="tools" label={tr("onboarding.toolsLabel", "Quels outils utilisez-vous ?")} options={toolOptions} hint={tr("onboarding.toolsHint", "Nous les connecterons via MCP à votre AI OS.")} />
                <MultiField {...mp} field="dataLocations" label={tr("onboarding.dataLocationsLabel", "Où sont stockées vos données ?")} options={dataLocationOptions} />
                <AreaField {...fp} field="mcpClis" label={tr("onboarding.mcpClisLabel", "MCP / CLI / scripts existants (optionnel)")} rows={2} placeholder={tr("onboarding.mcpClisPlaceholder", "Serveurs MCP, outils en ligne de commande, automatisations déjà en place.")} />
                <TextField {...fp} field="brainAccess" label={tr("onboarding.brainAccessLabel", "Pouvons-nous connecter votre vault / Drive ? (optionnel)")} placeholder={tr("onboarding.brainAccessPlaceholder", "Oui, lien à venir / À discuter / Non")} />
              </div>
            )}

            {/* 6 — Objectifs */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="font-display text-[11px] leading-relaxed mb-3">{tr("onboarding.step6Title", "Vos objectifs")}</h2>
                <AreaField {...fp} field="goals" label={tr("onboarding.goalsLabel", "Que voulez-vous accomplir avec votre AI OS ?")} rows={4} placeholder={tr("onboarding.goalsPlaceholder", "Ex : réduire de 50% le temps de qualification des leads, centraliser la connaissance, accélérer le reporting…")} req />
                <AreaField {...fp} field="kpis" label={tr("onboarding.kpisLabel", "Comment mesurerez-vous le succès ?")} rows={2} placeholder={tr("onboarding.kpisPlaceholder", "KPIs, indicateurs, résultats attendus.")} />
                <SingleField {...fp} field="timeline" label={tr("onboarding.timelineLabel", "Quel est votre délai idéal ?")} options={["< 1 mois", "1-3 mois", "3-6 mois", "Pas pressé"]} cols="grid-cols-2 md:grid-cols-4" req />
                <SingleField {...fp} field="budget" label={tr("onboarding.budgetLabel", "Budget mensuel envisagé")} options={["< 2 000 €", "2-5 000 €", "5-10 000 €", "> 10 000 €"]} cols="grid-cols-2 md:grid-cols-4" />
                <AreaField {...fp} field="notes" label={tr("onboarding.notesLabel", "Autre chose à nous dire ? (optionnel)")} rows={3} placeholder={tr("onboarding.notesPlaceholder", "Contraintes, contexte, attentes spécifiques…")} />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-[var(--border)]">
              <button onClick={prev} disabled={step === 0} className="pbtn pbtn-sm">
                <ArrowLeft className="w-4 h-4" /> {tr("onboarding.previous", "Précédent")}
              </button>

              {step < stepsMeta.length - 1 ? (
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={next} disabled={!stepValid(step)} className="pbtn pbtn-sm pbtn-primary">
                    {tr("onboarding.next", "Suivant")} <ArrowRight className="w-4 h-4" />
                  </button>
                  {!stepValid(step) && <span className="text-sm text-[var(--text-muted)]">{tr("onboarding.fillRequired", "Complétez les champs obligatoires (*)")}</span>}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={handleSubmit} disabled={!allValid} className="pbtn pbtn-sm pbtn-primary">
                    <Send className="w-4 h-4" /> {tr("onboarding.submit", "Envoyer ma demande")}
                  </button>
                  {!allValid && <span className="text-sm text-[var(--text-muted)]">{tr("onboarding.allStepsRequired", "Toutes les étapes obligatoires doivent être complétées.")}</span>}
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
