import { Button, Modal, Paper, PasswordInput, rem } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { updatePassword, validatePassword } from "firebase/auth";
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
      //validate old password
      const status = await validatePassword(auth, values.oldPassword);
      if (!status.isValid) {
        //if old password is wrong
        form.setFieldError("oldPassword", "Eski şifre yanlış.");
        return;
      } else {
        if (auth.currentUser) {
          //update the password
          updatePassword(auth.currentUser, values.password).catch((error) => {
            //show error if any
            form.setFieldError(
              "confirmPassword",
              "Bir sorun oluştu ve şifre güncellenemedi.",
            );

            console.error(error.message);
          });
        }

        //close the modal
        close();
      }
    } catch (e) {
      console.error("unknown error handleChangePassword", e);
      close();
    }
  }

  return (
    <Modal opened={opened} onClose={close} title="Şifremi Değiştir" centered>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          form.validate();
          if (form.isValid()) handleChangePassword(values);
        })}
      >
        <PasswordInput
          label="Eski Şifre"
          placeholder="Eski Şifreniz"
          required
          mt="md"
          {...form.getInputProps("oldPassword")}
        />

        <PasswordInput
          label="Yeni Şifre"
          placeholder="Yeni Şifreniz"
          required
          mt="md"
          {...form.getInputProps("password")}
        />

        <PasswordInput
          label="Yeni Şifre Tekrarı"
          placeholder="Yeni şifreyi tekrar giriniz"
          required
          mt="md"
          {...form.getInputProps("confirmPassword")}
        />

        <Button type="submit" fullWidth mt="xl">
          Şifreyi güncelle
        </Button>
      </form>
    </Modal>
  );
}
