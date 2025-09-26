import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   turbopack: {
    root: __dirname, // ensure correct root
  },
};

export default nextConfig;
