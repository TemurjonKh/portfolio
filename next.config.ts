import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local uploads are served from /uploads; production uploads come from Vercel Blob.
  images: { formats: ["image/avif", "image/webp"], remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
