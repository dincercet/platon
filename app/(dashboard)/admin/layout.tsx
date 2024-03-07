"use server";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Flex, MantineProvider } from "@mantine/core";
import { theme } from "theme";
import isAdminAuth from "./actions/isAdminAuth";
import { redirect } from "next/navigation";
import { Navbar } from "./components/Navbar";
import { Container, rem } from "@mantine/core";
import MantineHeader from "../../components/header/MantineHeader";
import logger from "@/winston-config";

//todo: convert into async?
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //todo: test with a user account

  try {
    //if auth fails redirect
    if (!(await isAdminAuth())) {
      redirect("/");
    }
  } catch (e) {
    logger.error("isAdminAuth error", e);
    redirect("/");
  }

  //else continue rendering
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <MantineHeader />
      <Container display="flex" px={rem(3)}>
        <Navbar />
        <Flex justify="center" w="100%">
          {children}
        </Flex>
      </Container>
    </MantineProvider>
  );
}
