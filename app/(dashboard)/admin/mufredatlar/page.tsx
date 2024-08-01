"use client";

import { useDisclosure } from "@mantine/hooks";
import {
  Flex,
  rem,
  Button,
  Accordion,
  Radio,
  Center,
  Group,
  Text,
  Loader,
} from "@mantine/core";
import AddCurriculumModal from "./components/AddCurriculumModal";
import EditCurriculumModal from "./components/EditCurriculumModal";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import deleteCurriculum from "./actions/deleteCurriculum";
import makeCurriculumLegacy from "./actions/makeCurriculumLegacy";

//Type of each curriculum returned from database
type DbCurriculum = {
  id: number;
  created_at: Date;
  legacy: boolean;
  course: { name: string };
  weeks: { id: number; week_no: number; description: string }[];
  isRelated: boolean;
};

export default function Page() {
  //handlers to open and close modals
  const [addCurriculumOpened, addCurriculumHandlers] = useDisclosure(false);
  const [editCurriculumOpened, editCurriculumHandlers] = useDisclosure(false);

  //array of curriculums, and array of weeks within each curriculum
  const [curriculums, setCurriculums] = useState<
    {
      curriculumId: number;
      createdAt: Date;
      legacy: boolean;
      courseName: string;
      weeks: { weekId: number; weekNo: number; weekDescription: string }[];
      isRelated: boolean;
    }[]
  >([]);

  //to fetch gradually
  const [cursor, setCursor] = useState<number | null>(null);

  //true if there's no more to fetch
  const [isFinal, setIsFinal] = useState(false);

  const [selectedCurriculum, setSelectedCurriculum] = useState(0);
  const [isCurriculumSelected, setIsCurriculumSelected] = useState(false);

  //loading state
  const [loading, setLoading] = useState(true);

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
          resParsed.curriculums.map((curriculum: DbCurriculum) => {
            //array created is a little complicated because of nested query from database.
            return {
              curriculumId: curriculum.id,
              createdAt: curriculum.created_at,
              legacy: curriculum.legacy,
              courseName: curriculum.course.name,
              //create a new array of weeks related to the curriculum
              weeks: curriculum.weeks.map((week) => {
                return {
                  weekId: week.id,
                  weekNo: week.week_no,
                  weekDescription: week.description,
                };
              }),
              isRelated: curriculum.isRelated,
            };
          }),
        );

        //set cursor state for the next batch
        setCursor(resParsed.nextCursor);

        //if it's the final batch
        setIsFinal(resParsed.isFinal);

        //fix the error when any next fetched curriculum edit overlay is closed (curriculums(selectedCurriculum) is not set))
        setSelectedCurriculum(0);
        setIsCurriculumSelected(false);
      } else {
        setCurriculums([]);
        setIsCurriculumSelected(false);
      }
      setLoading(false);
    } catch (e) {
      console.error("error fetching curriculums", e);

      setLoading(false);
    }
  }

  async function fetchNextCurriculums() {
    try {
      const res = await fetch(
        `mufredatlar/api/getCurriculums?cursor=${cursor}`,
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
      if (resParsed.curriculums.length > 0) {
        //set curriculums state array
        setCurriculums((prev) => [
          ...prev,
          //create a new array from response values
          ...resParsed.curriculums.map((curriculum: DbCurriculum) => {
            //array created is a little complicated because of nested query from database.
            return {
              curriculumId: curriculum.id,
              createdAt: curriculum.created_at,
              legacy: curriculum.legacy,
              courseName: curriculum.course.name,
              //create a new array of weeks related to the curriculum
              weeks: curriculum.weeks.map((week) => {
                return {
                  weekId: week.id,
                  weekNo: week.week_no,
                  weekDescription: week.description,
                };
              }),
              isRelated: curriculum.isRelated,
            };
          }),
        ]);

        //set cursor state for the next batch
        setCursor(resParsed.nextCursor);

        //if it's the final batch
        setIsFinal(resParsed.isFinal);
      } else {
        setCurriculums([]);
        setIsCurriculumSelected(false);
      }
      setLoading(false);
    } catch (e) {
      console.error("error fetching curriculums", e);

      setLoading(false);
    }
  }

  async function handleDeleteCurriculum() {
    try {
      //deleteCurriculum action call
      const res = await deleteCurriculum(
        curriculums[selectedCurriculum].curriculumId,
      );
      if (!res.success) {
        //error returned from deleteCurriculum action
        console.error(res.error);
      }

      //update the curriculums array
      await fetchCurriculums();
    } catch (e) {
      console.error("unknown error deleteCurriculum", e);
    }
  }

  async function handleMakeCurriculumLegacy() {
    try {
      //makeCurriculumLegacy action call
      const res = await makeCurriculumLegacy(
        curriculums[selectedCurriculum].curriculumId,
      );
      if (!res.success) {
        //error returned from makeCurriculumLegacy action
        console.error(res.error);
      }

      //update the curriculums array
      await fetchCurriculums();
    } catch (e) {
      console.error("unknown error makeCurriculumLegacy", e);
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
            <Text c={curriculum.legacy ? "orange" : undefined}>
              {date.getDate() +
                " " +
                months[date.getMonth()] +
                ": " +
                curriculum.courseName}
            </Text>
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

      {loading ? (
        <Loader mt={rem(8)} />
      ) : (
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

          <Group grow mt={rem(8)}>
            <Button
              variant="outline"
              disabled={!isCurriculumSelected}
              onClick={() => {
                editCurriculumHandlers.open();
              }}
            >
              <IconEdit />
            </Button>

            {isCurriculumSelected &&
              (curriculums[selectedCurriculum].isRelated === false ? (
                <Button color="red" onClick={handleDeleteCurriculum}>
                  Sil
                </Button>
              ) : (
                <Button
                  color="yellow"
                  disabled={curriculums[selectedCurriculum].legacy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Eskitilen bir müfredat yeniden güncel hale getirilemez, tek çözümü yeni müfredat yaratmaktır. Emin misiniz?",
                      )
                    )
                      handleMakeCurriculumLegacy();
                  }}
                >
                  Eskit
                </Button>
              ))}
          </Group>

          <Button
            variant="outline"
            disabled={!curriculums || isFinal}
            mt={rem(8)}
            onClick={() => fetchNextCurriculums()}
          >
            Daha fazla göster
          </Button>
        </Flex>
      )}
    </>
  );
}
