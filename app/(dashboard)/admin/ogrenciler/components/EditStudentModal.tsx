import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { Stack, Group, Modal, TextInput, Button } from "@mantine/core";
import editStudent from "../actions/editStudent";
import deleteStudent from "../actions/deleteStudent";

type FormValues = { firstName: string; lastName: string };

//create zod schema
const schema = z.object({
  firstName: z
    .string()
    .min(1, { message: "İsim zorunludur." })
    .max(100, { message: "İsim 100 karakterden uzun olamaz." }),
  lastName: z
    .string()
    .min(1, { message: "Soyisim zorunludur." })
    .max(100, { message: "Soyisim 100 karakterden uzun olamaz." }),
});

//modal component to edit a student
export default function EditStudentModal({
  opened,
  close,
  fetchStudents,
  studentId,
  firstName,
  lastName,
}: {
  opened: boolean;
  close: () => void;
  fetchStudents: () => Promise<void>;
  studentId: number;
  firstName: string;
  lastName: string;
}) {
  //mantine form initialization
  const form = useForm<FormValues>({
    initialValues: { firstName: firstName, lastName: lastName },
    validate: zodResolver(schema),
  });

  //edit student form handler
  async function handleEditStudent(values: FormValues) {
    try {
      //editStudent action call
      const res = await editStudent(
        studentId,
        values.firstName,
        values.lastName,
      );

      if (!res.success) {
        //error returned from editStudent action
        console.error(res.error);
        return;
      }

      //close the modal
      close();
      //re-fetch students
      fetchStudents();
    } catch (e) {
      console.error("unknown error editStudent", e);
      return;
    }
  }

  //delete student form handler
  async function handleDeleteStudent() {
    try {
      //deleteStudent action call
      const res = await deleteStudent(studentId);

      if (!res.success) {
        //error returned from deleteStudent action
        console.error(res.error);
        return;
      }

      //close the modal
      close();
      //re-fetch students
      fetchStudents();
    } catch (e) {
      console.error("unknown error deleteStudent", e);
      return;
    }
  }

  return (
    <Modal opened={opened} onClose={close} title="Öğrenci Düzenle" centered>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          //validate the form, form.errors will be set if validation fails
          form.validate();
          //if valid, continue
          if (form.isValid()) handleEditStudent(values);
        })}
      >
        <Stack>
          <Group>
            <TextInput label="İsim" {...form.getInputProps("firstName")} />
            <TextInput label="Soyisim" {...form.getInputProps("lastName")} />
          </Group>

          <Group grow>
            <Button type="submit">Düzenle</Button>
            <Button
              color="red"
              variant="outline"
              onClick={() => {
                if (
                  window.confirm(
                    "Öğrenciyi silmek istediğinizden emin misiniz?",
                  )
                ) {
                  handleDeleteStudent();
                }
              }}
            >
              Öğrenciyi Sil
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
