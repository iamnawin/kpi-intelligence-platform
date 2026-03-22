import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ProofPath Phase 1: /goals/* → /achievements/*
      { source: "/goals",             destination: "/achievements",           permanent: false },
      { source: "/goals/new",         destination: "/achievements/new",       permanent: false },
      { source: "/goals/import",      destination: "/achievements/import",    permanent: false },
      { source: "/goals/:id",         destination: "/achievements/:id",       permanent: false },
      { source: "/goals/:id/edit",    destination: "/achievements/:id/edit",  permanent: false },
      // /objectives/* → /profile
      { source: "/objectives",        destination: "/profile",                permanent: false },
      { source: "/objectives/:path*", destination: "/profile",                permanent: false },
      // /settings/integrations → /connections
      { source: "/settings/integrations", destination: "/connections",        permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
