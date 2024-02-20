import { useState } from "react";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import { NativeSelect, Button, Stack, Modal, Radio } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import deleteFromPeriod from "../actions/deleteFromPeriod";
import addToPeriod from "../actions/addToPeriod";

export default function ShowPeriodsModal({
  opened,
  close,
  fetchStudents,
  studentId,
  studentFullName,
  periodsProp,
}: {
  opened: boolean;
  close: () => void;
  fetchStudents: () => Promise<void>;
  studentId: number;
  studentFullName: string;
  periodsProp: {
    id: number;
    beginsAt: Date;
    endsAt: Date;
    courseName: string;
  }[];
}) {
  //periods array initialized with periods passed from parent
  const [periods, setPeriods] = useState<typeof periodsProp>(periodsProp);

  //selected period index to choose the period to delete from the periods array
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number | null>(
    null,
  );

  //show NativeSelect with fetched periods when set to true
  const [isAddToPeriodActive, setIsAddToPeriodActive] = useState(false);

  //when adding new period, fetch and keep periods array for use in NativeSelect
  const [fetchedPeriods, setFetchedPeriods] = useState<typeof periodsProp>([]);

  //when adding new period, keep selected period index from NativeSelect
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  //fetch if add new period button is clicked
  async function fetchPeriods() {
    try {
      const res = await fetch("ogrenciler/api/getPeriods", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set periods array state based on retrieved periods
      if (resParsed.periods.length > 0) {
        setFetchedPeriods(
          resParsed.periods.map(
            (period: {
              id: number;
              begins_at: Date;
              ends_at: Date;
              curriculum: { course: { name: string } };
            }) => {
              return {
                id: period.id,
                beginsAt: period.begins_at,
                endsAt: period.ends_at,
                courseName: period.curriculum.course.name,
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching periods", e);
    }
  }

  async function handleDeleteFromPeriod() {
    if (!selectedPeriodIndex) return;
    try {
      //deleteFromPeriod action call
      const res = await deleteFromPeriod(
        studentId,
        periods[selectedPeriodIndex].id,
      );

      if (!res.success) {
        //error returned from deleteFromPeriod action
        console.error(res.error);
        return;
      }

      //update periods array to remove the deleted period
      setPeriods(
        periods.filter(
          (period) => period.id !== periods[selectedPeriodIndex].id,
        ),
      );
    } catch (e) {
      console.error("unknown error deleteFromPeriod", e);
    }
  }

  async function handleAddToPeriod() {
    if (!selectedPeriodId) return;
    try {
      //addToPeriod action call
      const res = await addToPeriod(studentId, selectedPeriodId);
      if (!res.success) {
        //error returned from addToPeriod action
        console.error(res.error);
        return;
      }

      //update periods array to add the new period
      setPeriods([...periods, fetchedPeriods[selectedPeriodId]]);

      //unmount NativeSelect
      setIsAddToPeriodActive(false);
    } catch (e) {
      console.error("unknown error addToPeriod", e);
    }
  }

  //call this function to show the date in correct format
  const getPeriodDate = (periodDate: Date) => {
    const months = [
      "Ocak",
      "Şub",
      "Mart",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağus",
      "Eyl",
      "Ekim",
      "Kas",
      "Ara",
    ];

    const date = new Date(periodDate);

    return date.getDate() + " " + months[date.getMonth()];
  };

  const periodList = periods.map((period, index) => {
    //show each period for student
    return (
      <Radio
        key={period.id}
        value={period.id.toString()}
        onClick={() => setSelectedPeriodIndex(index)}
        label={period.courseName}
        description={
          dayjs(period.beginsAt).locale("tr").format("LL") +
          " - " +
          dayjs(period.endsAt).locale("tr").format("LL")
        }
      />
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        close();
        fetchStudents();
      }}
      title={studentFullName}
      centered
    >
      {
        //if adding to a new period, show NativeSelect
        !isAddToPeriodActive ? (
          <Stack>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                fetchPeriods();
                setIsAddToPeriodActive(true);
              }}
            >
              Yeni Döneme Ekle
            </Button>

            {periodList.length > 0 && (
              <form
                onSubmit={(e) => {
                  e?.preventDefault();
                  handleDeleteFromPeriod();
                }}
              >
                <Stack>
                  {periodList}
                  <Button type="submit" disabled={!selectedPeriodIndex}>
                    Dönemden Çıkar
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        ) : (
          <form
            onSubmit={(e) => {
              e?.preventDefault();
              handleAddToPeriod();
            }}
          >
            <Stack>
              <NativeSelect
                label="Dönemi Seçiniz"
                value={
                  selectedPeriodId ? selectedPeriodId.toString() : undefined
                }
                onChange={(event) =>
                  setSelectedPeriodId(parseInt(event.currentTarget.value))
                }
                disabled={!fetchedPeriods.length}
                data={fetchedPeriods.map((period) => {
                  return {
                    label:
                      getPeriodDate(period.beginsAt) +
                      " - " +
                      getPeriodDate(period.endsAt) +
                      ": " +
                      period.courseName,
                    value: period.id.toString(),
                  };
                })}
              />
              <Button type="submit">Döneme Ekle</Button>
            </Stack>
          </form>
        )
      }
    </Modal>
  );
}
