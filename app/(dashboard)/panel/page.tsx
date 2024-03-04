"use client";
import { Button, Flex, Group, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { IconFiles } from "@tabler/icons-react";

dayjs.extend(localizedFormat);

export default function StudentPage() {
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

  useEffect(() => {
    fetchUserPeriods();
  }, []);

  async function fetchUserPeriods() {
    try {
      //api call to get user's periods
      const res = await fetch(
        `api/getUserPeriods?email=${window.localStorage.getItem("email")}`,
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

  //array of Paper components that display info for each period that the student is in
  const periodList = userPeriods.map((period) => {
    const begins = dayjs(new Date(period.begins)).locale("tr").format("LL");
    const ends = dayjs(new Date(period.ends)).locale("tr").format("LL");

    return (
      <Paper key={period.id} shadow="md" p="md" withBorder>
        <Text size="lg">{period.courseName}</Text>
        <Group grow>
          <Text size="sm">{begins}</Text>
          {" - "}
          <Text size="sm">{ends}</Text>
        </Group>
        <Stack>
          {period.weeks.map((week) => {
            return (
              <Stack key={week.weekNo}>
                <Text size="md">{week.weekNo + ". Hafta"}</Text>
                <Text size="sm">{week.weekDescription}</Text>
              </Stack>
            );
          })}
        </Stack>
        <Button
          leftSection={<IconFiles size={16} />}
          onClick={() => {
            //openfilesmodal
          }}
        >
          Ders Dökümanları
        </Button>
      </Paper>
    );
  });

  return (
    <Flex wrap="wrap" justify="center">
      {periodList.length > 0 ? (
        periodList
      ) : (
        <Text size="lg">Henüz bir derse atanmadınız.</Text>
      )}
    </Flex>
  );
}
