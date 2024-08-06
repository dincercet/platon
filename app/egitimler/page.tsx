"use client";

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

import localizedFormat from "dayjs/plugin/localizedFormat";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { IconClock, IconSchool } from "@tabler/icons-react";
dayjs.extend(localizedFormat);

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
        <AccordionTrigger className="sm:text-lg">
          {curriculum.courseName}
        </AccordionTrigger>
        <AccordionContent>
          <p>{curriculum.courseDescription}</p>

          <div className="text-center mt-2">
            <DialogTrigger asChild>
              <Button variant="default">Müfredatı Gör</Button>
            </DialogTrigger>
          </div>
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
        <p className="text-center text-blue-700 dark:text-blue-400 pb-4">
          {period.courseName}
        </p>
        <div key={period.periodId} className="flex pb-8">
          <p className="text-foreground text-sm">{begins}</p>
          <div className="h-[2px] border-t-0 bg-transparent bg-gradient-to-r from-transparent via-indigo-950 dark:via-indigo-200  to-transparent opacity-25 dark:opacity-100 grow self-center mx-2"></div>
          <p className="text-foreground text-sm">{ends}</p>
        </div>
      </>
    );
  });

  return (
    <div className="bg-background">
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="grow flex flex-col">
          {curriculums.length > 0 ? (
            <Dialog>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {curriculums[selectedCurriculumIndex!]?.courseName}
                  </DialogTitle>
                  <Accordion type="single" collapsible className="pt-4">
                    {curriculums[selectedCurriculumIndex!]?.weeks.map(
                      (week) => {
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
                      },
                    )}
                  </Accordion>
                </DialogHeader>
              </DialogContent>

              <div className="container grow h-full max-w-[750px] flex flex-col">
                <div className="flex-1 flex flex-col gap-4 sm:gap-8 justify-center">
                  <div className="flex flex-col gap-1 sm:gap-2 items-center">
                    <IconSchool size={36} />
                    <p className="text-2xl sm:text-4xl text-center font-semibold mb-4">
                      Dersler ve Müfredatları
                    </p>
                  </div>
                  <Accordion
                    type="single"
                    collapsible
                    onValueChange={(value) => {
                      setSelectedCurriculumIndex(Number(value));
                    }}
                  >
                    {courseList}
                  </Accordion>
                </div>

                <div className="flex flex-col text-blue-700 dark:text-blue-400">
                  <p className="text-lg text-center italic">
                    dönemlere göz atın
                  </p>
                  <CaretDownIcon className="self-center w-16 h-16 animate-bounce" />
                </div>
              </div>
            </Dialog>
          ) : null}
        </main>
      </div>

      {nextPeriodList.length > 0 ? (
        <div className="min-h-dvh dark:bg-zinc-950 dark:shadow-inner dark:shadow-indigo-950">
          <div className="container py-16 sm:py-24 flex flex-col gap-2 sm:gap-8 ">
            <div className="flex flex-col gap-1 sm:gap-2 items-center">
              <IconClock size={36} />
              <p className="text-center text-2xl sm:text-4xl font-semibold pb-10">
                Önümüzdeki Dönemler
              </p>
            </div>
            <div>{nextPeriodList}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
