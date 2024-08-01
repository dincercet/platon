"use client";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";

import { Button, Flex, Group, Loader, Radio, Stack, rem } from "@mantine/core";
import { IconPlus, IconEdit, IconFiles } from "@tabler/icons-react";

import AddPeriodModal from "./components/AddPeriodModal";
import EditPeriodModal from "./components/EditPeriodModal";
import ShowCurriculumModal from "./components/ShowCurriculumModal";
import ShowStudentsModal from "./components/ShowStudentsModal";
import ShowDocumentsModal from "./components/ShowDocumentsModal";

import deletePeriod from "./actions/deletePeriod";
import classes from "./styles/radio.module.css";

import dayjs from "dayjs";
import "dayjs/locale/tr";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

//Type of each period returned from database
type DbPeriod = {
  id: number;
  begins_at: Date;
  ends_at: Date;
  curriculum: {
    id: number;
    created_at: Date;
    course: { name: string };
  };
};

export default function Page() {
  //handlers to open and close modals
  const [addPeriodOpened, addPeriodHandlers] = useDisclosure(false);
  const [editPeriodOpened, editPeriodHandlers] = useDisclosure(false);
  const [showCurriculumOpened, showCurriculumHandlers] = useDisclosure(false);
  const [showStudentsOpened, showStudentsHandlers] = useDisclosure(false);
  const [showDocumentsOpened, showDocumentsHandlers] = useDisclosure(false);

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

  //to fetch gradually
  const [cursor, setCursor] = useState<number | null>(null);

  //true if there's no more to fetch
  const [isFinal, setIsFinal] = useState(false);

  //to enable buttons when radio is selected
  const [isPeriodSelected, setIsPeriodSelected] = useState(false);

  //holds the index of selected period
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  //loading state
  const [loading, setLoading] = useState(true);

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

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.periods.length > 0) {
        //set periods state array
        setPeriods(
          //create a new array from response values
          resParsed.periods.map((period: DbPeriod) => {
            return {
              periodId: period.id,
              beginsAt: period.begins_at,
              endsAt: period.ends_at,
              courseName: period.curriculum.course.name,
              curriculumId: period.curriculum.id,
              curriculumCreatedAt: period.curriculum.created_at,
            };
          }),
        );

        //set cursor state for the next batch
        setCursor(resParsed.nextCursor);

        //if it's the final batch
        setIsFinal(resParsed.isFinal);
      } else {
        setPeriods([]);
      }
      setLoading(false);
    } catch (e) {
      console.error("error fetching periods", e);
      setLoading(false);
    }
  }

  async function fetchNextPeriods() {
    try {
      //call to getPeriods api
      const res = await fetch(`donemler/api/getPeriods?cursor=${cursor}`, {
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
        setPeriods((prev) => [
          ...prev,
          //create a new array from response values
          ...resParsed.periods.map((period: DbPeriod) => {
            return {
              periodId: period.id,
              beginsAt: period.begins_at,
              endsAt: period.ends_at,
              courseName: period.curriculum.course.name,
              curriculumId: period.curriculum.id,
              curriculumCreatedAt: period.curriculum.created_at,
            };
          }),
        ]);

        //set cursor state for the next batch
        setCursor(resParsed.nextCursor);

        //if it's the final batch
        setIsFinal(resParsed.isFinal);
      } else {
        setPeriods([]);
      }
      setLoading(false);
    } catch (e) {
      console.error("error fetching periods", e);
      setLoading(false);
    }
  }

  async function handleDeletePeriod() {
    try {
      //deletePeriod action call
      const res = await deletePeriod(periods[selectedPeriod].periodId);
      if (!res.success) {
        //error returned from deletePeriod action
        console.error(res.error);
      }

      setIsPeriodSelected(false);

      //update the periods array
      await fetchPeriods();
    } catch (e) {
      console.error("unknown error handleDeletePeriod", e);
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
        className={
          dayjs().isAfter(new Date(period.endsAt)) ? classes.label : undefined
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
        //Modal components
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
      {showStudentsOpened && (
        <ShowStudentsModal
          opened={showStudentsOpened}
          close={showStudentsHandlers.close}
          periodId={periods[selectedPeriod].periodId}
        />
      )}
      {showDocumentsOpened && (
        <ShowDocumentsModal
          opened={showDocumentsOpened}
          close={showDocumentsHandlers.close}
          periodId={periods[selectedPeriod].periodId}
        />
      )}

      {loading ? (
        <Loader mt={rem(8)} />
      ) : (
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
              onClick={showStudentsHandlers.open}
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

          <Button //show documents button
            leftSection={<IconFiles size={16} />}
            variant="outline"
            disabled={!isPeriodSelected}
            mt={rem(8)}
            onClick={showDocumentsHandlers.open}
          >
            Dökümanlar
          </Button>
          <Group grow mt={rem(8)}>
            <Button //edit button
              variant="outline"
              disabled={!isPeriodSelected}
              onClick={editPeriodHandlers.open}
            >
              <IconEdit />
            </Button>
            <Button //delete button
              color="red"
              disabled={!isPeriodSelected}
              onClick={() => {
                if (
                  window.confirm(
                    "Dönemi silmek beraberinde dökümanları da siler. Ayrıca döneme bağlı öğrenciler koparılır ve panelde dönem bilgisini artık göremezler. Emin misiniz?",
                  )
                )
                  handleDeletePeriod();
              }}
            >
              Sil
            </Button>
          </Group>

          <Button
            variant="outline"
            disabled={!periods || isFinal}
            mt={rem(8)}
            onClick={() => fetchNextPeriods()}
          >
            Daha fazla göster
          </Button>
        </Flex>
      )}
    </>
  );
}
