import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads d’images via Server Actions (max 5 Mo côté app + marge multipart).
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

export default nextConfig;
