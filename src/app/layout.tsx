// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Saathi — You don't have to figure everything out alone",
  description:
    "A safe, anonymous support community. Share your story, find people who understand, and give and receive support — completely free.",
  keywords: ["support", "mental health", "community", "anonymous", "India"],
  openGraph: {
    title: "Saathi — You don't have to figure everything out alone",
    description: "Share your story. Find support. Feel less alone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${lora.variable}`}>
        <body className="bg-stone-50 text-gray-900 antialiased font-sans flex flex-col min-h-screen">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-stone-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
              <span>© {new Date().getFullYear()} Saathi · A safe space for honest conversations</span>
              <nav className="flex items-center gap-4">
                <Link href="/guidelines" className="hover:text-gray-700 transition-colors">Guidelines</Link>
                <Link href="/privacy"    className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
                <a href="mailto:hello@saathi.app" className="hover:text-gray-700 transition-colors">Contact</a>
              </nav>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
