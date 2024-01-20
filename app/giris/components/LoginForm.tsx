"use client";

import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import auth from "firebase.init.js";
import { setCookies } from "../actions/setCookies";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
  async function handleLogin(values: FormValues) {
    const email = values.email;
    const password = values.password;
    const remember = values.remember;

    //if 'remember me' is not checked, change local persistence to session persistence
    if (!remember) {
      try {
        await setPersistence(auth, browserSessionPersistence);
      } catch (e) {
        console.error("error firebase setPersistence", e);
        return;
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
      var { user } = userCredential;
    } catch (e) {
      console.error("error firebase signInWithEmailAndPassword", e);
      return;
    }

    try {
      //get idToken for further authentication
      var idToken = await user.getIdToken();
    } catch (e) {
      console.error("error firebase getIdToken", e);
      return;
    }

    try {
      //action call to set cookies
      await setCookies(idToken);
    } catch (e) {
      console.error("error setting cookies", e);
      return;
    }

    try {
      //fetch role from /giris/api
      const roleRes = await fetch("api/getUserRole", {
        method: "GET",
      });

      //parse the body
      var roleResData = await roleRes.json();

      //if res not ok, show the error returned from api
      if (!roleRes.ok) {
        console.error(roleResData.error);
        return;
      }
    } catch (e) {
      //any other error
      console.error("unknown role fetch error", e);
      return;
    }

    const role = roleResData.role;

    //if 'remember me' is checked, set email and role in local storage, else set in session storage
    if (remember) {
      window.localStorage.setItem("loggedIn", "true");
      window.localStorage.setItem("email", email);
      role === "USER"
        ? window.localStorage.setItem("role", "user")
        : window.localStorage.setItem("role", "admin");
    } else {
      window.sessionStorage.setItem("loggedIn", "true");
      window.sessionStorage.setItem("email", email);
      role === "USER"
        ? window.sessionStorage.setItem("role", "user")
        : window.sessionStorage.setItem("role", "admin");
    }

    console.log("user: (LoginForm) ", user.email);

    //redirect to home
    router.push("/");
  }

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form onSubmit={form.onSubmit((values) => handleLogin(values))}>
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

        <Button type="submit" fullWidth mt="xl">
          Giriş Yap
        </Button>
      </form>
    </Paper>
  );
}
