import {
  Stack,
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
} from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import editCourse from "../actions/editCourse";
import deleteCourse from "../actions/deleteCourse";

type FormValues = {
  name: string;
  description: string;
};

//validate via zod
const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Ders ismi zorunludur" })
    .max(150, { message: "Ders ismi 150 karakterden uzun olamaz." }),
  description: z
    .string()
    .min(1, { message: "Ders açıklaması zorunludur." })
    .max(500, { message: "Ders açıklaması 500 karakterden uzun olamaz." }),
});

export default function EditCourseModal({
  opened,
  close,
  courseId,
  courseName,
  courseDescription,
  relatedCurriculum,
  fetchCourses,
}: {
  opened: boolean;
  close: () => void;
  courseId: number;
  courseName: string;
  courseDescription: string;
  relatedCurriculum: number | undefined;
  fetchCourses: () => Promise<void>;
}) {
  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      //initial values passed as props
      name: courseName,
      description: courseDescription,
    },
    validate: zodResolver(schema),
  });

  async function handleEditCourse(values: FormValues) {
    let res;
    try {
      //editCourse action call (id received as prop)
      res = await editCourse(courseId, values.name, values.description);
      if (!res.success) {
        //error returned from editCourse action
        console.error(res.error);
      }
      //close the modal
      close();

      //update the parent state 'courses'
      await fetchCourses();
    } catch (e) {
      console.error("unknown error editCourse", e);
      close();
    }
  }

  async function handleDeleteCourse() {
    try {
      //deleteCourse action call
      const res = await deleteCourse(courseId);
      if (!res.success) {
        //error returned from deleteCourse action
        console.error(res.error);
      }
      //close the modal
      close();

      //update the parent state 'courses'
      await fetchCourses();
    } catch (e) {
      console.error("unknown error editCourse", e);
      close();
    }
  }

  return (
    <Modal opened={opened} onClose={close} title="Ders Düzenle" centered>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          //validate the form, form.errors will be set if validation fails
          form.validate();
          //if valid, continue
          if (form.isValid()) handleEditCourse(values);
        })}
      >
        <Stack>
          <TextInput label="Ders ismi" {...form.getInputProps("name")} />

          <Textarea
            label="Ders açıklaması"
            autosize
            minRows={3}
            {...form.getInputProps("description")}
          />

          <Group>
            <Button type="submit">Güncelle</Button>
            {relatedCurriculum === undefined ? (
              <Button color="red" onClick={handleDeleteCourse}>
                Sil
              </Button>
            ) : (
              <Button color="yellow">Eskit</Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
