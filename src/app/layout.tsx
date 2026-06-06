import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const press = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-press", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-term", display: "swap" });

export const metadata: Metadata = {
  title: "AI For Everyone — pixel AI Operating System",
  description:
    "On construit des systèmes d'exploitation IA sur mesure pour les entreprises. Agents, workflows, dashboards et mémoire d'entreprise, façon OS rétro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `(function(){try{var t=localStorage.getItem('site-theme');var d=document.documentElement;if(t==='light'){d.classList.remove('dark');d.classList.add('light');}else{d.classList.add('dark');}}catch(e){}})();`;
  return (
    <html lang="fr" suppressHydrationWarning className={`dark ${press.variable} ${vt323.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
