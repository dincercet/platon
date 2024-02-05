"use server";
import isAdminAuth from "./actions/isAdminAuth";
import { redirect } from "next/navigation";
import { Navbar } from "./components/Navbar";
import { Container, rem } from "@mantine/core";

//todo: convert into async?
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //todo: test with a user account

  //todo: since root template includes client components,
  //does it mean this layout will also be rendered on the client?
  //if so, will have to consider security risk.

  //if auth fails redirect
  if (!(await isAdminAuth())) {
    redirect("/");
  }

  //todo: check if second container is necessary
  //else continue rendering
  return (
    <>
      <Container display="flex" pl={rem(3)}>
        <Navbar />
        {children}
      </Container>
    </>
  );
}
