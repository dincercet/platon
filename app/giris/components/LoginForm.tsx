"use client";

import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import auth from "firebase.config.js";
import { setCookies } from "../actions/setCookies";
import { redirect } from "next/navigation";
import {
  Text,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";

//form types
type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginForm() {
  //validate via zod
  const schema = z.object({
    email: z
      .string()
      .min(1, { message: "E-posta girmediniz." })
      .email("E-posta formatı hatalı."),
    password: z.string().min(1, { message: "Şifre girmediniz." }),
  });

  //mantine form hook
  const form = useForm<FormValues>({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validate: zodResolver(schema),
  });

  //handle form submit
  async function handleSignIn(e: React.FormEvent) {
    const email = form.values.email;
    const password = form.values.password;
    const remember = form.values.remember;

    //if 'remember me' is checked, set persistence
    if (remember) {
      try {
        await setPersistence(auth, browserSessionPersistence);
      } catch (e) {
        console.log(e);
      }
    }

    try {
      //client side call to firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // signed in
      const { user } = userCredential;

      //get idToken for further authentication
      const idToken = await user.getIdToken();

      //action call to set cookies
      await setCookies(idToken);

      console.log("user: ", user);
      console.log("event: ", e);
    } catch (e) {
      console.log(e);
    }

    redirect("/");
  }

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form onSubmit={(e) => handleSignIn(e)}>
        <TextInput
          label="E-posta"
          placeholder="E-postanız"
          required
          {...form.getInputProps("email")}
        />
        <Text size="sm" c="red">
          {form.errors.email}
        </Text>

        <PasswordInput
          label="Şifre"
          placeholder="Şifreniz"
          required
          mt="md"
          {...form.getInputProps("password")}
        />
        <Text size="sm" c="red">
          {form.errors.password}
        </Text>

        <Group justify="space-between" mt="lg">
          <Checkbox
            label="Beni hatırla"
            checked={form.values.remember}
            onChange={(e) => {
              form.setFieldValue("remember", e.currentTarget.checked);
            }}
          />
          <Anchor component="button" size="sm">
            Şifremi Unuttum
          </Anchor>
        </Group>

        <Button fullWidth mt="xl">
          Giriş Yap
        </Button>
      </form>
    </Paper>
  );
}
