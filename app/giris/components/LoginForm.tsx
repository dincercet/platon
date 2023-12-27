"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "../../../firebase.config.js";
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
};

//handle form submit
function handleSignIn(email: string, password: string, e: React.FormEvent) {
  //client side call to firebase
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("user: ", user);
      console.log("event: ", e);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

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
    },
    validate: zodResolver(schema),
  });

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form
        onSubmit={(e) =>
          handleSignIn(form.values.email, form.values.password, e)
        }
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
          <Checkbox label="Beni hatırla" />
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
