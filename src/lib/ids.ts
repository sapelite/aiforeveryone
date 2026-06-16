/**
 * Sanitise an instance id before it is used to build a filesystem path.
 * Strips anything that isn't a-z, 0-9, hyphen or underscore, which makes
 * path traversal (e.g. "../../etc") impossible. Falls back to the demo id.
 */
export function safeId(id: unknown): string {
  const s = String(id ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return s || "acme-corp";
}
