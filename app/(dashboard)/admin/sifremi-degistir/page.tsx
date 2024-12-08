"use client";

import { Button, rem, Paper, PasswordInput } from "@mantine/core";
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

export default function ChangePasswordPage() {
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
        if (e.code === "auth/requires-recent-login") {
          //must login recently error
          form.setFieldError(
            "confirmPassword",
            "Yeniden giriş yapmanız gerekli.",
          );
        } else {
          //every other error
          form.setFieldError(
            "confirmPassword",
            "Bir sorun oluştu ve şifre güncellenemedi.",
          );
        }

        console.error(e.message);
        return;
      }

      form.reset();
    }
  }

  return (
    <Paper withBorder shadow="md" miw={rem(280)} p={20} mt={30} radius="md">
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
    </Paper>
  );
}
