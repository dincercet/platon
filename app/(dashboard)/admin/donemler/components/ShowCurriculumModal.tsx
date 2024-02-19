import { Modal, Accordion } from "@mantine/core";
import { useEffect, useState } from "react";

export default function ShowCurriculumModal({
  opened,
  close,
  curriculumId,
}: {
  opened: boolean;
  close: () => void;
  curriculumId: number;
}) {
  //array of curriculums, and array of weeks within each curriculum
  const [curriculum, setCurriculum] = useState<{
    createdAt: Date;
    courseName: string;
    weeks: { weekNo: number; weekDescription: string }[];
  }>();

  useEffect(() => {
    fetchCurriculum();
  }, [curriculumId]);

  async function fetchCurriculum() {
    try {
      const res = await fetch(
        `donemler/api/getCurriculum?curriculumId=${curriculumId}`,
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

      //set curriculum state
      setCurriculum({
        createdAt: resParsed.curriculum.created_at,
        courseName: resParsed.curriculum.course.name,
        //create a new array of weeks related to the curriculum
        weeks: resParsed.curriculum.weeks.map(
          (week: { week_no: number; description: string }) => {
            return {
              weekNo: week.week_no,
              weekDescription: week.description,
            };
          },
        ),
      });
    } catch (e) {
      console.error("error fetching curriculum", e);
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

  const weekList = !curriculum
    ? []
    : curriculum.weeks.map((week) => {
        return (
          <Accordion.Item key={week.weekNo} value={week.weekNo.toString()}>
            <Accordion.Control>{week.weekNo + ". Hafta"}</Accordion.Control>
            <Accordion.Panel>{week.weekDescription}</Accordion.Panel>
          </Accordion.Item>
        );
      });

  return (
    curriculum && (
      <Modal
        opened={opened}
        onClose={close}
        title={
          getCurriculumDate(curriculum.createdAt) +
          " Müfredatı: " +
          curriculum.courseName
        }
        centered
      >
        <Accordion>{weekList}</Accordion>
      </Modal>
    )
  );
}
