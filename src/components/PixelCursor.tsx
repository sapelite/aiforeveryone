"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pixel-art arrow cursor that follows the mouse, with a blocky burst on click.
 * Mouse devices only (skips touch). Position is driven straight through a ref so
 * the move handler never triggers a React re-render.
 */
export default function PixelCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    document.documentElement.classList.add("pixcur");

    const move = (e: MouseEvent) => {
      const el = ref.current;
      if (el) { el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; el.style.opacity = "1"; }
    };
    const down = (e: MouseEvent) => {
      ref.current?.classList.add("pixcur-arrow--down");
      const id = ++idRef.current;
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => setBursts((b) => b.filter((k) => k.id !== id)), 420);
    };
    const up = () => ref.current?.classList.remove("pixcur-arrow--down");
    const leave = () => { if (ref.current) ref.current.style.opacity = "0"; };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down, { passive: true });
    window.addEventListener("mouseup", up, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("pixcur");
    };
  }, []);

  if (!on) return null;
  return (
    <div className="pixcur-layer" aria-hidden="true">
      <div ref={ref} className="pixcur-arrow" style={{ opacity: 0 }}>
        <svg width="15" height="24" viewBox="0 0 12 20" shapeRendering="crispEdges">
          <path d="M0 0 L0 16 L4 12 L7 19 L9 18 L6 11 L11 11 Z" fill="var(--text)" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="miter" />
        </svg>
      </div>
      {bursts.map((b) => (
        <span key={b.id} className="pixcur-burst" style={{ left: b.x, top: b.y }} />
      ))}
    </div>
  );
}
