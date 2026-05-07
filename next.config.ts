import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useLightningcss: true,
    turbopackLocalPostcssConfig: true,
  },
};

export default nextConfig;
