import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/sodDiagram",
  assetPrefix: "/sodDiagram/",
  trailingSlash: true,
  // images: {
  //   localPatterns: [
  //     {
  //       pathname: "/src/public",
  //       search: "",
  //     },
  //   ],
  // },
  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
