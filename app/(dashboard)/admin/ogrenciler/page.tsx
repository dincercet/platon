"use client";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import {
  Flex,
  Button,
  rem,
  Divider,
  Paper,
  Stack,
  Text,
  Group,
  Loader,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import classes from "./StudentCard.module.css";
import AddStudentModal from "./components/AddStudentModal";
import ShowPeriodsModal from "./components/ShowPeriodsModal";
import EditStudentModal from "./components/EditStudentModal";

//const localizedFormat = require("dayjs/plugin/localizedFormat");
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function Page() {
  //Modal handlers
  const [addStudentOpened, addStudentHandlers] = useDisclosure(false);
  const [showPeriodsOpened, showPeriodsHandlers] = useDisclosure(false);
  const [editStudentOpened, editStudentHandlers] = useDisclosure(false);

  //keeps array of students fetched
  const [students, setStudents] = useState<
    {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      didRegister: boolean;
      periods: {
        id: number;
        beginsAt: Date;
        endsAt: Date;
        courseName: string;
      }[];
    }[]
  >([]);

  //selected student's id
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  //selected student's index to find in students array
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<
    number | null
  >(null);

  //loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    console.log("useEffect fetchStudents called");
  }, []);

  async function fetchStudents() {
    try {
      //api call to get all students
      const res = await fetch("ogrenciler/api/getStudents", {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.students.length > 0) {
        //set students state array
        setStudents(
          resParsed.students.map((student: any) => {
            return {
              id: student.id,
              email: student.email,
              firstName: student.first_name,
              lastName: student.last_name,
              didRegister: student.did_register,
              //nested array of periods that user is linked to
              periods: student.users_periods.map((userPeriod: any) => {
                return {
                  id: userPeriod.period.id,
                  beginsAt: new Date(userPeriod.period.begins_at),
                  endsAt: new Date(userPeriod.period.ends_at),
                  courseName: userPeriod.period.curriculum.course.name,
                };
              }),
            };
          }),
        );
      }
      setLoading(false);
    } catch (e) {
      console.error("error fetching students", e);
      setLoading(false);
    }
  }

  //list of Paper components each with information about student
  //clickable for edit
  const studentList = students.map((student, index) => (
    <Paper
      key={student.id}
      shadow="sm"
      radius="md"
      p="xs"
      withBorder
      className={classes.paper}
      data-active={selectedStudentId === student.id || undefined}
      onClick={() => {
        setSelectedStudentId(student.id);
        setSelectedStudentIndex(index);
      }}
    >
      <Stack gap={0}>
        <Text size="md">
          {student.firstName} {student.lastName}
        </Text>
        <Text size="sm">{student.email}</Text>

        {student.periods.length > 0 && <Divider my="xs" />}

        {student.periods.map((period) => {
          //show each period for student
          return (
            <Text key={period.id} size="sm">
              {dayjs(period.beginsAt).locale("tr").format("LL") +
                " - " +
                dayjs(period.endsAt).locale("tr").format("LL") +
                ": " +
                period.courseName}
            </Text>
          );
        })}

        <Divider my="xs" />

        {
          //if registered to firebase
          student.didRegister ? (
            <Text size="sm" c="green">
              Öğrenci kaydını tamamladı.
            </Text>
          ) : (
            <Text size="sm" c="yellow">
              Öğrenci kaydını tamamlamadı.
            </Text>
          )
        }
      </Stack>
    </Paper>
  ));

  return (
    <>
      {
        //Modal components
        //conditional to unmount modal when modal is closed
        addStudentOpened && (
          <AddStudentModal
            opened={addStudentOpened}
            close={addStudentHandlers.close}
            fetchStudents={fetchStudents}
          />
        )
      }
      {showPeriodsOpened &&
        selectedStudentId !== null &&
        selectedStudentIndex !== null && (
          <ShowPeriodsModal
            opened={showPeriodsOpened}
            close={showPeriodsHandlers.close}
            fetchStudents={fetchStudents}
            studentId={selectedStudentId}
            studentFullName={
              students[selectedStudentIndex].firstName +
              " " +
              students[selectedStudentIndex].lastName
            }
            periodsProp={students[selectedStudentIndex].periods}
          />
        )}
      {editStudentOpened &&
        selectedStudentId !== null &&
        selectedStudentIndex !== null && (
          <EditStudentModal
            opened={editStudentOpened}
            close={editStudentHandlers.close}
            fetchStudents={fetchStudents}
            studentId={selectedStudentId}
            firstName={students[selectedStudentIndex].firstName}
            lastName={students[selectedStudentIndex].lastName}
          />
        )}

      {loading ? (
        <Loader mt={rem(8)} />
      ) : (
        <Flex direction="column" miw={rem(220)} m={rem(8)}>
          <Button
            leftSection={<IconPlus size={16} />}
            mb={rem(8)}
            onClick={addStudentHandlers.open}
          >
            Öğrenci Ekle
          </Button>

          {studentList.length > 0 && studentList}

          <Group grow>
            <Button
              variant="outline"
              disabled={!selectedStudentId}
              mt={rem(8)}
              onClick={() => {
                editStudentHandlers.open();
              }}
            >
              Düzenle
            </Button>
            <Button
              variant="outline"
              disabled={!selectedStudentId}
              mt={rem(8)}
              onClick={() => {
                showPeriodsHandlers.open();
              }}
            >
              Dönemler
            </Button>
          </Group>
        </Flex>
      )}
    </>
  );
}
