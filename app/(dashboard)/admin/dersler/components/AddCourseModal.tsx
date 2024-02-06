"use client";
import { Text, Stack, Button, Modal, TextInput } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import addCourse from "../actions/addCourse";

type FormValues = {
  name: string;
  description: string;
};

//validate via zod
const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Ders ismi zorunludur" })
    .max(100, { message: "Ders ismi 100 karakterden uzun olamaz." }),
  description: z
    .string()
    .min(1, { message: "Ders açıklaması zorunludur." })
    .max(300, { message: "Ders açıklaması 300 karakterden uzun olamaz." }),
});

export default function AddCourseModal(props: {
  opened: boolean;
  close: () => void;
}) {
  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      description: "",
    },
    validate: zodResolver(schema),
  });

  async function handleAddCourse(values: FormValues) {
    let res;
    try {
      //addCourse action call
      res = await addCourse(values.name, values.description);
      if (!res.success) {
        //error returned from addCourse action
        console.error(res.error);
      }
      //close the modal
      close();
    } catch (e) {
      console.error("unknown error addCourse", e);
      close();
    }
  }

  return (
    <Modal
      opened={props.opened}
      onClose={props.close}
      title="Ders Ekle"
      centered
    >
      <Stack>
        <form
          onSubmit={form.onSubmit((values, e) => {
            e?.preventDefault();
            handleAddCourse(values);
          })}
        >
          <TextInput label="Ders ismi" />

          <Text size="sm" c="red">
            {form.errors.name}
          </Text>

          <TextInput label="Ders açıklaması" />

          <Text size="sm" c="red">
            {form.errors.description}
          </Text>

          <Button>Ekle</Button>
        </form>
      </Stack>
    </Modal>
  );
}
