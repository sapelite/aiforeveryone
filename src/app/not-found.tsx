import Link from "next/link";

/** Styled 404 so unknown URLs keep the pixel aesthetic instead of Next's bare page. */
export default function NotFound() {
  return (
    <div className="os-desktop min-h-screen grid place-items-center p-6 text-[var(--text)]">
      <div className="win w-full max-w-md">
        <div className="win-title"><span className="font-display text-[9px] uppercase">404</span></div>
        <div className="p-6 text-center space-y-4">
          <p className="font-display text-[11px] uppercase leading-relaxed">Page introuvable</p>
          <p className="text-base text-[var(--text-muted)]">Cette page n&apos;existe pas ou a été déplacée.</p>
          <Link href="/" className="pbtn pbtn-primary inline-flex">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
