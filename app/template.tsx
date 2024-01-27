import Header from "./components/header/Header";
import { Container } from "@mantine/core";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <Container>{children}</Container>
    </div>
  );
}
