"use client";

import "./globals.css";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Header from "./components/header/Header";
import CourseCards from "./components/CourseCards";
import CountUp from "react-countup";
import { CaretDownIcon } from "@radix-ui/react-icons";

//implement container? (without trimming bg color)
export default function Page() {
  return (
    <>
      <div className="min-h-screen flex flex-col dark:bg-indigo-950">
        <Header />
        <div className="flex-grow flex flex-col px-2 sm:px-4">
          <div className="flex-grow flex flex-col items-center justify-center py-16">
            <p className="text-center pb-6 sm:pb-4 md:pb-0 text-lg text-foreground mb-2">
              Adana&apos;nın köklü eğitim merkezi
            </p>
            <TypewriterEffect
              words={[
                { text: "Bilişim" },
                { text: "dünyasını" },
                {
                  text: "Platon'da",
                  className: "text-blue-700 dark:text-blue-400",
                },
                { text: "keşfedin." },
              ]}
              className="text-wrap text-4xl md:text-5xl"
            />
          </div>

          <div className="flex-grow flex flex-col items-center container">
            <div className="flex-grow pb-8 md:pb-0 md:w-full grid grid-rows-3 md:grid-cols-3 gap-8 md:gap-0 md:place-items-center text-foreground text-2xl text-nowrap">
              <p>
                <span className="border-4 rounded-full border-blue-700 dark:border-blue-400 p-2">
                  <CountUp
                    start={0}
                    end={20}
                    duration={7}
                    delay={3}
                    prefix="+"
                  />
                </span>
                <span> yıl hizmet</span>
              </p>
              <p>
                <span className="border-4 rounded-full border-blue-700 dark:border-blue-400 p-2">
                  <CountUp
                    start={0}
                    delay={3}
                    end={500}
                    duration={5}
                    prefix="+"
                  />
                </span>{" "}
                mezun
              </p>
              <p>
                <span className="border-4 rounded-full border-blue-700 dark:border-blue-400 p-2">
                  <CountUp
                    start={0}
                    end={8}
                    delay={3}
                    duration={7}
                    prefix="~"
                  />
                </span>{" "}
                kişilik sınıf
              </p>
            </div>
            <div className="flex flex-col pb-9 md:pb-0 text-blue-700 dark:text-blue-400">
              <p className="text-lg text-center italic">
                derslerimize göz atın
              </p>
              <CaretDownIcon className="self-center w-16 h-16 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen block justify-center">
        <CourseCards />
      </div>
    </>
  );
}
