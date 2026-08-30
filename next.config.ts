import type { NextConfig } from "next";

const analysisServiceOrigin =
  process.env.ANALYSIS_SERVICE_URL ?? "http://127.0.0.1:8765";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
  async rewrites() {
    return [
      {
        source: "/api/analysis/:path*",
        destination: `${analysisServiceOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
