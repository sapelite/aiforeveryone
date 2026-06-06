import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENTS = path.join(process.cwd(), "clients");

const CATS: { dir: string; cat: string }[] = [
  { dir: "identity", cat: "Identité" },
  { dir: "offers", cat: "Offres" },
  { dir: "customers", cat: "Clients" },
  { dir: "positioning", cat: "Positionnement" },
  { dir: "team", cat: "Équipe" },
  { dir: "tools", cat: "Outils" },
  { dir: "processes", cat: "Processus" },
  { dir: "decisions", cat: "Décisions" },
  { dir: "sources", cat: "Sources" },
];

function stripFrontmatter(s: string): string {
  if (s.startsWith("---")) {
    const end = s.indexOf("\n---", 3);
    if (end !== -1) return s.slice(end + 4);
  }
  return s;
}
function titleOf(body: string, fallback: string): string {
  const h = body.split("\n").find((l) => l.trim().startsWith("# "));
  return h ? h.replace(/^#\s+/, "").trim() : fallback;
}
function excerptOf(body: string): string {
  const line = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("---") && !l.startsWith("|"));
  return line ? (line.length > 140 ? line.slice(0, 140) + "…" : line) : "";
}

function isMeaningful(f: string) {
  return f.endsWith(".md") && !f.startsWith("_template") && f.toLowerCase() !== "readme.md";
}

/* GET /api/memories?id=acme-corp           → liste des fiches par catégorie
   GET /api/memories?id=acme-corp&file=REL  → contenu d'une fiche (chemin sécurisé) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "acme-corp";
  const file = url.searchParams.get("file");
  const brain = path.join(CLIENTS, id, "01-company-brain");

  if (file) {
    const resolved = path.resolve(brain, file);
    if (!resolved.startsWith(path.resolve(brain))) {
      return NextResponse.json({ error: "chemin invalide" }, { status: 400 });
    }
    try {
      const content = await fs.readFile(resolved, "utf8");
      return NextResponse.json({ ok: true, content });
    } catch {
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }
  }

  const out: { cat: string; dir: string; files: { name: string; title: string; excerpt: string; rel: string }[] }[] = [];
  for (const { dir, cat } of CATS) {
    const full = path.join(brain, dir);
    let names: string[] = [];
    try { names = (await fs.readdir(full)).filter(isMeaningful); } catch { continue; }
    const files = [];
    for (const name of names) {
      const body = stripFrontmatter(await fs.readFile(path.join(full, name), "utf8"));
      files.push({ name, title: titleOf(body, name.replace(/\.md$/, "")), excerpt: excerptOf(body), rel: `${dir}/${name}` });
    }
    if (files.length) out.push({ cat, dir, files });
  }
  return NextResponse.json({ ok: true, categories: out });
}
