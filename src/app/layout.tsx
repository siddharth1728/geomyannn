import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GEORYNTH — Geospatial Mission Control",
  description: "Global Geographical Intelligence & Mobility Platform. The world, connected.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased select-none">{children}</body>
    </html>
  );
}
