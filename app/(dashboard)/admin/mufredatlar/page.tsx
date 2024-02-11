"use client";

import { useDisclosure } from "@mantine/hooks";
import { Flex, rem, Button } from "@mantine/core";
import AddCurriculumModal from "./components/AddCurriculumModal";
import { IconPlus } from "@tabler/icons-react";

export default function Page() {
  //handlers to open and close modals
  const [addCurriculumOpened, addCurriculumHandlers] = useDisclosure(false);

  return (
    <>
      <AddCurriculumModal
        opened={addCurriculumOpened}
        close={addCurriculumHandlers.close}
      />

      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={addCurriculumHandlers.open}
        >
          Müfredat Ekle
        </Button>
      </Flex>
    </>
  );
}
