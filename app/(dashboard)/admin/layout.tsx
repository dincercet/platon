"use server";

import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.layer.css";

import { Container, rem, Flex, MantineProvider } from "@mantine/core";
import { theme } from "theme";
import isAdminAuth from "./actions/isAdminAuth";
import { redirect } from "next/navigation";
import { Navbar } from "./components/Navbar";
import MantineHeaderAdmin from "./components/MantineHeaderAdmin";
import logger from "@/winston-config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <MantineProvider theme={theme} forceColorScheme="dark">
      <MantineHeaderAdmin />
      <Container display="flex" px={rem(3)}>
        <Navbar />
        <Flex justify="center" w="100%">
          {children}
        </Flex>
      </Container>
    </MantineProvider>
  );
}
