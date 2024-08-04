"server only";

import "./tailwind.css";
import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const font = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Platon Bilisim Egitim",
  description: "Platon Bilisim Egitim Merkezi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={cn("font-sans antialiased", font.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
