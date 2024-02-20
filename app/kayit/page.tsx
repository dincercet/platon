"use client";

import {
  setPersistence,
  browserSessionPersistence,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import auth from "firebase.init.js";
import { setAuthCookies } from "app/actions/setAuthCookies";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Paper, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import studentSignedUp from "./actions/studentSignedUp";

//form types
type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

//validate via zod
const schema = z
  .object({
    email: z
      .string()
      .min(1, { message: "E-posta girmediniz." })
      .max(150, { message: "E-posta en fazla 150 karakter olmalıdır." })
      .email({ message: "E-posta formatı hatalı." }),
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
  const router = useRouter();

  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: zodResolver(schema),
  });

  //handle form submit
  async function handleSignup(values: FormValues) {
    const email = values.email;
    const password = values.password;

    try {
      await setPersistence(auth, browserSessionPersistence);
      //delete later
      console.log("persistence set to session");
    } catch (e) {
      console.error("error firebase setPersistence", e);
      throw new Error("Error setting persistence");
    }

    let user;
    //check if signing in through email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      try {
        //sign in with email link
        const signedInUser = await signInWithEmailLink(
          auth,
          email,
          window.location.href,
        );

        //associate the email with the password
        user = await linkWithCredential(
          signedInUser.user,
          EmailAuthProvider.credential(email, password),
        );

        try {
          const res = await studentSignedUp(email);
          if (!res.success) {
            //error returned from action
            console.error(res.error);
            throw new Error(
              "Üyelik işlemi tamamlanamadı. Lütfen yeniden link gönderilmesini talep ediniz.",
            );
          }
        } catch (e) {
          console.error("error studentSignedUp action", e);
        }
      } catch (e) {
        console.error(
          "error firebase isSignInWithEmailLink or signInWithEmailLink or linkWithCredential",
          e,
        );
        throw new Error(
          "E-postayı şifre ile bağdaştırırken bir hata oluştu. Lütfen yeniden link gönderilmesini talep ediniz.",
        );
      }
    }

    if (user) {
      //successfully signed in and linked with email
      let currentUser = user.user;

      let idToken;
      try {
        //get idToken for further authentication (get a fresh token)
        idToken = await currentUser.getIdToken(true);
      } catch (e) {
        console.error("error firebase getIdToken", e);
        throw new Error(
          "Üye oldunuz fakat üyelik bilgileri alınırken bir hata oluştu. Yeniden giriş yapınız.",
        );
      }

      try {
        //action call to set cookies
        await setAuthCookies(idToken);
      } catch (e) {
        console.error("error setting auth cookies", e);
        throw new Error(
          "Üye oldunuz fakat çerezler tanımlanırken bir hata oluştu. Yeniden giriş yapınız.",
        );
      }
    }

    //redirect to home
    router.push("/");
  }

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          form.validate();
          if (form.isValid()) handleSignup(values);
        })}
      >
        <TextInput
          label="E-posta"
          placeholder="E-postanızı doğrulamak için giriniz"
          required
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label="Şifre"
          placeholder="Şifreniz"
          required
          mt="md"
          {...form.getInputProps("password")}
        />

        <PasswordInput
          label="Şifre Tekrarı"
          placeholder="Şifrenizi tekrar giriniz"
          required
          mt="md"
          {...form.getInputProps("confirmPassword")}
        />

        <Button type="submit" fullWidth mt="xl">
          Kaydımı Tamamla
        </Button>
      </form>
    </Paper>
  );
}
