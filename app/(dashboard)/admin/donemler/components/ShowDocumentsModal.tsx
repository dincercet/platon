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
import deleteLastWeek from "../actions/deleteLastWeek";
import deleteDocument from "../actions/deleteDocument";

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
      selectedDocuments: File[];
    }[]
  >([]);

  // const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);

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
              selectedDocuments: [],
            };
          }),
        );
      }
    } catch (e) {
      console.error("error fetching documents", e);
    }
  }

  async function handleAddWeek() {
    const weekNo = weeks.length > 0 ? weeks.at(-1)?.weekNo + 1 : 1;

    try {
      //addDocumentWeek action call
      const res = await addDocumentWeek(periodId, weekNo);
      if (!res.success || !res.weekId) {
        //error returned from addDocumentWeek action
        console.error(res.error);
        return;
      }

      //add the new week to the array
      setWeeks([
        ...weeks,
        {
          weekId: res.weekId,
          weekNo: weekNo,
          documents: [],
          selectedDocuments: [],
        },
      ]);
    } catch (e) {
      console.error("unknown error addDocumentWeek", e);
    }
  }

  async function handleAddDocuments(weekId: number, selectedDocuments: File[]) {
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

      //flush the selected documents
      // setSelectedDocuments([]);
      //re-fetch
      fetchDocuments();
    } catch (e) {
      console.error("unknown error addDocument", e);
    }
  }

  async function handleDeleteDocument(
    weekNo: number,
    documentId: number,
    fileName: string,
  ) {
    try {
      //deleteDocument action call
      const res = await deleteDocument(periodId, weekNo, documentId, fileName);
      if (!res.success) {
        //error returned from deleteDocument action
        console.error(res.error);
        return;
      }

      //delete the document from the array
      setWeeks(
        weeks.map((week: any) => {
          //find the correct week
          if (week.weekNo === weekNo) {
            //delete the document from week
            const updatedDocuments = week.documents.filter(
              (document: any) => document.documentId !== documentId,
            );
            //return new object with updated documents
            return { ...week, documents: updatedDocuments };
          }
          //return rest of the weeks unchanged
          return week;
        }),
      );
    } catch (e) {
      console.error("unknown error deleteDocument", e);
    }
  }

  async function handleDeleteLastWeek() {
    if (!weeks.length) return;

    const weekId = weeks.at(-1)!.weekId;
    const weekNo = weeks.at(-1)!.weekNo;
    const documents = weeks.at(-1)!.documents;

    try {
      //deleteLastWeek action call
      const res = await deleteLastWeek(periodId, weekId, weekNo, documents);
      if (!res.success) {
        //error returned from deleteLastWeek action
        console.error(res.error);
        return;
      }

      //delete the last week
      setWeeks(weeks.filter((week) => week.weekId !== weekId));
    } catch (e) {
      console.error("unknown error deleteLastWeek", e);
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
                variant="outline"
                onClick={() => {
                  handleDeleteDocument(
                    week.weekNo,
                    document.documentId,
                    document.fileName,
                  );
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
                value={week.selectedDocuments}
                onChange={(e) => {
                  setWeeks(
                    weeks.map((w) =>
                      w.weekNo === week.weekNo
                        ? { ...w, selectedDocuments: e }
                        : w,
                    ),
                  );
                }}
              />
              <ActionIcon
                type="submit"
                disabled={!week.selectedDocuments.length}
                onClick={() => {
                  handleAddDocuments(week.weekId, week.selectedDocuments);
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
        <Button
          color="red"
          disabled={!weeks.length}
          onClick={handleDeleteLastWeek}
        >
          Son Haftayı Sil
        </Button>
      </Stack>
    </Modal>
  );
}
