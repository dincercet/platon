import { Container } from "@mantine/core";
import AdminLoginHeader from "./components/AdminLoginHeader";
import LoginForm from "../giris/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <Container size={420} my={40}>
      <AdminLoginHeader />
      <LoginForm />
    </Container>
  );
}
