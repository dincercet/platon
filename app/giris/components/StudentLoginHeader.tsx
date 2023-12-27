"use client";
import { Title } from "@mantine/core";
import classes from "./StudentLoginHeader.module.css";

export default function StudentLoginHeader() {
  return (
    <Title ta="center" className={classes.title}>
      Öğrenci Girişi
    </Title>
  );
}
