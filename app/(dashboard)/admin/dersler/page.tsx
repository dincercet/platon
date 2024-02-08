"use client";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionControl,
  AccordionPanel,
  Stack,
  Group,
  Button,
  Flex,
  rem,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import AddCourseModal from "./components/AddCourseModal";
import EditCourseModal from "./components/EditCourseModal";

export default function CoursesPage() {
  const [addCourseOpened, addCourseHandlers] = useDisclosure(false);
  const [editCourseOpened, editCourseHandlers] = useDisclosure(false);
  const [courses, setCourses] = useState([]);
  const [editCourseValues, setEditCourseValues] = useState({
    courseId: 0,
    courseName: "",
    courseDescription: "",
  });

  useEffect(() => {
    fetchCourses();
    console.log("fetchCourses called");
  }, [addCourseHandlers.close, addCourseHandlers.open]);

  async function fetchCourses() {
    const res = await fetch("dersler/api/getCourses", { method: "GET" });
    const resParsed = await res.json();
    if (resParsed.courses.length > 0) setCourses(resParsed.courses);
  }

  const coursesList = courses.map(
    (course: { id: number; name: string; description: string }) => {
      return (
        <AccordionItem key={course.id} value={course.name}>
          <Center>
            <AccordionControl>{course.name}</AccordionControl>
            <Button
              variant="outline"
              onClick={() => {
                setEditCourseValues({
                  courseId: course.id,
                  courseName: course.name,
                  courseDescription: course.description,
                });
                editCourseHandlers.open();
              }}
            >
              <IconEdit />
            </Button>
          </Center>
          <AccordionPanel>{course.description}</AccordionPanel>
        </AccordionItem>
      );
    },
  );

  return (
    <>
      <AddCourseModal
        opened={addCourseOpened}
        close={addCourseHandlers.close}
      />
      <EditCourseModal
        opened={editCourseOpened}
        close={editCourseHandlers.close}
        values={editCourseValues}
      />
      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={addCourseHandlers.open}
        >
          Ders Ekle
        </Button>
        {courses && <Accordion>{coursesList}</Accordion>}
      </Flex>
    </>
  );
}
