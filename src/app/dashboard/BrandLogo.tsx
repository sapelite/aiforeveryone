"use client";

import { useState } from "react";

/** Real brand logo via Google's favicon service, with a clean initial-letter fallback. */
export function BrandLogo({ domain, name, size = 22 }: { domain?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!domain || err) {
    return (
      <span
        style={{ width: size, height: size }}
        className="grid place-items-center rounded-md bg-[var(--bg-card-hover)] text-[11px] font-semibold text-[var(--text-muted)]"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErr(true)}
      className="rounded-[5px]"
    />
  );
}
