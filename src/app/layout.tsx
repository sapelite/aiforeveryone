import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import SoundFx from "@/components/SoundFx";
import PixelCursor from "@/components/PixelCursor";
import { LanguageProvider } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const press = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-press", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-term", display: "swap" });

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
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
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
  const themeScript = `(function(){try{var t=localStorage.getItem('site-theme');var d=document.documentElement;if(t==='light'){d.classList.remove('dark');d.classList.add('light');}else{d.classList.add('dark');}}catch(e){}})();`;
  return (
    <html lang="fr" suppressHydrationWarning className={`dark ${press.variable} ${vt323.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
