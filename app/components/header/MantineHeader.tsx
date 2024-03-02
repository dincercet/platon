"use client";
import { Button, Container } from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import classes from "./MantineHeader.module.css";

//this component is used above the pages where mantine is used instead of tailwind.
//for tailwind pages, see Header.tsx component
export default function MantineHeader() {
  const router = useRouter();

  return (
    <header className={classes.header}>
      <Container size="md">
        <Button
          variant="outline"
          leftSection={<IconArrowBack size={16} />}
          onClick={() => router.push("/")}
        >
          Ana Sayfa
        </Button>
      </Container>
    </header>
  );
}
