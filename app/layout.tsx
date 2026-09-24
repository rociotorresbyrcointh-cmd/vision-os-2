import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision OS — Agenda profesional",
  description: "Sistema de gestión de turnos para clínicas, estética y centros de servicios",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Vision", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0b0f17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'General Sans', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
