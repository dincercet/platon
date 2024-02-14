import { useEffect, useState } from "react";
import {
  Stack,
  Button,
  Modal,
  NativeSelect,
  Textarea,
  Group,
  Accordion,
  ActionIcon,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { DatesProvider, DatePickerInput } from "@mantine/dates";
import "dayjs/locale/tr";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useDisclosure } from "@mantine/hooks";

type AddWeekFormValues = {
  weekNo: number;
  weekDescription: string;
};

//validate addWeekForm via zod
const addWeekSchema = z.object({
  weekDescription: z
    .string()
    .min(1, { message: "Hafta açıklaması zorunludur." })
    .max(500, { message: "Hafta açıklaması 500 karakterden uzun olamaz." }),
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
    <Modal
      opened={opened}
      onClose={() => {
        close();
        fetchPeriods();
      }}
      title="Yeni Dönem"
      centered
    >
      <Stack>
        <form
          onSubmit={(e) => {
            e?.preventDefault();
          }}
        >
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
              // defaultValue={[new Date(), null]}
              minDate={new Date()}
            />
          </DatesProvider>

          <Button type="submit">Dönemi Ekle</Button>
        </form>
      </Stack>
    </Modal>
  );
}
