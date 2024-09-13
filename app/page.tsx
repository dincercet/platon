"use client";

import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Header from "./components/header/Header";
import CourseCards from "./components/CourseCards";
import CountUp from "react-countup";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const graduates = [
  {
    quote: "Koç Sistem",
    name: "Ali Utku Beyaz",
    title: "Network-Sistem Uzmanlığı",
  },
  {
    quote: "Gaziantep Belediyesi",
    name: "Elif Çilingir",
    title: "CCNA-Network",
  },
  {
    quote: "DCL Bilgisayar",
    name: "Mehmet Burak Demiray",
    title: "MCSE-Sistem Uzmanlığı",
  },
  {
    quote: "Alcatel",
    name: "Sinan Çagatay",
    title: "Network-Sistem Uzmanlığı",
  },
  {
    quote: "Borusan Oto",
    name: "Mesut Ulas",
    title: "MCSE-Sistem Uzmanlığı",
  },
  {
    quote: "Gündogdu Okullari",
    name: "Ahmet Yavuz",
    title: "MCSE-Sistem Uzmanlığı",
  },
  {
    quote: "BSD Bilgisayar",
    name: "Ufuk Murat Yildirim",
    title: "Network-Sistem Uzmanlığı",
  },
  {
    quote: "Keynet",
    name: "Ali Rıza Öztürk",
    title: "CVOICE-Netowrk-Sistem Uzmanlığı",
  },
  {
    quote: "BOSSA",
    name: "Eser Yücel",
    title: "Ag Yöneticiligi - CCNA",
  },
  {
    quote: "Gaziantep Üniversitesi",
    name: "Ibrahim Gül",
    title: "Yazilim Uzmani - MCPD",
  },
  {
    quote: "TEMSA",
    name: "Veysel Yünlüel",
    title: "Network Uzmanlığı",
  },
  {
    quote: "Şehir Hastanesi-Adana",
    name: "Fatih Önür",
    title: "Sistem Uzmani",
  },
  {
    quote: "Alcatel",
    name: "Yalçin Kulaklioglu",
    title: "Ag Yöneticisi",
  },
  {
    quote: "Yapi Kredi",
    name: "Ayhan Tunç",
    title: "Ag Yöneticisi",
  },
  {
    quote: "Tekstil Bank",
    name: "Melih Teke",
    title: "Ag Yöneticisi",
  },
  {
    quote: "LOGO Team",
    name: "Osman Özer",
    title: "Sistem Uzmanı",
  },
];

export default function Page() {
  return (
    <div className="bg-background">
      <div className="min-h-dvh flex flex-col dark:bg-indigo-950">
        <Header />
        <main className="flex-grow flex flex-col px-2 sm:px-4">
          <div className="flex-grow flex flex-col items-center justify-center py-16">
            <p className="text-center pb-8 sm:pb-4 md:pb-0 text-lg text-foreground">
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
            <div className="flex-grow pb-8 md:pb-0 md:w-full grid grid-rows-3 md:grid-cols-3 gap-6 md:gap-0 md:place-items-center text-foreground text-2xl text-nowrap">
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
            <div className="flex flex-col text-blue-700 dark:text-blue-400">
              <p className="text-lg text-center italic">eğitimlere göz atın</p>
              <CaretDownIcon className="self-center w-16 h-16 animate-bounce" />
            </div>
          </div>
        </main>
      </div>

      <div className="block justify-center dark:bg-zinc-950 dark:shadow-inner dark:shadow-indigo-950">
        <div className="container flex flex-col items-center gap-5 py-10 md:pt-16">
          <CourseCards />
          <p className="text-foreground text-center">
            Eğitimi başarıyla tamamlayan öğrencilerimiz mezuniyet sertifikası
            edinir.
          </p>
          <Link href="/egitimler" legacyBehavior passHref>
            <Button variant="outline" size="lg" className="text-lg">
              Eğitim Detayları
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-5 py-8 dark:bg-indigo-950 dark:shadow-inner dark:shadow-zinc-950">
        <p className="text-foreground text-2xl font-semibold text-center">
          Mezunlarımızdan Bazıları
        </p>
        <div className="max-w-full relative overflow-hidden">
          <InfiniteMovingCards items={graduates} speed={"normal"} />
        </div>
      </div>
    </div>
  );
}
