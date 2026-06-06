import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

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
];

type ConnState = Record<string, { status: "connected" | "disconnected"; connectedAt?: string; custom?: { name: string; url: string; category?: string } }>;

const kebab = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function readState(base: string): Promise<ConnState> {
  try { return JSON.parse(await fs.readFile(path.join(base, "connections.json"), "utf8")); } catch { return {}; }
}
async function writeState(base: string, s: ConnState) {
  await fs.mkdir(base, { recursive: true });
  await fs.writeFile(path.join(base, "connections.json"), JSON.stringify(s, null, 2), "utf8");
}
async function detectedTools(base: string): Promise<string[]> {
  try {
    const p = JSON.parse(await fs.readFile(path.join(base, "business-personality.json"), "utf8"));
    return (p.tools ?? []).map((t: { name: string }) => t.name.toLowerCase());
  } catch { return []; }
}

/* GET /api/integrations?id= → catalogue + état */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "acme-corp";
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
  const id = body.id ?? "acme-corp";
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
  const id = body.id ?? "acme-corp";
  const key = body.key;
  if (!key) return NextResponse.json({ error: "key requis" }, { status: 400 });
  const base = path.join(CLIENTS, id);
  const state = await readState(base);
  if (state[key]?.custom) delete state[key];
  else state[key] = { status: "disconnected" };
  await writeState(base, state);
  return NextResponse.json({ ok: true, key });
}
