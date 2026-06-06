"use client";

import { Icon, addCollection } from "@iconify/react";
import pixelarticons from "@iconify-json/pixelarticons/icons.json";

// Register the MIT pixelarticons set once, offline (no network fetch).
addCollection(pixelarticons as Parameters<typeof addCollection>[0]);

export function PixelIcon({
  name,
  className,
  size = 20,
}: {
  name: string;
  className?: string;
  size?: number | string;
}) {
  return <Icon icon={`pixelarticons:${name}`} className={className} width={size} height={size} aria-hidden />;
}
