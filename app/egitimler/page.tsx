"use client";
import "../globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import Header from "../components/header/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BackgroundGradient } from "@/components/ui/background-gradient";

import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

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

  //array of periods after fetchPeriods
  const [nextPeriods, setNextPeriods] = useState<
    {
      periodId: number;
      beginsAt: Date;
      endsAt: Date;
      courseName: string;
    }[]
  >([]);

  useEffect(() => {
    fetchCurriculums();
    fetchNextPeriods();

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

  async function fetchNextPeriods() {
    try {
      //call to getNextPeriods api
      const res = await fetch("egitimler/api/getNextPeriods", {
        method: "GET",
      });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      if (resParsed.nextPeriods.length > 0) {
        //set nextPeriods state array
        setNextPeriods(
          //create a new array from response values
          resParsed.nextPeriods.map(
            (period: {
              id: number;
              begins_at: Date;
              ends_at: Date;
              curriculum: {
                course: { name: string };
              };
            }) => {
              return {
                periodId: period.id,
                beginsAt: period.begins_at,
                endsAt: period.ends_at,
                courseName: period.curriculum.course.name,
              };
            },
          ),
        );
      }
    } catch (e) {
      console.error("error fetching next periods", e);
    }
  }

  const courseList = curriculums.map((curriculum, index) => {
    return (
      <AccordionItem key={curriculum.curriculumId} value={index.toString()}>
        <AccordionTrigger>{curriculum.courseName}</AccordionTrigger>
        <AccordionContent>
          <p className="grow self-center">{curriculum.courseDescription}</p>
          <DialogTrigger asChild>
            <Button variant="outline" className="self-end">
              Müfredatı Gör
            </Button>
          </DialogTrigger>
        </AccordionContent>
      </AccordionItem>
    );
  });

  //list of components showing period details
  const nextPeriodList = nextPeriods.map((period) => {
    const begins = dayjs(new Date(period.beginsAt)).locale("tr").format("LL");
    const ends = dayjs(new Date(period.endsAt)).locale("tr").format("LL");

    return (
      <>
        <div key={period.periodId} className="flex">
          <p className="text-foreground">{begins}</p>
          <div className="h-1 border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-25 dark:opacity-100 grow self-center mx-2"></div>
          <p className="text-foreground">{ends}</p>
        </div>

        <p className="text-center text-foreground">{period.courseName}</p>
      </>
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
      {curriculums.length > 0 ? (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {curriculums[selectedCurriculumIndex!]?.courseName}
              </DialogTitle>
              <Accordion type="single" collapsible>
                {curriculums[selectedCurriculumIndex!]?.weeks.map((week) => {
                  return (
                    <AccordionItem
                      key={week.weekNo}
                      value={week.weekNo.toString()}
                    >
                      <AccordionTrigger>
                        {week.weekNo.toString() + ". Hafta"}
                      </AccordionTrigger>
                      <AccordionContent>
                        {week.weekDescription}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </DialogHeader>
          </DialogContent>

          <div className="container max-w-[750px] flex flex-col gap-6 pt-6 sm:pt-10">
            <BackgroundGradient className="bg-background rounded-[20px] p-2 sm:p-4">
              <p className="text-lg text-center font-semibold mb-6">
                Dersler ve Müfredatları
              </p>
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
            </BackgroundGradient>
            {nextPeriodList.length > 0 ? (
              <BackgroundGradient className="bg-background rounded-[20px] p-2 sm:p-4 divide-x-1">
                <p className="text-center text-lg font-semibold mb-6">
                  Önümüzdeki dönemler
                </p>
                {nextPeriodList}
              </BackgroundGradient>
            ) : null}
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
