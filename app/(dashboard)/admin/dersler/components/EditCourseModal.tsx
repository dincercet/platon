"use client";
import { Stack, Button, Modal, TextInput, Textarea } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import editCourse from "../actions/editCourse";

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

export default function EditCourseModal(props: {
  opened: boolean;
  close: () => void;
  values: { courseId: number; courseName: string; courseDescription: string };
}) {
  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      //initial values passed as props
      name: props.values.courseName,
      description: props.values.courseDescription,
    },
    validate: zodResolver(schema),
  });

  async function handleEditCourse(values: FormValues) {
    let res;
    try {
      //editCourse action call (id received as prop)
      res = await editCourse(
        props.values.courseId,
        values.name,
        values.description,
      );
      if (!res.success) {
        //error returned from editCourse action
        console.error(res.error);
      }
      //close the modal
      props.close();
    } catch (e) {
      console.error("unknown error editCourse", e);
      props.close();
    }
  }

  return (
    <Modal
      opened={props.opened}
      onClose={props.close}
      title="Ders Düzenle"
      centered
    >
      <Stack>
        <form
          onSubmit={form.onSubmit((values, e) => {
            e?.preventDefault();
            //validate the form, form.errors will be set if validation fails
            form.validate();
            //if valid, continue
            if (form.isValid()) handleEditCourse(values);
          })}
        >
          <TextInput label="Ders ismi" {...form.getInputProps("name")} />

          <Textarea
            label="Ders açıklaması"
            {...form.getInputProps("description")}
          />

          <Button type="submit">Ekle</Button>
        </form>
      </Stack>
    </Modal>
  );
}
