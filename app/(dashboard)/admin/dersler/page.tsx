"use client";
import { Button, Flex, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import AddCourseModal from "./components/AddCourseModal";

export default function CoursesPage() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <AddCourseModal opened={opened} close={close} />
      <Flex m={rem(8)}>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Ders Ekle
        </Button>
      </Flex>
    </>
  );
}
