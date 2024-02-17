"use client";
import "dayjs/locale/tr";
import { useState, useEffect } from "react";
import { Button, Flex, Group, Radio, Stack, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconEdit } from "@tabler/icons-react";

import AddPeriodModal from "./components/AddPeriodModal";
import EditPeriodModal from "./components/EditPeriodModal";
import dayjs from "dayjs";
import ShowCurriculumModal from "./components/ShowCurriculumModal";

const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export default function Page() {
  //handlers to open and close modals
  const [addPeriodOpened, addPeriodHandlers] = useDisclosure(false);
  const [editPeriodOpened, editPeriodHandlers] = useDisclosure(false);
  const [showCurriculumOpened, showCurriculumHandlers] = useDisclosure(false);

  //array of periods after fetchPeriods
  const [periods, setPeriods] = useState<
    {
      periodId: number;
      beginsAt: Date;
      endsAt: Date;
      courseName: string;
      curriculumId: number;
      curriculumCreatedAt: Date;
    }[]
  >([]);

  //to enable buttons when radio is selected
  const [isPeriodSelected, setIsPeriodSelected] = useState(false);

  //holds the index of selected period
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  useEffect(() => {
    fetchPeriods();
  }, []);

  async function fetchPeriods() {
    try {
      //call to getPeriods api
      const res = await fetch("donemler/api/getPeriods", {
        method: "GET",
      });
      const resParsed = await res.json();
      console.log("inside fetchPeriods");
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
              curriculum: {
                id: number;
                created_at: Date;
                course: { name: string };
              };
            }) => {
              return {
                periodId: period.id,
                beginsAt: period.begins_at,
                endsAt: period.ends_at,
                courseName: period.curriculum.course.name,
                curriculumId: period.curriculum.id,
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

  //to translate date to Turkish
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

  //list of Radio components showing period details
  const periodList = periods.map((period, index) => {
    const begins = dayjs(new Date(period.beginsAt)).locale("tr").format("LL");
    const ends = dayjs(new Date(period.endsAt)).locale("tr").format("LL");

    return (
      <Radio
        key={period.periodId}
        value={period.periodId.toString()}
        label={begins + " - " + ends}
        description={
          getCurriculumDate(period.curriculumCreatedAt) +
          " Müfredatı: " +
          period.courseName
        }
        onClick={() => {
          setSelectedPeriod(index);
          setIsPeriodSelected(true);
        }}
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
      {editPeriodOpened && (
        <EditPeriodModal
          opened={editPeriodOpened}
          close={editPeriodHandlers.close}
          fetchPeriods={fetchPeriods}
          period={periods[selectedPeriod]}
        />
      )}
      {showCurriculumOpened && (
        <ShowCurriculumModal
          opened={showCurriculumOpened}
          close={showCurriculumHandlers.close}
          curriculumId={periods[selectedPeriod].curriculumId}
        />
      )}
      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={addPeriodHandlers.open}
        >
          Yeni Dönem
        </Button>
        <Radio.Group>
          <Stack>{periodList}</Stack>
        </Radio.Group>
        <Group grow mt={rem(8)}>
          <Button //show students button
            variant="outline"
            disabled={!isPeriodSelected}
          >
            Öğrenciler
          </Button>
          <Button //show curriculum button
            variant="outline"
            disabled={!isPeriodSelected}
            onClick={showCurriculumHandlers.open}
          >
            Müfredat
          </Button>
        </Group>

        <Button //edit button
          variant="outline"
          disabled={!isPeriodSelected}
          mt={rem(8)}
          onClick={editPeriodHandlers.open}
        >
          <IconEdit />
        </Button>
      </Flex>
    </>
  );
}
