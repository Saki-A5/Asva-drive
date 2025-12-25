import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost', 'undefined']
};

module.exports = {
  productionBrowserSourceMaps: false,
};

export default nextConfig;
