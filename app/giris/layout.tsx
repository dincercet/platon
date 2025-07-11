import "@mantine/core/styles.layer.css";

import { MantineProvider } from "@mantine/core";
import { theme } from "theme";
import MantineHeader from "../components/header/MantineHeader";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <MantineHeader />
      {children}
    </MantineProvider>
  );
}
