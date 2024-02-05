"use client";

import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import auth from "firebase.init.js";
import { setAuthCookies } from "app/actions/setAuthCookies";
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

//validate via zod
const schema = z.object({
  email: z
    .string()
    .min(1, { message: "E-posta girmediniz." })
    .max(100, { message: "E-posta en fazla 100 karakter olmalıdır." })
    .email({ message: "E-posta formatı hatalı." }),
  password: z
    .string()
    .min(1, { message: "Şifre girmediniz." })
    .max(100, { message: "Şifre en fazla 100 karakter olmalıdır." }),
});

export default function LoginForm() {
  const router = useRouter();

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
        //delete later
        console.log("persistence set to session");
      } catch (e) {
        console.error("error firebase setPersistence", e);
        throw new Error("error firebase setPersistence");
      }
    }

    let user;
    try {
      //client side call to firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // signed in
      user = userCredential.user;
    } catch (e) {
      console.error("error firebase signInWithEmailAndPassword", e);
      throw new Error("error firebase signInWithEmailAndPassword");
    }

    let idToken;
    try {
      //get idToken for further authentication (force token refresh: true)
      idToken = await user.getIdToken(true);
    } catch (e) {
      console.error("error firebase getIdToken", e);
      throw new Error("error firebase getIdToken");
    }

    try {
      //action call to set cookies
      await setAuthCookies(idToken);
    } catch (e) {
      console.error("error setting auth cookies", e);
      throw new Error("error setting auth cookies");
    }

    let roleResData;
    try {
      //fetch role from /giris/api
      const roleRes = await fetch(`api/getUserRole?email=${email}`, {
        method: "GET",
      });

      //parse the body
      roleResData = await roleRes.json();

      //if res not ok, show the error returned from api
      if (!roleRes.ok) {
        console.error(roleResData.error);
        throw new Error(roleResData.error);
      }
    } catch (e) {
      //any other error
      console.error("unknown role fetch error", e);
      throw new Error("unknown role fetch error");
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

    //redirect to home
    router.push("/");
  }

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form
        onSubmit={form.onSubmit((values, e) => {
          e?.preventDefault();
          handleLogin(values);
        })}
      >
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
