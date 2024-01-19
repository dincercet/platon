import isAdminAuth from "./actions/isAdminAuth";
import { redirect } from "next/navigation";

//todo: convert into async?
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //todo: test with a user account

  //if auth fails redirect
  if (!(await isAdminAuth())) {
    redirect("/");
  }

  //else continue rendering
  return <>{children}</>;
}
