"use client";

import {
  setPersistence,
  browserSessionPersistence,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import auth from "firebase.init.js";
import { setAuthCookies } from "app/actions/setAuthCookies";
import { useRouter } from "next/navigation";
import { TextInput, PasswordInput, Paper, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import studentSignedUp from "./actions/studentSignedUp";
import clientLogger from "app/actions/clientLogger";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";

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

    //check if signing in through email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      //there is a long list of calls with nested try/catch blocks in order to handle errors without losing sync between firebase db and server db
      let signedInUser;
      try {
        //sign in with email link
        signedInUser = await signInWithEmailLink(
          auth,
          email,
          window.location.href,
        );
      } catch (e) {
        console.error("error firebase signInWithEmailLink", e);
        throw new Error(
          "Hesap yaratılırken bir hata oluştu. Lütfen yeniden link gönderilmesini talep ediniz.",
        );
      }

      let user;
      try {
        //associate the email with the password
        if (signedInUser)
          user = await linkWithCredential(
            signedInUser.user,
            EmailAuthProvider.credential(email, password),
          );
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
        throw new Error(
          "E-postayı şifre ile bağdaştırırken bir hata oluştu. Lütfen yeniden link gönderilmesini talep ediniz.",
        );
      }

      if (user) {
        //successfully signed in and linked with email
        let currentUser = user.user;

        try {
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
              throw new Error("Çerezler temizlenirken bir hata oluştu.");
            }

            throw new Error(
              "Üyelik işlemi tamamlanamadı. Lütfen yeniden link gönderilmesini talep ediniz.",
            );
          }
        } catch (e) {
          console.error(
            "error getIdToken, setAuthCookies or studentSignedUp",
            e,
          );

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
            throw new Error("Çerezler temizlenirken bir hata oluştu.");
          }

          throw new Error(
            "Üyelik işlemi tamamlanamadı. Lütfen yeniden link gönderilmesini talep ediniz.",
          );
        }
      }
    } else {
      console.error("firebase error isSignInWithEmailLink, link not valid");
      throw new Error("Email link not valid.");
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
