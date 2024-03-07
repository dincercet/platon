//modal to show list of documents based on a period

import {
  ActionIcon,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function ShowDocumentsModal({
  opened,
  close,
  periodId,
}: {
  opened: boolean;
  close: () => void;
  periodId: number;
}) {
  const [weeks, setWeeks] = useState<
    {
      weekId: number;
      weekNo: number;
      documents: { documentId: number; fileName: string }[];
    }[]
  >([]);

  useEffect(() => {
    fetchDocuments();
    console.log("useEffect fetchDocuments called");
  }, []);

  //call to getDocuments api, then set weeks state
  async function fetchDocuments() {
    try {
      const res = await fetch(
        `/panel/api/getDocuments?periodId=${periodId}&email=${localStorage.getItem("email")}`,
        { method: "GET" },
      );
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set weeks array state
      if (resParsed.documents.length > 0) {
        setWeeks(
          resParsed.documents.map((week: any) => {
            return {
              weekId: week.id,
              weekNo: week.week_no,
              documents: week.documents.map((document: any) => {
                return {
                  documentId: document.id,
                  fileName: document.file_name,
                };
              }),
            };
          }),
        );
      }
    } catch (e) {
      console.error("error fetching documents", e);
    }
  }

  const weekList = weeks.map((week) => {
    return (
      <Paper radius="md" p="xs" withBorder key={week.weekId}>
        <Stack gap={0}>
          <Text size="md">{week.weekNo}. Hafta</Text>
          {week.documents.map((document) => (
            <Group gap={rem(4)} key={document.documentId}>
              <Text size="sm">{document.fileName}</Text>
              <ActionIcon
                size="xs"
                variant="outline"
                onClick={() => {
                  //handleDownloadDocument()
                }}
              >
                <IconFileDownload size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Paper>
    );
  });

  return (
    <Modal opened={opened} onClose={close} title="Dökümanlar" centered>
      <Stack>{weekList.length > 0 && weekList}</Stack>
    </Modal>
  );
}
