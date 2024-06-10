"use client";
import { useEffect, useState } from "react";
import {
  Accordion,
  Button,
  Flex,
  rem,
  Center,
  Radio,
  Text,
} from "@mantine/core";
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
    {
      id: number;
      name: string;
      description: string;
      legacy: boolean;
      curriculums: { course_id: number | undefined }[];
    }[]
  >([]);

  //the values to be passed to EditCourseModal
  const [selectedCourse, setSelectedCourse] = useState<number>(0);

  //enable button when true
  const [isCourseSelected, setIsCourseSelected] = useState(false);

  useEffect(() => {
    fetchCourses();
    console.log("useEffect: fetchCourses called");
    //todo: fix the parameters for execution when new course added or edited
  }, []);

  //call to getCourses api, then set courses state
  async function fetchCourses() {
    try {
      const res = await fetch("dersler/api/getCourses", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }
      console.log(resParsed.courses);
      //set courses state based on retrieved courses
      if (resParsed.courses.length > 0) setCourses(resParsed.courses);
    } catch (e) {
      console.error("error fetching courses", e);
    }
  }

  //an accordion array to list courses
  const courseList = courses.map(
    (
      course: {
        id: number;
        name: string;
        description: string;
        legacy: boolean;
      },
      index,
    ) => {
      return (
        <Accordion.Item key={course.id} value={course.name}>
          <Center>
            <Radio
              value={`${index}`}
              mr={rem(8)}
              onClick={() => {
                setSelectedCourse(index);
                setIsCourseSelected(true);
              }}
            />
            <Accordion.Control>
              <Text c={course.legacy ? "orange" : undefined}>
                {course.name}
              </Text>
            </Accordion.Control>
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
      {
        //conditional to unmount modal when modal is closed
        addCourseOpened && (
          <AddCourseModal
            opened={addCourseOpened}
            close={addCourseHandlers.close}
            fetchCourses={fetchCourses}
          />
        )
      }
      {editCourseOpened && (
        <EditCourseModal
          key={courses[selectedCourse].id}
          opened={editCourseOpened}
          close={editCourseHandlers.close}
          courseId={courses[selectedCourse].id}
          courseName={courses[selectedCourse].name}
          courseDescription={courses[selectedCourse].description}
          legacy={courses[selectedCourse].legacy}
          relatedCurriculum={courses[selectedCourse].curriculums[0]?.course_id}
          fetchCourses={fetchCourses}
        />
      )}
      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={addCourseHandlers.open}
        >
          Ders Ekle
        </Button>

        {courseList.length > 0 && (
          <Accordion>
            <Radio.Group>{courseList}</Radio.Group>
          </Accordion>
        )}

        <Button
          variant="outline"
          disabled={!isCourseSelected}
          mt={rem(8)}
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
