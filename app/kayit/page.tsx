"use client";

import {
  setPersistence,
  browserSessionPersistence,
  isSignInWithEmailLink,
  signInWithEmailLink,
  deleteUser,
  updatePassword,
} from "firebase/auth";
import auth from "firebase.init.js";
import { useRouter } from "next/navigation";
import {
  rem,
  Container,
  TextInput,
  PasswordInput,
  Paper,
  Button,
  Center,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import studentSignedUp from "./actions/studentSignedUp";
import { setAuthCookies } from "app/actions/setAuthCookies";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";
import clientLogger from "app/actions/clientLogger";
import { useState } from "react";

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

  const [fatalError, setFatalError] = useState<string | null>(null);

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
      setFatalError("Error setting persistence");
      return;
    }

    //check if signing in through email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      //there is a long list of calls with nested try/catch blocks
      //to handle errors without losing sync between firebase db and native db
      let signedInUser;
      try {
        //sign in with email link
        signedInUser = await signInWithEmailLink(
          auth,
          email,
          window.location.href,
        );
      } catch (e: any) {
        if (e.code === "auth/invalid-email") {
          form.setFieldError("email", "Girdiğiniz eposta uyuşmuyor.");
        } else {
          setFatalError("Hesap yaratılırken bir hata oluştu.");
        }
        console.error("error firebase signInWithEmailLink", e);
        return;
      }

      try {
        await updatePassword(signedInUser.user, password);
      } catch (e) {
        console.error("error firebase linkWithCredential", e);
        try {
          //if couldn't link password, delete user from firebase
          await deleteUser(signedInUser.user);
        } catch {
          //if couldn't delete user, log it
          clientLogger(
            `error linking user with email ${email}, couldn't delete user from firebase afterwards. Will need to delete user manually from firebase.`,
          );
        }
        setFatalError(
          "E-postayı şifre ile bağdaştırırken bir hata oluştu. Lütfen yeniden link gönderilmesini talep ediniz.",
        );
        return;
      }

      //successfully signed in and linked with password
      let currentUser = signedInUser.user;

      try {
        console.log("inside getIdToken");
        //get idToken for further authentication (get a fresh token)
        const idToken = await currentUser.getIdToken(true);

        //action call to set cookies
        await setAuthCookies(idToken);

        const res = await studentSignedUp(email);
        if (!res.success) {
          //error returned from action
          console.error(res.error);

          try {
            //if unsuccessful, delete user from firebase
            await deleteUser(currentUser);
          } catch {
            //if couldn't delete user, log it
            clientLogger(
              `error deleting user from firebase with email ${email}, after unsuccessful studentSignedUp action call. Will need to delete user manually from firebase. Action error response: ${res.error}`,
            );
          }

          try {
            //action call to delete cookies
            await deleteAuthCookies();
          } catch (e) {
            console.error("error deleting auth cookies", e);
            setFatalError("Çerezler temizlenirken bir hata oluştu.");
            return;
          }

          setFatalError(
            "Üyelik işlemi tamamlanamadı. Lütfen yeniden link gönderilmesini talep ediniz.",
          );
          return;
        }
      } catch (e) {
        console.error("error getIdToken, setAuthCookies or studentSignedUp", e);

        try {
          //if couldn't update database, delete user from firebase
          await deleteUser(currentUser);
        } catch {
          //if couldn't delete user, log it
          clientLogger(
            `error deleting user from firebase with email ${email}, after getIdToken, setAuthCookies or studentSignedUp action call error. Will need to delete user manually from firebase.`,
          );
        }

        try {
          //action call to delete cookies
          await deleteAuthCookies();
        } catch (e) {
          console.error("error deleting auth cookies", e);
          setFatalError("Çerezler temizlenirken bir hata oluştu.");
          return;
        }

        setFatalError(
          "Üyelik işlemi tamamlanamadı. Lütfen yeniden link gönderilmesini talep ediniz.",
        );
        return;
      }
    } else {
      //if it's not a sign in with email link
      console.error("firebase error isSignInWithEmailLink, link not valid");
      setFatalError("Email linki geçerli değil.");
      return;
    }

    //set loggedIn state, email and role in session storage
    window.sessionStorage.setItem("loggedIn", "true");
    window.sessionStorage.setItem("email", email);
    window.sessionStorage.setItem("role", "user");

    //redirect to home
    router.push("/");
  }

  return (
    <Container>
      <Center>
        {fatalError ? (
          <Text size="xl" c="red" mt="xl">
            {fatalError}
          </Text>
        ) : (
          <Paper
            withBorder
            shadow="md"
            miw={rem(280)}
            p={20}
            mt={30}
            radius="md"
          >
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
        )}
      </Center>
    </Container>
  );
}
