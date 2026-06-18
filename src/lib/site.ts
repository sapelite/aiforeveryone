// Single source of truth for site-wide SEO metadata.

export const SITE = {
  name: "AI For Everyone",
  title: "AI For Everyone · système d'exploitation IA pour entreprises",
  description:
    "On construit des systèmes d'exploitation IA sur mesure pour les entreprises B2B : agents autonomes, workflows intelligents, dashboards décisionnels et une mémoire d'entreprise vivante.",
  locale: "fr_FR",
  email: "contact@aiforeveryone.fr",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://aiforeveryone.fr" // TODO: set the real production domain
        : "http://localhost:3000"),
};
