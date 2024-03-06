import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { IconPlus, IconTrashX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import addDocumentWeek from "../actions/addDocumentWeek";
import addDocument from "../actions/addDocument";

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

  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);

  useEffect(() => {
    fetchDocuments();
    console.log("useEffect fetchDocuments called");
  }, []);

  //call to getDocuments api, then set weeks state
  async function fetchDocuments() {
    try {
      const res = await fetch(
        `donemler/api/getDocuments?periodId=${periodId}`,
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

  async function handleAddWeek() {
    const weekNo = weeks.length > 0 ? weeks.at(-1)?.weekNo! + 1 : 1;

    try {
      //addDocumentWeek action call
      const res = await addDocumentWeek(periodId, weekNo);
      if (!res.success || !res.weekId) {
        //error returned from addDocumentWeek action
        console.error(res.error);
        return;
      }

      setWeeks([
        ...weeks,
        { weekId: res.weekId, weekNo: weekNo, documents: [] },
      ]);
    } catch (e) {
      console.error("unknown error addDocumentWeek", e);
      close();
    }
  }

  async function handleAddDocuments(weekId: number) {
    if (!selectedDocuments) return;

    const formData = new FormData();

    selectedDocuments.map((document) => formData.append("documents", document));

    try {
      //addDocument action call
      const res = await addDocument(weekId, formData);
      if (!res.success) {
        //error returned from addDocument action
        console.error(res.error);
        return;
      }

      setSelectedDocuments([]);
      fetchDocuments();
    } catch (e) {
      console.error("unknown error addDocument", e);
      close();
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
                color="red"
                onClick={() => {
                  //remove document
                  //pass document.documentId
                }}
              >
                <IconTrashX size={14} />
              </ActionIcon>
            </Group>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Group gap={rem(4)}>
              <FileInput
                leftSection={<IconPlus size={14} />}
                placeholder="Döküman Ekle"
                size="sm"
                clearable
                multiple
                value={selectedDocuments}
                onChange={(e) => {
                  setSelectedDocuments(e);
                }}
              />
              <ActionIcon
                type="submit"
                onClick={() => {
                  handleAddDocuments(week.weekId);
                }}
                size="md"
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          </form>
        </Stack>
      </Paper>
    );
  });

  return (
    <Modal opened={opened} onClose={close} title="Dökümanlar" centered>
      <Stack>
        <Button onClick={handleAddWeek}>Hafta Ekle</Button>
        {weekList.length > 0 && weekList}
        <Button color="red" disabled={!weeks.length}>
          Son Haftayı Sil
        </Button>
      </Stack>
    </Modal>
  );
}
