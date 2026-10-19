import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    // Utgå från konfigurationsfilens plats även när projektmappen flyttas.
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
