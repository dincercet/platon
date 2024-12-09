"use server";

import "@mantine/core/styles.layer.css";

import { MantineProvider } from "@mantine/core";
import { theme } from "theme";
import isUserAuth from "./actions/isUserAuth";
import { redirect } from "next/navigation";
import { Container, rem } from "@mantine/core";
import MantineHeader from "../../components/header/MantineHeader";
import logger from "@/winston-config";

//todo: convert into async?
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    //if auth fails redirect
    if (!(await isUserAuth())) {
      redirect("/");
    }
  } catch (e) {
    logger.error("isUserAuth error", e);
    redirect("/");
  }

  //else continue rendering
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <MantineHeader />
      <Container display="flex-column" px={rem(3)}>
        {children}
      </Container>
    </MantineProvider>
  );
}
