"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "fr" | "en";

/* French is the source of truth; English mirrors its shape. */
const fr = {
  nav: { features: "Fonctionnalités", how: "Étapes", pricing: "Tarifs", demo: "Démo", start: "Commencer" },
  hero: {
    badge: "AI Operating System · B2B",
    titleA: "Votre entreprise,",
    titleB: "pilotée par l'IA.",
    subtitle: "Agents autonomes, workflows intelligents, dashboards décisionnels et un Brain vivant. Conçu sur mesure pour votre métier.",
    ctaPrimary: "Audit gratuit",
    ctaSecondary: "Voir la démo",
    ready: "prêt en moins de 6 semaines",
  },
  stats: [
    { v: "73%", l: "de temps économisé" },
    { v: "2.4x", l: "ROI la 1re année" },
    { v: "< 6 sem", l: "pour être opérationnel" },
    { v: "99.9%", l: "de disponibilité" },
  ],
  features: {
    heading: "Tout pour piloter vos opérations",
    sub: "Six modules, un seul système d'exploitation.",
    items: [
      { icon: "robot", title: "Agents autonomes", desc: "Des agents spécialisés qui exécutent vos tâches répétitives : qualification, suivi, reporting, 24/7.", span: "md:col-span-2" },
      { icon: "notebook", title: "Mémoire vivante", desc: "Un Brain qui capture et relie tout votre savoir. Rien ne se perd.", span: "" },
      { icon: "sync", title: "Workflows intelligents", desc: "Vos process transformés en automatisations qui s'adaptent.", span: "" },
      { icon: "chart-bar", title: "Dashboards décisionnels", desc: "Vos KPIs, alertes et insights en temps réel. Une seule fenêtre sur votre activité.", span: "md:col-span-2" },
      { icon: "blocks", title: "Intégrations", desc: "Connectez vos outils via MCP : Drive, Slack, Notion, CRM, et plus de 50 autres.", span: "" },
      { icon: "shield", title: "Privé et sécurisé", desc: "Vos données restent les vôtres. Chiffrement, hébergement dédié, RGPD.", span: "" },
    ],
  },
  how: {
    heading: "De zéro à opérationnel en 6 semaines",
    done: "installation terminée",
    steps: [
      { n: "01", title: "Audit", desc: "Vous remplissez le formulaire. On cartographie vos process, outils et objectifs." },
      { n: "02", title: "Architecture", desc: "On conçoit votre AI OS sur mesure : agents, workflows, Brain, dashboard." },
      { n: "03", title: "Construction", desc: "Développement, ingestion de vos données, mise en place de la mémoire business." },
      { n: "04", title: "Déploiement", desc: "Mise en production, formation, optimisation continue. On reste à vos côtés." },
    ],
  },
  pricing: {
    heading: "Tarifs",
    sub: "Simple et transparent. Montée en charge à tout moment.",
    popular: "★ POPULAIRE",
    perMonth: "€/mois",
    custom: "Sur mesure",
    plans: [
      { name: "Starter", price: "2 900", features: ["3 agents IA", "5 workflows", "Dashboard standard", "Brain de base", "Support email"], cta: "Commencer", highlight: false },
      { name: "Business", price: "5 900", features: ["10 agents IA", "Workflows illimités", "Dashboards sur mesure", "Brain avancé", "Support prioritaire", "Formation incluse"], cta: "Choisir Business", highlight: true },
      { name: "Enterprise", price: "Sur mesure", features: ["Agents illimités", "Architecture dédiée", "SLA garanti", "Hébergement privé", "Account manager", "Audit sécurité"], cta: "Nous contacter", highlight: false },
    ],
  },
  cta: {
    headingA: "Construisons votre",
    headingB: "AI Operating System",
    sub: "Remplissez le formulaire. On analyse votre entreprise et on vous livre une architecture sur mesure. L'audit est gratuit.",
    button: "Demander mon audit gratuit",
  },
};

