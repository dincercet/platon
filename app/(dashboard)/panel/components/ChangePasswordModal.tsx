import { Stack, Button, Modal, TextInput, Textarea } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import addCourse from "../actions/addCourse";
import { validatePassword } from "firebase/auth";
import auth from "firebase.init.js";

//form types
type FormValues = {
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

//validate via zod
const schema = z
  .object({
    oldPassword: z
      .string()
      .min(1, { message: "Eski şifreyi girmediniz." })
      .max(100, { message: "Şifre en fazla 100 karakter olmalıdır." }),
    password: z
      .string()
      .min(1, { message: "Şifre girmediniz." })
      .max(100, { message: "Şifre en fazla 100 karakter olmalıdır." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Şifre tekrarı girmediniz." })
      .max(100, { message: "Şifre en fazla 100 karakter olmalıdır." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler uyuşmuyor.",
    path: ["confirmPassword"],
  });

export default function ChangePasswordModal({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(schema),
  });

  async function handleChangePassword(values: FormValues) {
    try {
      const status = await validatePassword(auth, values.oldPassword);
      if (!status.isValid) {
        //show error
      }

      // if (!res.success) {
      //   //error returned from addCourse action
      //   console.error(res.error);
      // }
      //close the modal
      close();
    } catch (e) {
      console.error("unknown error addCourse", e);
      close();
    }
  }

  return (
    <Modal opened={opened} onClose={close} title="Ders Ekle" centered>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          //validate the form, form.errors will be set if validation fails
          form.validate();
          //if valid, continue
          if (form.isValid()) handleAddCourse(values);
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

          <Button
            type="submit"
            disabled={!form.isDirty("name") || !form.isDirty("description")}
          >
            Ekle
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
