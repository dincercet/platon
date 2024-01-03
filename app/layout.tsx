import "@mantine/core/styles.css";
import React from "react";
import type { Metadata } from "next";
import { Container, MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "../theme";
import Header from "./components/header/Header";

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
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Header />
          <Container> {children}</Container>
        </MantineProvider>
      </body>
    </html>
  );
}
