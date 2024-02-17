"use client";
import "dayjs/locale/tr";
import { useState, useEffect } from "react";
import { Button, Flex, Group, Radio, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

import AddPeriodModal from "./components/AddPeriodModal";
import dayjs from "dayjs";

const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export default function Page() {
  //handlers to open and close modals
  const [addPeriodOpened, addPeriodHandlers] = useDisclosure(false);

  const [periods, setPeriods] = useState<
    {
      periodId: number;
      beginsAt: Date;
      endsAt: Date;
      courseName: string;
      curriculumCreatedAt: Date;
    }[]
  >([]);

  useEffect(() => {
    fetchPeriods();
    console.log("useEffect fetchPeriods called");
  }, []);

  async function fetchPeriods() {
    try {
      const res = await fetch("donemler/api/getPeriods", {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.periods.length > 0) {
        //set periods state array
        setPeriods(
          //create a new array from response values
          resParsed.periods.map(
            (period: {
              id: number;
              begins_at: Date;
              ends_at: Date;
              curriculum: { created_at: Date; course: { name: string } };
            }) => {
              return {
                periodId: period.id,
                beginsAt: period.begins_at,
                endsAt: period.ends_at,
                courseName: period.curriculum.course.name,
                curriculumCreatedAt: period.curriculum.created_at,
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching periods", e);
    }
  }

  const getCurriculumDate = (createdAt: Date) => {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const date = new Date(createdAt);

    return date.getDate() + " " + months[date.getMonth()];
  };

  const periodList = periods.map((period) => {
    const begins = dayjs(new Date(period.beginsAt)).locale("tr").format("LL");
    const ends = dayjs(new Date(period.endsAt)).locale("tr").format("LL");

    return (
      <Radio
        key={period.periodId}
        value={period.periodId.toString()}
        label={begins + " - " + ends}
        description={
          getCurriculumDate(period.curriculumCreatedAt) +
          ": " +
          period.courseName
        }
      />
    );
  });

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

        <Radio.Group>{periodList}</Radio.Group>
        <Group>
          <Button //show students button
          //disabled={!isPeriodSelected}
          >
            Öğrenciler
          </Button>
          <Button //show curriculum button
          //disabled={!isPeriodSelected}
          >
            Müfredat
          </Button>
        </Group>

        <Button //edit button
          variant="outline"
          //disabled={!isPeriodSelected}
          mt={rem(8)}
          onClick={() => {
            //editPeriodHandlers.open();
          }}
        >
          <IconEdit />
        </Button>
      </Flex>
    </>
  );
}
