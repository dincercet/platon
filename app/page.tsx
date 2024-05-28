import "./globals.css";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Header from "./components/header/Header";
import CourseCards from "./components/CourseCards";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="container px-2 sm:px-4">
        <div className="block justify-center my-16">
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

        <div className="w-1/2 text-right">
          <p className="md:text-2xl">
            {"Adana'da"}
            <br />
            <span className="text-blue-500 dark:text-blue-500">20 yıldır</span>
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
        <div className="block justify-center">
          <CourseCards />
        </div>
      </div>
    </div>
  );
}
