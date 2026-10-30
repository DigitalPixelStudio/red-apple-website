import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Red Apple Mobile Repair — Halasuru, Bengaluru",
    short_name: "Red Apple Repair",
    description: "Apple repair specialists — iPhone, iPad, Watch, AirPods, MacBook & Mac. Halasuru, Bengaluru.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d1d1f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
