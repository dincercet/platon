import { Container } from "@mantine/core";
import StudentLoginHeader from "./components/StudentLoginHeader";
import LoginForm from "./components/LoginForm";

export default function StudentLoginPage() {
  return (
    <Container size={420} my={40}>
      <StudentLoginHeader />
      <LoginForm />
    </Container>
  );
}
