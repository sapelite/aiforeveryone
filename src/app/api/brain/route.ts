import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { safeId } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real Obsidian / Markdown vault connection.
 * The app runs on Node, so it reads & writes actual files on disk.
 * - Default vault: clients/<id>/01-company-brain (already an Obsidian-compatible vault).
 * - Connect an external vault by absolute path → persisted in clients/<id>/brain.json.
 * All file access is path-guarded inside the vault root.
 */

const CLIENTS = path.join(process.cwd(), "clients");
const IGNORE = new Set([".obsidian", ".trash", ".git", "node_modules", ".DS_Store", ".vscode"]);

function configFile(id: string) { return path.join(CLIENTS, id, "brain.json"); }

async function readConfig(id: string): Promise<{ vaultPath?: string; connectedAt?: string }> {
  try { return JSON.parse(await fs.readFile(configFile(id), "utf8")); } catch { return {}; }
}
async function writeConfig(id: string, cfg: object) {
  try {
    await fs.mkdir(path.join(CLIENTS, id), { recursive: true });
    await fs.writeFile(configFile(id), JSON.stringify(cfg, null, 2), "utf8");
  } catch { /* hôte en lecture seule (ex. Vercel) */ }
}
async function isDir(p: string) {
  try { return (await fs.stat(p)).isDirectory(); } catch { return false; }
}

async function vaultFor(id: string) {
  const cfg = await readConfig(id);
  if (cfg.vaultPath && (await isDir(cfg.vaultPath))) {
    return { path: cfg.vaultPath, external: true, connectedAt: cfg.connectedAt ?? null };
  }
  return { path: path.join(CLIENTS, id, "01-company-brain"), external: false, connectedAt: null };
}

async function walk(dir: string, base: string, out: string[], depth = 0) {
  if (depth > 8 || out.length > 1000) return;
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, base, out, depth + 1);
    else if (e.name.toLowerCase().endsWith(".md")) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
}

function safeJoin(base: string, rel: string): string | null {
  const root = path.resolve(base);
  const target = path.resolve(root, rel);
  if (target === root || target.startsWith(root + path.sep)) return target;
  return null;
}

async function listNotes(vaultPath: string) {
  const rels: string[] = [];
  await walk(vaultPath, vaultPath, rels);
  rels.sort();
  return rels.map((rel) => ({
    rel,
    title: (rel.split("/").pop() ?? rel).replace(/\.md$/i, ""),
    dir: rel.includes("/") ? rel.split("/").slice(0, -1).join("/") : "",
  }));
}

/* GET ?id=  → status + notes ; GET ?id=&file=REL → note content */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = safeId(url.searchParams.get("id"));
  const file = url.searchParams.get("file");
  const vault = await vaultFor(id);

  if (file) {
    const target = safeJoin(vault.path, file);
    if (!target) return NextResponse.json({ error: "chemin invalide" }, { status: 400 });
    try {
      const content = await fs.readFile(target, "utf8");
      return NextResponse.json({ ok: true, file, content });
    } catch {
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }
  }

  const notes = await listNotes(vault.path);
  const isObsidian = await isDir(path.join(vault.path, ".obsidian"));
  return NextResponse.json({
    ok: true, connected: vault.external, vaultPath: vault.path,
    isObsidian, connectedAt: vault.connectedAt, count: notes.length, notes,
  });
}

/* POST connect {id, vaultPath} | disconnect {id, disconnect:true} */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);

  if (body.disconnect) {
    await writeConfig(id, {});
    const vault = await vaultFor(id);
    const notes = await listNotes(vault.path);
    return NextResponse.json({ ok: true, connected: false, vaultPath: vault.path, count: notes.length });
  }

  // Sur un hôte partagé, lire un dossier arbitraire du serveur est un risque (LFI). Désactivé en prod.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Connexion d'un vault externe indisponible sur la démo hébergée." }, { status: 403 });
  }

  const vaultPath = (body.vaultPath ?? "").trim();
  if (!vaultPath) return NextResponse.json({ error: "Chemin du vault requis." }, { status: 400 });
  if (!(await isDir(vaultPath))) return NextResponse.json({ error: "Dossier introuvable sur le disque." }, { status: 400 });

  await writeConfig(id, { vaultPath, connectedAt: new Date().toISOString() });
  const notes = await listNotes(vaultPath);
  const isObsidian = await isDir(path.join(vaultPath, ".obsidian"));
  return NextResponse.json({ ok: true, connected: true, vaultPath, isObsidian, count: notes.length });
}

/* PUT save/create {id, file, content} → writes the note to disk */
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = safeId(body.id);
  let file = (body.file ?? "").trim();
  if (!file) return NextResponse.json({ error: "fichier requis" }, { status: 400 });
  if (!file.toLowerCase().endsWith(".md")) file += ".md";

  const vault = await vaultFor(id);
  const target = safeJoin(vault.path, file);
  if (!target) return NextResponse.json({ error: "chemin invalide" }, { status: 400 });

  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body.content ?? "", "utf8");
  } catch {
    return NextResponse.json({ ok: false, error: "Vault en lecture seule sur cet hébergement (démo)." });
  }
  return NextResponse.json({ ok: true, file, vaultPath: vault.path });
}
