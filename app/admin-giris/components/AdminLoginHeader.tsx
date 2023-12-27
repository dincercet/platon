"use client";
import { Title } from "@mantine/core";
import classes from "./AdminLoginHeader.module.css";

export default function LoginHeader() {
  return (
    <Title ta="center" className={classes.title}>
      Admin Girişi
    </Title>
  );
}
