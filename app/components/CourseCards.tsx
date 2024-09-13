"use client";
import {
  CardDescription,
  HoverEffect,
} from "@/components/ui/card-hover-effect";

import { useEffect, useState } from "react";

export default function CourseCards() {
  //array of courses fetched
  const [courses, setCourses] = useState<
    { id: number; name: string; description: string; legacy: boolean }[]
  >([]);

  useEffect(() => {
    fetchCourses();
    console.log("useEffect: fetchCourses called");
  }, []);

  //call to getCourses api, then set courses state
  async function fetchCourses() {
    try {
      const res = await fetch("api/getCourses", { method: "GET" });
      const resParsed = await res.json();

      if (!res.ok) {
        //error returned from api
        console.error(resParsed.error);
        return;
      }

      //set courses state based on retrieved courses
      if (resParsed.courses.length > 0) setCourses(resParsed.courses);
    } catch (e) {
      console.error("error fetching courses", e);
    }
  }

  return (
    <HoverEffect
      items={courses.map((course: any) => {
        return {
          title: course.name,
          description: course.description,
          link: "/egitimler",
        };
      })}
    ></HoverEffect>
  );
}
