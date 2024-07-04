import "./globals.css";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Header from "./components/header/Header";
import CourseCards from "./components/CourseCards";

//implement container? (without trimming bg color)
export default function Page() {
  return (
    <>
      <div className="min-h-screen flex flex-col dark:bg-indigo-950">
        <Header />
        <div className="flex-grow flex flex-col px-2 sm:px-4">
          <div className="flex-grow flex flex-col items-center justify-center my-16">
            <p className="text-center pb-6 sm:pb-4 md:pb-0 text-lg mb-2 text-indigo-950 dark:text-indigo-200">
              Adana&apos;ya kök salmış eğitim merkezi
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

          <div className="flex-grow">
            <div className="w-1/2 text-right">
              <p className="md:text-2xl">
                {"Adana'da"}
                <br />
                <span className="text-blue-700 dark:text-blue-400">
                  20 yıldır
                </span>
                <br />
                hizmetinizdeyiz
              </p>
            </div>
            <div className="w-1/2 float-right text-left">
              <p className="md:text-2xl">
                ve alanımızda
                <br />
                <span className="text-blue-700 dark:text-blue-400">
                  iddaalıyız.
                </span>
              </p>
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
