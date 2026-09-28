import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted so builds never depend on reaching Google Fonts.
const display = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Temurjon Kholmirzaev: systems engineering, heading toward game AI",
  description: "Integrated Systems Engineering student at Inha University building agents, perception systems, and data systems.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Temurjon Kholmirzaev",
    description: "Agents, perception, and systems projects by an Integrated Systems Engineering student at Inha University.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}><body>{children}</body></html>;
}
