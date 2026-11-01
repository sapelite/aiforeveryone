import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import SoundFx from "@/components/SoundFx";
import PixelCursor from "@/components/PixelCursor";
import { LanguageProvider } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  keywords: [
    "AI OS", "système d'exploitation IA", "agents IA", "automatisation",
    "workflows", "B2B", "Claude", "MCP", "dashboard", "Brain", "Obsidian", "France",
  ],
  alternates: { canonical: "/", languages: { "fr-FR": "/", "x-default": "/" } },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    alternateLocale: ["en_US"],
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c2a1c",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `(function(){try{var t=localStorage.getItem('site-theme');var d=document.documentElement;if(t==='light'){d.classList.remove('dark');d.classList.add('light');}else{d.classList.add('dark');}var l=localStorage.getItem('site-lang');if(l==='en'||l==='fr'){d.lang=l;}}catch(e){}})();`;
  const orgLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: SITE.name, url: SITE.url, email: SITE.email, logo: `${SITE.url}/icon.svg`, description: SITE.description },
      { "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "fr-FR" },
    ],
  };
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body className="antialiased font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <SoundFx />
        <PixelCursor />
        <Toaster />
      </body>
    </html>
  );
}
