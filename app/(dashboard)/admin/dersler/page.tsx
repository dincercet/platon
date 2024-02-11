"use client";
import { useEffect, useState } from "react";
import { Accordion, Button, Flex, rem, Center, Radio } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import AddCourseModal from "./components/AddCourseModal";
import EditCourseModal from "./components/EditCourseModal";

//todo: load the initial courses for courses state (will be blocking hydration if not done correctly)
// async function initialFetchCourses() {
//   const res = await fetch("dersler/api/getCourses", { method: "GET" });
//   const resParsed = await res.json();
//   return resParsed.courses.length ? resParsed.courses : [];
// }

export default function CoursesPage() {
  //handlers to open and close modals
  const [addCourseOpened, addCourseHandlers] = useDisclosure(false);
  const [editCourseOpened, editCourseHandlers] = useDisclosure(false);

  //array of courses fetched
  const [courses, setCourses] = useState<
    { id: number; name: string; description: string; legacy: boolean }[]
  >([]);
  //the values to be passed to EditCourseModal
  const [selectedCourse, setSelectedCourse] = useState<number>(0);

  useEffect(() => {
    fetchCourses();
    console.log("useEffect: fetchCourses called");
    //todo: fix the parameters for execution when new course added or edited
  }, []);

  //call to getCourses api, then set courses state
  async function fetchCourses() {
    const res = await fetch("dersler/api/getCourses", { method: "GET" });
    const resParsed = await res.json();
    if (resParsed.courses.length > 0) setCourses(resParsed.courses);
  }

  //an accordion array to list courses
  const coursesList = courses.map(
    (course: { id: number; name: string; description: string }, index) => {
      return (
        <Accordion.Item key={course.id} value={course.name}>
          <Center>
            <Radio
              value={`${index}`}
              onClick={() => {
                setSelectedCourse(index);
              }}
            />
            <Accordion.Control>{course.name}</Accordion.Control>
          </Center>
          <Accordion.Panel>{course.description}</Accordion.Panel>
        </Accordion.Item>
      );
    },
  );

  //AddCourseModal opens a modal to add course, EditCourseModal opens a modal to edit corresponding course
  //EditCourseModal and Accordion only rendered if any courses fetched
  return (
    <>
      <AddCourseModal
        opened={addCourseOpened}
        close={addCourseHandlers.close}
        fetchCourses={fetchCourses}
      />
      {courses.length > 0 && (
        <EditCourseModal
          key={courses[selectedCourse].id}
          opened={editCourseOpened}
          close={editCourseHandlers.close}
          courseId={courses[selectedCourse].id}
          courseName={courses[selectedCourse].name}
          courseDescription={courses[selectedCourse].description}
          fetchCourses={fetchCourses}
        />
      )}
      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={addCourseHandlers.open}
        >
          Ders Ekle
        </Button>

        {courses.length > 0 && (
          <Accordion>
            <Radio.Group>{coursesList}</Radio.Group>
          </Accordion>
        )}

        <Button
          variant="outline"
          onClick={() => {
            editCourseHandlers.open();
          }}
        >
          <IconEdit />
        </Button>
      </Flex>
    </>
  );
}
