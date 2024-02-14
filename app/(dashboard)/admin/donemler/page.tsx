"use client";
import { Button, Flex, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

import AddPeriodModal from "./components/AddPeriodModal";

export default function Page() {
  //handlers to open and close modals
  const [addPeriodOpened, addPeriodHandlers] = useDisclosure(false);

  async function fetchPeriods() {}

  return (
    <>
      {
        //conditional to unmount modal when modal is closed
        addPeriodOpened && (
          <AddPeriodModal
            opened={addPeriodOpened}
            close={addPeriodHandlers.close}
            fetchPeriods={fetchPeriods}
          />
        )
      }
      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={addPeriodHandlers.open}
        >
          Yeni Dönem
        </Button>
      </Flex>
    </>
  );
}
