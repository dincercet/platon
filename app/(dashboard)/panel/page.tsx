"use client";
import { Button, Center, Flex, Paper, Stack, Text, rem } from "@mantine/core";
import { useEffect, useState } from "react";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { IconFiles } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import { ActionIcon, Group, Modal } from "@mantine/core";
import { IconFileDownload } from "@tabler/icons-react";

dayjs.extend(localizedFormat);

//decide which storage is used for auth info
function getStorage() {
  if (window.localStorage.getItem("loggedIn") === "true")
    return window.localStorage;
  else if (window.sessionStorage.getItem("loggedIn") === "true")
    return window.sessionStorage;
}

export default function StudentPage() {
  //handlers to open and close modals
  const [showDocumentsOpened, showDocumentsHandlers] = useDisclosure(false);
  const [changePasswordOpened, changePasswordHandlers] = useDisclosure(false);

  //state to keep an array of periods that the user is assigned to
  const [userPeriods, setUserPeriods] = useState<
    {
      id: number;
      begins: string;
      ends: string;
      courseName: string;
      weeks: { weekNo: number; weekDescription: string }[];
    }[]
  >([]);

  const [weeks, setWeeks] = useState<
    {
      weekId: number;
      weekNo: number;
      documents: { documentId: number; fileName: string }[];
    }[]
  >([]);

  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  useEffect(() => {
    //pass the appropriate storage type
    fetchUserPeriods(getStorage());
  }, []);

  async function fetchUserPeriods(storage?: Storage) {
    try {
      //api call to get user's periods
      const res = await fetch(
        `/panel/api/getUserPeriods?email=${storage!.getItem("email")}`,
        {
          method: "GET",
        },
      );
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set user's periods state
      setUserPeriods(
        resParsed.userPeriods.map((period: any) => {
          return {
            id: period.id,
            begins: period.begins_at,
            ends: period.ends_at,
            courseName: period.curriculum.course.name,
            weeks: period.curriculum.weeks.map((week: any) => {
              return {
                weekNo: week.week_no,
                weekDescription: week.description,
              };
            }),
          };
        }),
      );
    } catch (e) {
      console.error("error fetching user periods", e);
    }
  }

  //call to getDocuments api, then set weeks state
  async function fetchDocuments(periodId: number) {
    try {
      const res = await fetch(
        `/panel/api/getDocuments?periodId=${periodId}&email=${getStorage()!.getItem("email")}`,
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

  async function handleDownloadDocument(weekNo: number, fileName: string) {
    try {
      const res = await fetch(
        `/panel/api/downloadDocument?email=${getStorage()!.getItem("email")}&periodId=${selectedPeriodId}&weekNo=${weekNo}&filename=${fileName}`,
        { method: "GET" },
      );

      if (!res.ok) {
        const resParsed = await res.json();
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      const fileBlob = await res.blob();

      //create a temporary link, download the file and remove the link
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(fileBlob);
      link.download = fileName;
      link.click();
      link.remove();
    } catch (e) {
      console.error("error fetching documents", e);
    }
  }

  //array of Paper components that display info for each period that the student is in
  const periodList = userPeriods.map((period) => {
    const begins = dayjs(new Date(period.begins)).locale("tr").format("LL");
    const ends = dayjs(new Date(period.ends)).locale("tr").format("LL");

    return (
      <Paper key={period.id} shadow="md" p="md" withBorder miw={rem(288)}>
        <Stack>
          <Text size="lg" fw="bold" c="blue">
            {period.courseName}
          </Text>
          <Flex justify="space-between">
            <Text size="sm" c="dimmed">
              {begins}
            </Text>

            <Text size="sm" c="dimmed">
              -
            </Text>
            <Text size="sm" c="dimmed">
              {ends}
            </Text>
          </Flex>
          <Stack>
            {period.weeks.map((week) => {
              return (
                <Stack gap={rem(3)} key={week.weekNo}>
                  <Text size="md" c="blue">
                    {week.weekNo + ". Hafta"}
                  </Text>
                  <Text size="sm">{week.weekDescription}</Text>
                </Stack>
              );
            })}
          </Stack>
          <Button
            leftSection={<IconFiles size={16} />}
            onClick={() => {
              fetchDocuments(period.id);
              setSelectedPeriodId(period.id);
              showDocumentsHandlers.open();
            }}
          >
            Ders Dökümanları
          </Button>
        </Stack>
      </Paper>
    );
  });

  const weekList = weeks.map((week) => {
    return (
      <Paper radius="md" p="xs" withBorder key={week.weekId}>
        <Stack gap={0}>
          <Text size="md" c="blue">
            {week.weekNo}. Hafta
          </Text>
          {week.documents.map((document) => (
            <Group gap={rem(4)} key={document.documentId}>
              <Text size="sm">{document.fileName}</Text>
              <ActionIcon
                size="xs"
                variant="outline"
                onClick={() => {
                  handleDownloadDocument(week.weekNo, document.fileName);
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
    <>
      <Modal
        opened={showDocumentsOpened}
        onClose={() => {
          setWeeks([]);
          setSelectedPeriodId(null);
          showDocumentsHandlers.close();
        }}
        title="Dökümanlar"
        centered
      >
        <Stack>
          {weekList.length > 0 ? (
            weekList
          ) : (
            <Text>Henüz döküman yüklenmedi.</Text>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={changePasswordOpened}
        onClose={() => {
          changePasswordHandlers.close();
        }}
        title="Dökümanlar"
        centered
      ></Modal>
      <Flex wrap="wrap" gap="md" mt="md" justify="center">
        {periodList.length > 0 ? (
          periodList
        ) : (
          <Text size="lg">Henüz bir derse atanmadınız.</Text>
        )}
      </Flex>
      <Center my="md">
        <Button fullWidth={false} variant="outline">
          Şifremi Değiştir
        </Button>
      </Center>
    </>
  );
}
