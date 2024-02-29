import "@mantine/core/styles.css";
import { Container } from "@mantine/core";
import StudentLoginHeader from "./components/StudentLoginHeader";
import LoginForm from "./components/LoginForm";
import { MantineProvider } from "@mantine/core";
import { theme } from "theme";

export default function StudentLoginPage() {
  return (
    <MantineProvider theme={theme}>
      <Container size={420} my={40}>
        <StudentLoginHeader />
        <LoginForm />
      </Container>
    </MantineProvider>
  );
}
