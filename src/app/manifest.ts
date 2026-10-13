import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#f7f3ec",
    icons: [
      { src: "/brand/png/scult-academy-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/png/scult-academy-app-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/svg/scult-academy-mark-square.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
