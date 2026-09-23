import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para que Turbopack no vigile toda la
  // carpeta de usuario (evita compilaciones lentas en desarrollo).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // La página de inicio (landing) es un HTML estático en /public/inicio.html.
  // La app (login, agenda, reservas, etc.) sigue igual.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/inicio.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
