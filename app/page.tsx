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
            <p className="text-center md:text-lg mb-2">Deneyimimize güvenin.</p>
            <TypewriterEffect
              words={[
                { text: "Bilişim" },
                { text: "dünyasını" },
                {
                  text: "Platon'da",
                  className: "text-blue-500 dark:text-blue-500",
                },
                { text: "keşfedin." },
              ]}
            />
          </div>

          <div className="flex-grow">
            <div className="w-1/2 text-right">
              <p className="md:text-2xl">
                {"Adana'da"}
                <br />
                <span className="text-blue-500 dark:text-blue-500">
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
                <span className="text-blue-500 dark:text-blue-500">
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
