// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
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
        <body className="bg-stone-50 text-gray-900 antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
