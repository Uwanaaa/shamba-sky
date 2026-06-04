import type { Metadata } from "next";
import { Caveat, Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shamba Sky — Farm plot weather brief",
  description:
    "A cozy farmer web app for comparing shamba plots with Weather-AI forecasts and AI farming tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full bg-cream text-soil antialiased">{children}</body>
    </html>
  );
}
