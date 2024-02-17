import { Container, Flex, rem, Text } from "@mantine/core";

export default function Page() {
  return (
    <Flex direction="column" m={rem(8)}>
      <Container>
        <Text>Anasayfa</Text>
      </Container>
    </Flex>
  );
}
