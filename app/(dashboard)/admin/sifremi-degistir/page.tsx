import { Button, PasswordInput } from "@mantine/core";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { updatePassword } from "firebase/auth";
import auth from "firebase.init.js";

//form types
type FormValues = {
  password: string;
  confirmPassword: string;
};

//validate via zod
const schema = z
  .object({
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

export default function Page() {
  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(schema),
  });

  async function handleChangePassword(values: FormValues) {
    if (auth.currentUser) {
      //update the password
      try {
        await updatePassword(auth.currentUser, values.password);
      } catch (e: any) {
        //show error if any
        form.setFieldError(
          "confirmPassword",
          "Bir sorun oluştu ve şifre güncellenemedi.",
        );
        if (e.code === "auth/requires-recent-login") {
          form.setFieldError(
            "confirmPassword",
            "Yeniden giriş yapmanız gerekli.",
          );
        }
        console.error(e.message);
        return;
      }

      //close the modal
      close();
    }
  }

  return (
    <div>
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          form.validate();
          if (form.isValid()) handleChangePassword(values);
        })}
      >
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
    </div>
  );
}
