"use client";
import { Stack, Button, Modal, TextInput, Textarea } from "@mantine/core";
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
    .max(150, { message: "Ders ismi 150 karakterden uzun olamaz." }),
  description: z
    .string()
    .min(1, { message: "Ders açıklaması zorunludur." })
    .max(500, { message: "Ders açıklaması 500 karakterden uzun olamaz." }),
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
      props.close();
    } catch (e) {
      console.error("unknown error addCourse", e);
      props.close();
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
            //validate the form, form.errors will be set if validation fails
            form.validate();
            //if valid, continue
            if (form.isValid()) handleAddCourse(values);
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
