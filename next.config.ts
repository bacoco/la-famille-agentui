import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/maman",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/maman",
  },
};

export default nextConfig;
