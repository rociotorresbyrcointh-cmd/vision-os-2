import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para que Turbopack no vigile toda la
  // carpeta de usuario (evita compilaciones lentas en desarrollo).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
