import Link from "next/link";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

const links = [
  { href: "/#features", labelKey: "navFeatures", label: "Fonctionnalités" },
  { href: "/#pricing", labelKey: "navPricing", label: "Tarifs" },
  { href: "/dashboard", labelKey: "navDemo", label: "Démo" },
  { href: "/onboarding", labelKey: "navAudit", label: "Audit gratuit" },
  { href: "mailto:contact@aiforeveryone.fr", labelKey: "navContact", label: "Contact" },
];

export default function Footer() {
  const tr = useT();
  return (
    <footer className="border-t-2 border-[var(--border)] bg-[var(--bg-card)]">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="max-w-xs">
            <p className="font-display text-[10px] flex items-center gap-2">
              <PixelIcon name="computer" size={14} className="text-[var(--accent)]" /> AIFOREVERYONE
            </p>
            <p className="text-base text-[var(--text-muted)] mt-4 leading-snug">
              {tr("footer.tagline", "Systèmes d'exploitation IA sur mesure pour les entreprises. Agents, workflows, dashboards et une mémoire vivante.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-lg">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--accent)] transition-colors">{tr(`footer.${l.labelKey}`, l.label)}</Link>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t-2 border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-2 text-base text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} AIFOREVERYONE</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--accent)] pulse-dot" /> {tr("footer.statusOperational", "Systèmes opérationnels")}
          </p>
        </div>
      </div>
    </footer>
  );
}
