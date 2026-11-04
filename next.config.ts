import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN || "https://api.floraandcreations.com";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "api.floraandcreations.com", pathname: "/api/assets/uploads/**" },
      { protocol: "https", hostname: "floraandcreations.com", pathname: "/api/assets/uploads/**" },
      { protocol: "https", hostname: "www.floraandcreations.com", pathname: "/api/assets/uploads/**" }
    ]
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  }
};

export default nextConfig;
