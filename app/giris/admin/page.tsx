import "@mantine/core/styles.css";
import { Container } from "@mantine/core";
import AdminLoginHeader from "./components/AdminLoginHeader";
import LoginForm from "../components/LoginForm";
import { MantineProvider } from "@mantine/core";
import { theme } from "theme";

export default function AdminLoginPage() {
  return (
    <MantineProvider theme={theme}>
      <Container size={420} my={40}>
        <AdminLoginHeader />
        <LoginForm />
      </Container>
    </MantineProvider>
  );
}
