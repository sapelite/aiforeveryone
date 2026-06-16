import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the heavy local-only Claude Agent SDK out of the serverless bundle.
  // On a server (Vercel) the AI routes use the Anthropic API via ANTHROPIC_API_KEY;
  // the Agent SDK is only dynamically imported during local development.
  serverExternalPackages: ["@anthropic-ai/claude-agent-sdk"],

  // Ship the seeded client data so the dashboard can read it on the server.
  outputFileTracingIncludes: {
    "/api/**": ["./clients/**"],
    "/dashboard": ["./clients/**"],
  },

  // Baseline security headers (no strict CSP, to keep the inline theme script working).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
