"server only";
import React from "react";
import type { Metadata } from "next";

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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
