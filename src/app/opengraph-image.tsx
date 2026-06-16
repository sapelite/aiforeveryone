import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "0 90px", background: "#0c2a1c", color: "#56e08a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 34, height: 34, background: "#e25fa0", border: "5px solid #56e08a" }} />
          <div style={{ fontSize: 30, letterSpacing: 4 }}>AIFOREVERYONE.OS</div>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 30 }}>
          Votre entreprise, pilotée par l&apos;IA.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#3fa869", marginTop: 26 }}>
          Agents · Workflows · Dashboards · Brain vivant
        </div>
      </div>
    ),
    size,
  );
}
