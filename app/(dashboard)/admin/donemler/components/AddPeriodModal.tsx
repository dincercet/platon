import { useEffect, useState } from "react";
import { Stack, Button, Modal, NativeSelect } from "@mantine/core";
import { DatesProvider, DatePickerInput } from "@mantine/dates";
import "dayjs/locale/tr";
import { z } from "zod";
import addPeriod from "../actions/addPeriod";

//check if date is valid
const dateSchema = z.object({
  beginsAt: z.date(),
  endsAt: z.date(),
});

export default function AddPeriodModal({
  opened,
  close,
  fetchPeriods,
}: {
  opened: boolean;
  close: () => void;
  fetchPeriods: () => Promise<void>;
}) {
  const [curriculums, setCurriculums] = useState<
    {
      curriculumId: number;
      createdAt: Date;
      legacy: boolean;
      courseName: string;
    }[]
  >([]);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState(0);

  const [dateValues, setDateValues] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    fetchCurriculums();
    console.log("useEffect fetchCurriculums called");
  }, []);

  async function fetchCurriculums() {
    try {
      const res = await fetch("donemler/api/getCurriculums", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set curriculums state based on retrieved curriculums
      if (resParsed.curriculums.length > 0) {
        setCurriculums(
          resParsed.curriculums.map((curriculum: any) => {
            return {
              curriculumId: curriculum.id,
              createdAt: curriculum.created_at,
              legacy: curriculum.legacy,
              courseName: curriculum.course.name,
            };
          }),
        );
        setSelectedCurriculumId(resParsed.curriculums[0].id);
      }
    } catch (e) {
      console.error("error fetching curriculums", e);
    }
  }

  async function handleAddPeriod() {
    //if date is valid
    if (
      dateSchema.safeParse({ beginsAt: dateValues[0], endsAt: dateValues[1] })
        .success
    ) {
      try {
        //addPeriod action call (passing curriculumId and dates)
        const res = await addPeriod(selectedCurriculumId, [
          dateValues[0]!,
          dateValues[1]!,
        ]);

        if (!res.success) {
          //error returned from addCurriculum action
          console.error(res.error);
          return;
        }

        //close the modal
        close();
        //update the parent state Periods
        await fetchPeriods();
      } catch (e) {
        console.error("unknown error addCurriculum", e);

        //close the modal
        close();
        //update the parent state Periods
        await fetchPeriods();
      }
    }
  }

  //construct the NativeSelect label
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

  return (
    <Modal opened={opened} onClose={close} title="Yeni Dönem" centered>
      <form
        onSubmit={(e) => {
          e?.preventDefault();
          handleAddPeriod();
        }}
      >
        <Stack>
          <NativeSelect
            label="Müfredatı Seçiniz"
            value={selectedCurriculumId.toString()}
            onChange={(event) =>
              setSelectedCurriculumId(parseInt(event.currentTarget.value))
            }
            data={curriculums.map((curriculum) => {
              return {
                label:
                  getCurriculumDate(curriculum.createdAt) +
                  ": " +
                  curriculum.courseName,
                value: curriculum.curriculumId.toString(),
                disabled: curriculum.legacy,
              };
            })}
          />

          <DatesProvider settings={{ locale: "tr" }}>
            <DatePickerInput
              label="Dönem Aralığı"
              placeholder="Tarih Seçiniz"
              type="range"
              value={dateValues}
              onChange={setDateValues}
              defaultValue={[new Date(), null]}
            />
          </DatesProvider>

          <Button type="submit">Dönemi Ekle</Button>
        </Stack>
      </form>
    </Modal>
  );
}
