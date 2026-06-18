import type { Metadata } from "next";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Audit gratuit",
  description:
    "Configurez votre AI OS sur mesure : décrivez votre entreprise, vos process et vos objectifs. On revient sous 48h avec une architecture d'agents, de workflows et un Brain prêt à instancier.",
  alternates: { canonical: "/onboarding" },
  openGraph: {
    title: "Audit gratuit · AI For Everyone",
    description: "Décrivez votre entreprise et recevez une architecture d'AI OS sur mesure sous 48h.",
    url: "/onboarding",
  },
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
