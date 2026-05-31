import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VaultKit — Secrets Manager",
  description: "Agency-focused credential and secrets management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0b0d12] text-[#ededed]">
        <Providers>{children}</Providers>
        <Script src="https://cdn.jsdelivr.net/npm/flyonui@latest/flyonui.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
