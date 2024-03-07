import { Modal, Stack, Card, Text, Paper } from "@mantine/core";
import { useEffect, useState } from "react";

export default function ShowStudentsModal({
  opened,
  close,
  periodId,
}: {
  opened: boolean;
  close: () => void;
  periodId: number;
}) {
  //array of students
  const [students, setStudents] = useState<
    {
      email: string;
      firstName: string;
      lastName: string;
    }[]
  >([]);

  useEffect(() => {
    fetchStudents();
  }, [periodId]);

  async function fetchStudents() {
    try {
      const res = await fetch(`donemler/api/getStudents?periodId=${periodId}`, {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set students state
      setStudents(
        resParsed.students.map((student: any) => {
          return {
            email: student.user.email,
            firstName: student.user.first_name,
            lastName: student.user.last_name,
          };
        }),
      );
    } catch (e) {
      console.error("error fetching students", e);
    }
  }

  const studentList = students?.map((student) => {
    return (
      <Paper radius="md" p="xs" withBorder key={student.email}>
        <Text size="md">{student.firstName + " " + student.lastName}</Text>
        <Text size="sm">{student.email}</Text>
      </Paper>
    );
  });

  return (
    <Modal opened={opened} onClose={close} title="Dönemin Öğrencileri" centered>
      <Stack>
        {students.length > 0 ? (
          studentList
        ) : (
          <Text>Eklenen öğrenci bulunamadı.</Text>
        )}
      </Stack>
    </Modal>
  );
}
