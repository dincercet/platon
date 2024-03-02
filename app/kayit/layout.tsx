import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "theme";
import MantineHeader from "../components/header/MantineHeader";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme}>
      <MantineHeader />
      {children}
    </MantineProvider>
  );
}
