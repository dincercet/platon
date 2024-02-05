"use client";
import { Stack, Button, Modal, TextInput } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";

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

  return (
    <Modal
      opened={props.opened}
      onClose={props.close}
      title="Ders Ekle"
      centered
    >
      <Stack>
        <TextInput label="Ders ismi" />
        <TextInput label="Ders açıklaması" />
        <Button>Ekle</Button>
      </Stack>
    </Modal>
  );
}
