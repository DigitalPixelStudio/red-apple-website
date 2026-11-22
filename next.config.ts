import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/(.*)",
        has: [{ type: "header", key: "host", value: ".*\\.vercel\\.app(?::\\d+)?" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // CRITICAL: do NOT add an x-vercel-deployment-url rule here. Vercel injects a
      // *.vercel.app value into that header even on the production domain, which made
      // www.redmobilerepair.in serve `noindex, nofollow` and deindex itself (v8 regression).
      // The host rule above already covers every staging clone.
    ];
  },
};

export default nextConfig;
