import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrashX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import addDocumentWeek from "../actions/addDocumentWeek";

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

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchDocuments();
    console.log("useEffect fetchDocuments called");
  }, []);

  //call to getCourses api, then set courses state
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
      if (resParsed.courses.length > 0) {
        setWeeks(
          resParsed.documents.map((week: any) => {
            return {
              weekId: week.id,
              weekNo: week.weekNo,
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
    try {
      //addDocumentWeek action call
      //
      //find out the week no for param
      const res = await addDocumentWeek();
      if (!res.success || !res.curriculumId) {
        //error returned from addCurriculum action
        console.error(res.error);
        return;
      }
    } catch (e) {
      console.error("unknown error addCurriculum", e);
      close();
    }
  }

  async function handleAddDocuments(weekId: number) {}

  const weekList = weeks.map((week) => {
    return (
      <Paper radius="md" p="xs" withBorder key={week.weekId}>
        <Stack gap={0}>
          <Text size="md">{week.weekNo}. Hafta</Text>
          {week.documents.map((document) => (
            <Group key={document.documentId}>
              <Text size="sm">{document.fileName}</Text>
              <ActionIcon
                variant="danger"
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
              console.log(e.target);
              //handleAddDocuments(week.weekId);
            }}
          >
            <Group>
              <FileInput
                leftSection={<IconPlus size={14} />}
                placeholder="Döküman Ekle"
                size="sm"
                clearable
                multiple
                // value={files}
                // onChange={setFiles}
              />
              <ActionIcon type="submit" size="sm">
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          </form>
        </Stack>
      </Paper>
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        close();
      }}
      title="Documents"
      centered
    >
      <Stack>
        <Button onClick={handleAddWeek}>Hafta Ekle</Button>
        {weekList.length > 0 && weekList}
        <Button variant="danger">Son Haftayı Sil</Button>
      </Stack>
    </Modal>
  );
}
