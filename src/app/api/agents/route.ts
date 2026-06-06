import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { loadInstance } from "@/lib/instance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENTS = path.join(process.cwd(), "clients");

const kebab = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type AgentState = {
  status?: Record<string, "online" | "killed">;
  meta?: Record<string, { display?: string; role?: string; model?: string; description?: string; task?: string }>;
};

async function readState(base: string): Promise<AgentState> {
  try { return JSON.parse(await fs.readFile(path.join(base, "agent-state.json"), "utf8")); }
  catch { return {}; }
}
async function writeState(base: string, state: AgentState) {
  await fs.mkdir(base, { recursive: true });
  await fs.writeFile(path.join(base, "agent-state.json"), JSON.stringify(state, null, 2), "utf8");
}

/* GET /api/agents?id=acme-corp */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "acme-corp";
  const data = await loadInstance(id);
  return NextResponse.json({ agents: data.agents });
}

/* POST — créer un agent (écrit persona + config.yaml + state) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? "acme-corp";
  const display = (body.displayName || body.name || "").trim();
  if (!display) return NextResponse.json({ error: "displayName requis" }, { status: 400 });

  const slug = kebab(body.name || display);
  const base = path.join(CLIENTS, id);
  const agentsDir = path.join(base, "03-agents");
  await fs.mkdir(agentsDir, { recursive: true });

  const model = body.model || "claude-sonnet-4-6";
  const description = (body.description || "").trim();

  // persona.md (CLAUDE.md de l'agent)
  const persona = `---
type: agent
updated: ${new Date().toISOString().slice(0, 10)}
tags: [agent, custom]
role: ${display}
model: ${model}
---

# Agent ${display}

> ${description || "Agent personnalisé de l'AI OS."}

## Mission
${description || "À préciser."}

## Comportement
- Hérite des règles de \`../00-system/operating-rules.md\`.
- Cite ses sources, signale l'incertitude, propose la prochaine action.

## Garde-fous
- Aucune action sortante sans validation.
`;
  await fs.writeFile(path.join(agentsDir, `${slug}.md`), persona, "utf8");

  // config.yaml
  const yaml = `name: ${slug}
display: ${display}
description: ${JSON.stringify(description)}
model: ${model}
telegram:
  bot_token: \${${slug.toUpperCase().replace(/-/g, "_")}_BOT_TOKEN}   # à définir dans l'environnement
status: online
`;
  await fs.writeFile(path.join(agentsDir, `${slug}.config.yaml`), yaml, "utf8");

  // state
  const state = await readState(base);
  state.meta = state.meta ?? {};
  state.status = state.status ?? {};
  state.meta[slug] = { display, role: "Agent personnalisé", model, description };
  state.status[slug] = "online";
  await writeState(base, state);

  return NextResponse.json({ ok: true, slug, display, model });
}

/* PATCH — kill-switch / réactivation */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? "acme-corp";
  const slug = body.slug;
  if (!slug) return NextResponse.json({ error: "slug requis" }, { status: 400 });

  const base = path.join(CLIENTS, id);
  const state = await readState(base);
  state.status = state.status ?? {};
  state.status[slug] = body.killed ? "killed" : "online";
  await writeState(base, state);

  return NextResponse.json({ ok: true, slug, status: state.status[slug] });
}
