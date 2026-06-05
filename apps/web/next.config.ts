import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root for output file tracing (the repo root, two levels up)
  // so Next.js does not infer an unrelated lockfile elsewhere on the machine.
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  // Compile the shared workspace package as part of the app build.
  transpilePackages: ["@riz/shared"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
