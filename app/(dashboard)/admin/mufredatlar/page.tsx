"use client";

import { useDisclosure } from "@mantine/hooks";
import { Flex, rem, Button, Accordion, Radio, Center } from "@mantine/core";
import AddCurriculumModal from "./components/AddCurriculumModal";
import EditCurriculumModal from "./components/EditCurriculumModal";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function Page() {
  //handlers to open and close modals
  const [addCurriculumOpened, addCurriculumHandlers] = useDisclosure(false);
  const [editCurriculumOpened, editCurriculumHandlers] = useDisclosure(false);

  //array of curriculums, and array of weeks within each curriculum
  const [curriculums, setCurriculums] = useState<
    {
      curriculumId: number;
      createdAt: Date;
      courseName: string;
      weeks: { weekId: number; weekNo: number; weekDescription: string }[];
    }[]
  >([]);

  const [selectedCurriculum, setSelectedCurriculum] = useState(0);
  const [isCurriculumSelected, setIsCurriculumSelected] = useState(false);

  useEffect(() => {
    fetchCurriculums();
    console.log("useEffect fetchCurriculums called");
  }, []);

  async function fetchCurriculums() {
    try {
      const res = await fetch("mufredatlar/api/getCurriculums", {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.curriculums.length > 0) {
        //set curriculums state array
        setCurriculums(
          //create a new array from response values
          resParsed.curriculums.map(
            (curriculum: {
              id: number;
              created_at: Date;
              course: { name: string };
              weeks: { id: number; week_no: number; description: string }[];
            }) => {
              //array created is a little complicated because of nested query from database.
              return {
                curriculumId: curriculum.id,
                createdAt: curriculum.created_at,
                courseName: curriculum.course.name,
                //create a new array of weeks related to the curriculum
                weeks: curriculum.weeks.map((week) => {
                  return {
                    weekId: week.id,
                    weekNo: week.week_no,
                    weekDescription: week.description,
                  };
                }),
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching curriculums", e);
    }
  }

  const curriculumList = curriculums.map((curriculum, index) => {
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

    const date = new Date(curriculum.createdAt);

    return (
      <Accordion.Item
        key={curriculum.curriculumId}
        value={curriculum.curriculumId.toString()}
      >
        <Center>
          <Radio
            value={index.toString()}
            mr={rem(8)}
            onClick={() => {
              setSelectedCurriculum(index);
              setIsCurriculumSelected(true);
            }}
          />
          <Accordion.Control>
            {date.getDate() +
              " " +
              months[date.getMonth()] +
              ": " +
              curriculum.courseName}
          </Accordion.Control>
        </Center>
        <Accordion.Panel>
          <Accordion>
            {curriculum.weeks.map((week) => {
              return (
                <Accordion.Item
                  key={week.weekId}
                  value={week.weekNo.toString()}
                >
                  <Accordion.Control>
                    {week.weekNo + ". Hafta"}
                  </Accordion.Control>
                  <Accordion.Panel>{week.weekDescription}</Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  return (
    <>
      {
        //conditional to unmount modal when modal is closed
        addCurriculumOpened && (
          <AddCurriculumModal
            opened={addCurriculumOpened}
            close={addCurriculumHandlers.close}
            fetchCurriculums={fetchCurriculums}
          />
        )
      }
      {editCurriculumOpened && (
        <EditCurriculumModal
          opened={editCurriculumOpened}
          close={editCurriculumHandlers.close}
          fetchCurriculums={fetchCurriculums}
          curriculum={curriculums[selectedCurriculum]}
        />
      )}

      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={addCurriculumHandlers.open}
        >
          Müfredat Ekle
        </Button>

        {curriculumList.length > 0 && (
          <Accordion>
            <Radio.Group>{curriculumList}</Radio.Group>
          </Accordion>
        )}

        <Button
          variant="outline"
          disabled={!isCurriculumSelected}
          mt={rem(8)}
          onClick={() => {
            editCurriculumHandlers.open();
          }}
        >
          <IconEdit />
        </Button>
      </Flex>
    </>
  );
}
