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
  title: "Solacial — You don't have to carry it alone",
  description:
    "A quiet, anonymous place to share what you're going through, find people who understand, and feel a little less alone.",
  keywords: [
    "Solacial",
    "anonymous support",
    "support community",
    "shared experiences",
    "loneliness",
    "mental wellbeing",
    "India",
  ],
  openGraph: {
    title: "Solacial — You don't have to carry it alone",
    description:
      "Share what you're going through. Find people who understand. Feel a little less alone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/community"
      signUpForceRedirectUrl="/community"
      signInFallbackRedirectUrl="/community"
      signUpFallbackRedirectUrl="/community"
    >
      <html lang="en" className={`${inter.variable} ${lora.variable}`}>
        <body className="bg-stone-50 text-gray-900 antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}