"use client";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import { Flex, Button, rem, Divider, Paper, Stack, Text } from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import classes from "./StudentCard.module.css";
import AddStudentModal from "./components/AddStudentModal";

const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export default function Page() {
  const [addStudentOpened, addStudentHandlers] = useDisclosure(false);

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

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  async function fetchStudents() {
    try {
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
    } catch (e) {
      console.error("error fetching students", e);
    }
  }

  //todo: show registered status in the Paper

  //list of Paper components each with information about student
  //clickable for edit
  const studentList = students.map((student) => (
    <Paper
      key={student.id}
      shadow="sm"
      radius="md"
      withBorder
      className={classes.paper}
      data-active={selectedStudentId === student.id || undefined}
      onClick={() => setSelectedStudentId(student.id)}
    >
      <Stack>
        <Text size="md">
          {student.firstName} {student.lastName}
        </Text>
        <Text size="sm">{student.email}</Text>

        <Divider my="sm" />

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
      </Stack>
    </Paper>
  ));

  //todo: add 2 modals for edit student and edit period
  return (
    <>
      {
        //conditional to unmount modal when modal is closed
        addStudentOpened && (
          <AddStudentModal
            opened={addStudentOpened}
            close={addStudentHandlers.close}
            fetchStudents={fetchStudents}
          />
        )
      }

      <Flex direction="column" m={rem(8)}>
        <Button
          leftSection={<IconPlus size={16} />}
          mb={rem(8)}
          onClick={addStudentHandlers.open}
        >
          Öğrenci Ekle
        </Button>

        {studentList.length > 0 && studentList}

        <Button
          variant="outline"
          disabled={!selectedStudentId}
          mt={rem(8)}
          onClick={() => {
            //.open(); //edit student
          }}
        >
          <IconEdit />
        </Button>
        <Button
          variant="outline"
          disabled={!selectedStudentId}
          mt={rem(8)}
          onClick={() => {
            //.open(); //show periods (show if there's period, and button to add new period, also button to remove from period)
          }}
        >
          <IconEdit />
        </Button>
      </Flex>
    </>
  );
}