export type Dict = typeof fr;

const en: Dict = {
  nav: { features: "Features", how: "Steps", pricing: "Pricing", demo: "Demo", start: "Get started" },
  hero: {
    badge: "AI Operating System · B2B",
    titleA: "Your business,",
    titleB: "run by AI.",
    subtitle: "Autonomous agents, intelligent workflows, decision dashboards and a living Brain. Custom-built for your business.",
    ctaPrimary: "Free audit",
    ctaSecondary: "See the demo",
    ready: "ready in under 6 weeks",
  },
  stats: [
    { v: "73%", l: "time saved" },
    { v: "2.4x", l: "ROI in year one" },
    { v: "< 6 wks", l: "to go live" },
    { v: "99.9%", l: "uptime" },
  ],
  features: {
    heading: "Everything to run your operations",
    sub: "Six modules, one operating system.",
    items: [
      { icon: "robot", title: "Autonomous agents", desc: "Specialized agents that handle your repetitive work: qualification, follow-up, reporting, 24/7.", span: "md:col-span-2" },
      { icon: "notebook", title: "Living memory", desc: "A Brain that captures and connects all your knowledge. Nothing gets lost.", span: "" },
      { icon: "sync", title: "Smart workflows", desc: "Your processes turned into automations that adapt.", span: "" },
      { icon: "chart-bar", title: "Decision dashboards", desc: "Your KPIs, alerts and insights in real time. One window on your business.", span: "md:col-span-2" },
      { icon: "blocks", title: "Integrations", desc: "Connect your tools via MCP: Drive, Slack, Notion, CRM, and 50+ more.", span: "" },
      { icon: "shield", title: "Private and secure", desc: "Your data stays yours. Encryption, dedicated hosting, GDPR.", span: "" },
    ],
  },
  how: {
    heading: "From zero to live in 6 weeks",
    done: "installation complete",
    steps: [
      { n: "01", title: "Audit", desc: "You fill out the form. We map your processes, tools and goals." },
      { n: "02", title: "Architecture", desc: "We design your custom AI OS: agents, workflows, Brain, dashboard." },
      { n: "03", title: "Build", desc: "Development, ingestion of your data, setup of the business memory." },
      { n: "04", title: "Deploy", desc: "Go live, training, continuous optimization. We stay by your side." },
    ],
  },
  pricing: {
    heading: "Pricing",
    sub: "Simple and transparent. Scale up anytime.",
    popular: "★ POPULAR",
    perMonth: "€/mo",
    custom: "Custom",
    plans: [
      { name: "Starter", price: "2,900", features: ["3 AI agents", "5 workflows", "Standard dashboard", "Basic Brain", "Email support"], cta: "Get started", highlight: false },
      { name: "Business", price: "5,900", features: ["10 AI agents", "Unlimited workflows", "Custom dashboards", "Advanced Brain", "Priority support", "Training included"], cta: "Choose Business", highlight: true },
      { name: "Enterprise", price: "Custom", features: ["Unlimited agents", "Dedicated architecture", "Guaranteed SLA", "Private hosting", "Account manager", "Security audit"], cta: "Contact us", highlight: false },
    ],
  },
  cta: {
    headingA: "Let's build your",
    headingB: "AI Operating System",
    sub: "Fill out the form. We analyze your business and deliver a custom architecture. The audit is free.",
    button: "Request my free audit",
  },
};

const DICTS: Record<Lang, Dict> = { fr, en };

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({ lang: "fr", setLang: () => {}, t: fr });

/**
 * Site language. French by default; English activable via the navbar toggle and
 * persisted in localStorage. Renders FR on the server, then switches to the
 * stored choice after mount (no hydration mismatch).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    try { const s = localStorage.getItem("site-lang"); if (s === "en" || s === "fr") setLangState(s); } catch { /* no storage */ }
  }, []);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("site-lang", l); document.documentElement.lang = l; } catch { /* */ } };
  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
