import type { Metadata } from "next";
import type { ReactNode } from "react";
import { domainConfig } from "@/server/domain/config/domain.config";
import "./globals.css";

export const metadata: Metadata = {
  title: domainConfig.ui.appName,
  description: domainConfig.ui.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
