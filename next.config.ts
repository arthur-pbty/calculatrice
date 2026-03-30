import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Mode standalone : génère un dossier autonome pour Docker */
  output: "standalone",
};

export default nextConfig;
