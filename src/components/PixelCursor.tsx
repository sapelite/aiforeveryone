"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pixel-art arrow cursor that follows the mouse, with a blocky burst on click.
 * Fully imperative after mount: position, the click squish, and the bursts are
 * all driven through refs / plain DOM, so the component renders ONCE and never
 * re-renders (a re-render would reset the inline transform and make it jump).
 * Mouse devices only (skips touch).
 */
export default function PixelCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    document.documentElement.classList.add("pixcur");

    const move = (e: MouseEvent) => {
      const el = arrowRef.current;
      if (el) { el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; el.style.opacity = "1"; }
    };
    const down = (e: MouseEvent) => {
      arrowRef.current?.classList.add("pixcur-arrow--down");
      const layer = layerRef.current;
      if (layer) {
        const burst = document.createElement("span");
        burst.className = "pixcur-burst";
        burst.style.left = `${e.clientX}px`;
        burst.style.top = `${e.clientY}px`;
        layer.appendChild(burst);
        window.setTimeout(() => burst.remove(), 450);
      }
    };
    const up = () => arrowRef.current?.classList.remove("pixcur-arrow--down");

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down, { passive: true });
    window.addEventListener("mouseup", up, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("pixcur");
    };
  }, []);

  if (!on) return null;
  return (
    <div ref={layerRef} className="pixcur-layer" aria-hidden="true">
      <div ref={arrowRef} className="pixcur-arrow">
        <svg width="15" height="24" viewBox="0 0 12 20" shapeRendering="crispEdges">
          <path d="M0 0 L0 16 L4 12 L7 19 L9 18 L6 11 L11 11 Z" fill="var(--text)" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="miter" />
        </svg>
      </div>
    </div>
  );
}
