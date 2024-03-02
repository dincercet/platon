"use client";
import "../globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "../components/header/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function Page() {
  //array of curriculums, and array of weeks within each curriculum
  const [curriculums, setCurriculums] = useState<
    {
      curriculumId: number;
      createdAt: Date;
      courseName: string;
      courseDescription: string;
      weeks: { weekId: number; weekNo: number; weekDescription: string }[];
    }[]
  >([]);

  const [selectedCurriculumIndex, setSelectedCurriculumIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchCurriculums();
    console.log("useEffect fetchCurriculums called");
  }, []);

  async function fetchCurriculums() {
    try {
      const res = await fetch("egitimler/api/getCurriculums", {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.curriculums.length > 0) {
        //set curriculums state array
        setCurriculums(
          //create a new array from response values
          resParsed.curriculums.map(
            (curriculum: {
              id: number;
              created_at: Date;
              course: { name: string; description: string };
              weeks: { id: number; week_no: number; description: string }[];
            }) => {
              //array created is a little complicated because of nested query from database.
              return {
                curriculumId: curriculum.id,
                createdAt: curriculum.created_at,
                courseName: curriculum.course.name,
                courseDescription: curriculum.course.description,
                //create a new array of weeks related to the curriculum
                weeks: curriculum.weeks.map((week) => {
                  return {
                    weekId: week.id,
                    weekNo: week.week_no,
                    weekDescription: week.description,
                  };
                }),
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching curriculums", e);
    }
  }

  const courseList = curriculums.map((curriculum, index) => {
    return (
      <AccordionItem key={curriculum.courseName} value={index.toString()}>
        <AccordionTrigger>{curriculum.courseName}</AccordionTrigger>
        <AccordionContent>{curriculum.courseDescription}</AccordionContent>
      </AccordionItem>
    );
  });
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Header />
      <div className="container">
        {curriculums.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            onValueChange={(value) => {
              setSelectedCurriculumIndex(Number(value));
              console.log(value);
            }}
          >
            {courseList}
          </Accordion>
        ) : null}
      </div>
    </div>
  );
}
