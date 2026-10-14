import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Certificate renderers read these fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/certificates/**": ["./src/assets/fonts/**", "./public/partners/**"],
    "/admin/**": ["./src/assets/fonts/**", "./public/partners/**"],
    "/workshops/**": ["./src/assets/fonts/**", "./public/partners/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
