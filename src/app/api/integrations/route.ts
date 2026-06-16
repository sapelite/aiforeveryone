import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { safeId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENTS = path.join(process.cwd(), "clients");

/** Catalogue de connecteurs MCP proposés. `domain` sert au vrai logo de marque. */
const CATALOG = [
  { key: "obsidian", name: "Obsidian", category: "Brain / Vault", icon: "brain", domain: "obsidian.md", brain: true, desc: "Le cerveau vivant de l'entreprise — vault Markdown maintenu par vos agents.", aliases: ["obsidian", "vault", "brain"] },
  { key: "google-drive", name: "Google Drive", category: "Stockage", icon: "drive", domain: "drive.google.com", desc: "Documents et fichiers de l'entreprise.", aliases: ["google-drive", "drive", "google workspace"] },
  { key: "google-sheets", name: "Google Sheets", category: "Données", icon: "sheet", domain: "sheets.google.com", desc: "Feuilles de calcul, KPIs, exports.", aliases: ["google-sheets", "sheets", "google workspace"] },
  { key: "gmail", name: "Gmail", category: "Email", icon: "mail", domain: "mail.google.com", desc: "Tri de l'entrant, envoi validé.", aliases: ["gmail", "email", "google workspace"] },
  { key: "google-calendar", name: "Google Calendar", category: "Agenda", icon: "calendar", domain: "calendar.google.com", desc: "Réunions et disponibilités.", aliases: ["calendar", "gcal", "google workspace"] },
  { key: "slack", name: "Slack", category: "Communication", icon: "chat", domain: "slack.com", desc: "Messages, alertes, briefs d'équipe.", aliases: ["slack"] },
  { key: "notion", name: "Notion", category: "Connaissance", icon: "doc", domain: "notion.so", desc: "Base de connaissance et projets.", aliases: ["notion"] },
  { key: "hubspot", name: "HubSpot", category: "CRM", icon: "crm", domain: "hubspot.com", desc: "Comptes, deals, pipeline.", aliases: ["hubspot"] },
  { key: "github", name: "GitHub", category: "Code", icon: "code", domain: "github.com", desc: "Issues, PRs, releases.", aliases: ["github", "gh"] },
  { key: "stripe", name: "Stripe", category: "Paiements", icon: "card", domain: "stripe.com", desc: "MRR, factures, revenus.", aliases: ["stripe"] },
  { key: "linear", name: "Linear", category: "Projets", icon: "kanban", domain: "linear.app", desc: "Tickets et roadmap produit.", aliases: ["linear"] },
  { key: "airtable", name: "Airtable", category: "Données", icon: "sheet", domain: "airtable.com", desc: "Bases de données no-code.", aliases: ["airtable"] },
  { key: "salesforce", name: "Salesforce", category: "CRM", icon: "crm", domain: "salesforce.com", desc: "CRM entreprise, comptes et pipeline.", aliases: ["salesforce"] },

  // Communication
  { key: "microsoft-teams", name: "Microsoft Teams", category: "Communication", icon: "chat", domain: "microsoft.com", desc: "Messages, réunions et canaux d'équipe.", aliases: ["teams", "microsoft teams", "microsoft 365"] },
  { key: "discord", name: "Discord", category: "Communication", icon: "chat", domain: "discord.com", desc: "Serveurs, salons et communauté.", aliases: ["discord"] },
  { key: "zoom", name: "Zoom", category: "Visio", icon: "video", domain: "zoom.us", desc: "Réunions et webinaires.", aliases: ["zoom"] },
  { key: "telegram", name: "Telegram", category: "Messagerie", icon: "send", domain: "telegram.org", desc: "Bots et notifications temps réel.", aliases: ["telegram"] },
  { key: "outlook", name: "Outlook", category: "Email", icon: "mail", domain: "outlook.com", desc: "Email et agenda Microsoft 365.", aliases: ["outlook", "microsoft 365", "office"] },

  // Stockage & documents
  { key: "dropbox", name: "Dropbox", category: "Stockage", icon: "drive", domain: "dropbox.com", desc: "Fichiers et partage.", aliases: ["dropbox"] },
  { key: "box", name: "Box", category: "Stockage", icon: "drive", domain: "box.com", desc: "Stockage et collaboration sécurisés.", aliases: ["box"] },
  { key: "onedrive", name: "OneDrive", category: "Stockage", icon: "drive", domain: "onedrive.com", desc: "Fichiers Microsoft 365.", aliases: ["onedrive", "microsoft 365"] },
  { key: "confluence", name: "Confluence", category: "Connaissance", icon: "doc", domain: "atlassian.com", desc: "Wiki et documentation d'équipe.", aliases: ["confluence", "atlassian"] },

  // Gestion de projet
  { key: "jira", name: "Jira", category: "Projets", icon: "kanban", domain: "atlassian.com", desc: "Tickets, sprints et suivi.", aliases: ["jira", "atlassian"] },
  { key: "asana", name: "Asana", category: "Projets", icon: "kanban", domain: "asana.com", desc: "Tâches et projets d'équipe.", aliases: ["asana"] },
  { key: "trello", name: "Trello", category: "Projets", icon: "kanban", domain: "trello.com", desc: "Tableaux kanban.", aliases: ["trello"] },
  { key: "clickup", name: "ClickUp", category: "Projets", icon: "kanban", domain: "clickup.com", desc: "Gestion de projets tout-en-un.", aliases: ["clickup"] },
  { key: "monday", name: "monday.com", category: "Projets", icon: "kanban", domain: "monday.com", desc: "Work OS et workflows.", aliases: ["monday"] },

  // CRM & ventes
  { key: "pipedrive", name: "Pipedrive", category: "CRM", icon: "crm", domain: "pipedrive.com", desc: "Pipeline commercial.", aliases: ["pipedrive"] },
  { key: "zoho", name: "Zoho", category: "CRM", icon: "crm", domain: "zoho.com", desc: "Suite CRM et bureautique.", aliases: ["zoho"] },
  { key: "intercom", name: "Intercom", category: "Support", icon: "chat", domain: "intercom.com", desc: "Messagerie client et support.", aliases: ["intercom"] },

  // Support
  { key: "zendesk", name: "Zendesk", category: "Support", icon: "chat", domain: "zendesk.com", desc: "Tickets et helpdesk.", aliases: ["zendesk"] },
  { key: "freshdesk", name: "Freshdesk", category: "Support", icon: "chat", domain: "freshdesk.com", desc: "Support client et SAV.", aliases: ["freshdesk", "freshworks"] },

  // Marketing & messages
  { key: "mailchimp", name: "Mailchimp", category: "Marketing", icon: "mail", domain: "mailchimp.com", desc: "Emailing et campagnes.", aliases: ["mailchimp"] },
  { key: "brevo", name: "Brevo", category: "Marketing", icon: "mail", domain: "brevo.com", desc: "Emailing, SMS et automation.", aliases: ["brevo", "sendinblue"] },
  { key: "twilio", name: "Twilio", category: "Communication", icon: "send", domain: "twilio.com", desc: "SMS, voix et API messages.", aliases: ["twilio"] },

  // Paiements & finance
  { key: "paypal", name: "PayPal", category: "Paiements", icon: "card", domain: "paypal.com", desc: "Paiements et transactions.", aliases: ["paypal"] },
  { key: "quickbooks", name: "QuickBooks", category: "Finance", icon: "card", domain: "intuit.com", desc: "Comptabilité et factures.", aliases: ["quickbooks", "intuit"] },
  { key: "pennylane", name: "Pennylane", category: "Finance", icon: "card", domain: "pennylane.com", desc: "Compta et gestion financière.", aliases: ["pennylane"] },

  // E-commerce
  { key: "shopify", name: "Shopify", category: "E-commerce", icon: "card", domain: "shopify.com", desc: "Boutique, commandes et produits.", aliases: ["shopify"] },

  // Développement
  { key: "gitlab", name: "GitLab", category: "Code", icon: "code", domain: "gitlab.com", desc: "Repos, CI/CD et issues.", aliases: ["gitlab"] },
  { key: "sentry", name: "Sentry", category: "Code", icon: "code", domain: "sentry.io", desc: "Suivi des erreurs et performance.", aliases: ["sentry"] },

  // Données
  { key: "supabase", name: "Supabase", category: "Données", icon: "sheet", domain: "supabase.com", desc: "Base Postgres et backend.", aliases: ["supabase"] },
  { key: "mongodb", name: "MongoDB", category: "Données", icon: "sheet", domain: "mongodb.com", desc: "Base de données documents.", aliases: ["mongodb", "mongo"] },
  { key: "snowflake", name: "Snowflake", category: "Données", icon: "sheet", domain: "snowflake.com", desc: "Entrepôt de données cloud.", aliases: ["snowflake"] },

  // Design, agenda & automatisation
  { key: "figma", name: "Figma", category: "Design", icon: "doc", domain: "figma.com", desc: "Maquettes et design produit.", aliases: ["figma"] },
  { key: "calendly", name: "Calendly", category: "Agenda", icon: "calendar", domain: "calendly.com", desc: "Prise de rendez-vous.", aliases: ["calendly"] },
  { key: "zapier", name: "Zapier", category: "Automatisation", icon: "plug", domain: "zapier.com", desc: "Connecte des milliers d'apps.", aliases: ["zapier"] },
  { key: "make", name: "Make", category: "Automatisation", icon: "plug", domain: "make.com", desc: "Scénarios d'automatisation visuels.", aliases: ["make", "integromat"] },
  { key: "n8n", name: "n8n", category: "Automatisation", icon: "plug", domain: "n8n.io", desc: "Automatisation open-source.", aliases: ["n8n"] },

  // IA
  { key: "openai", name: "OpenAI", category: "IA", icon: "brain", domain: "openai.com", desc: "Modèles GPT et embeddings.", aliases: ["openai", "gpt", "chatgpt"] },
];

type ConnState = Record<string, { status: "connected" | "disconnected"; connectedAt?: string; custom?: { name: string; url: string; category?: string } }>;

const kebab = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Repli mémoire pour hôtes en lecture seule (ex. Vercel) : GET et POST partagent
// ce module, donc connecter/déconnecter reste fonctionnel le temps de l'instance.
const memConn = new Map<string, ConnState>();

async function readState(base: string): Promise<ConnState> {
  if (memConn.has(base)) return memConn.get(base)!;
  try { return JSON.parse(await fs.readFile(path.join(base, "connections.json"), "utf8")); } catch { return {}; }
}
async function writeState(base: string, s: ConnState) {
  memConn.set(base, s);
  try {
    await fs.mkdir(base, { recursive: true });
    await fs.writeFile(path.join(base, "connections.json"), JSON.stringify(s, null, 2), "utf8");
  } catch { /* hôte en lecture seule */ }
}
async function detectedTools(base: string): Promise<string[]> {
  try {
    const p = JSON.parse(await fs.readFile(path.join(base, "business-personality.json"), "utf8"));
    return (p.tools ?? []).map((t: { name: string }) => t.name.toLowerCase());
  } catch { return []; }
}

/* GET /api/integrations?id= → catalogue + état */
export async function GET(req: Request) {
  const id = safeId(new URL(req.url).searchParams.get("id"));
  const base = path.join(CLIENTS, id);
  const state = await readState(base);
  const detected = await detectedTools(base);

  const items = CATALOG.map((c) => ({
    ...c,
    connected: state[c.key]?.status === "connected",
    detected: c.aliases.some((a) => detected.some((d) => d.includes(a) || a.includes(d))),
  }));

  // connecteurs personnalisés ajoutés par l'utilisateur
  const custom = Object.entries(state)
    .filter(([, v]) => v.custom)
    .map(([key, v]) => ({
      key, name: v.custom!.name, category: v.custom!.category ?? "MCP", icon: "plug",
      desc: v.custom!.url, aliases: [], connected: v.status === "connected", detected: false, custom: true,
    }));

  return NextResponse.json({ ok: true, items: [...items, ...custom] });
}

/* POST → connecter (catalogue ou MCP perso) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  const base = path.join(CLIENTS, id);
  const state = await readState(base);

  if (body.custom) {
    const name = (body.name || "").trim();
    const url = (body.url || "").trim();
    if (!name || !url) return NextResponse.json({ error: "name + url requis" }, { status: 400 });
    const key = `custom-${kebab(name)}`;
    state[key] = { status: "connected", connectedAt: new Date().toISOString(), custom: { name, url, category: body.category } };
    await writeState(base, state);
    return NextResponse.json({ ok: true, key, name });
  }

  const key = body.key;
  if (!key) return NextResponse.json({ error: "key requis" }, { status: 400 });
  state[key] = { status: "connected", connectedAt: new Date().toISOString() };
  await writeState(base, state);
  return NextResponse.json({ ok: true, key });
}

/* PATCH → déconnecter */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  const key = body.key;
  if (!key) return NextResponse.json({ error: "key requis" }, { status: 400 });
  const base = path.join(CLIENTS, id);
  const state = await readState(base);
  if (state[key]?.custom) delete state[key];
  else state[key] = { status: "disconnected" };
  await writeState(base, state);
  return NextResponse.json({ ok: true, key });
}
