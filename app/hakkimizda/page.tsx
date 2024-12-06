import Image from "next/image";
import Header from "../components/header/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CaretDownIcon } from "@radix-ui/react-icons";
import Footer from "../components/footer/Footer";

export default function Page() {
  return (
    <>
      <div className="bg-background min-h-dvh flex flex-col">
        <Header />
        <main className="container grow flex flex-col">
          <div className="grow flex flex-col justify-center gap-6">
            <p className="text-center text-4xl font-semibold">Baş Eğitmen</p>
            <div className="flex flex-col gap-6 items-center ">
              <Image
                src="/alimentes.jpeg"
                alt="Dr. Erinç Ali Menteş"
                width={225}
                height={225}
                className="border rounded-full size-48 sm:size-64"
              />
              <p className="max-w-xl">
                Experienced Instructor with a demonstrated history of working in
                the computer networking industry. Skilled in Computer
                Networking, C#, SQL Programming and Administration . Strong
                education professional with Bsc. Electornic Engineer from Middle
                East Technical University/Ankara and a Doctor of Philosophy -
                PhD focused in Sociology from Mersin Üniversitesi / Mersin
                University.
              </p>
            </div>
          </div>

          <div className="flex flex-col text-blue-700 dark:text-blue-400">
            <p className="text-lg text-center italic">eğitim merkezimiz</p>
            <CaretDownIcon className="self-center w-16 h-16 animate-bounce" />
          </div>
        </main>
      </div>

      <div className="relative min-h-dvh flex justify-center dark:bg-zinc-950 dark:shadow-inner dark:shadow-indigo-950 ">
        <div className="absolute container min-h-full flex flex-col">
          <div className="grow flex flex-col gap-6 justify-center">
            <p className="text-center text-4xl font-semibold">Kısaca Platon</p>
            <div className="justify-center flex flex-col items-center gap-8">
              <p className="max-w-3xl">
                Adana ve Akdeniz Bölgesinde Ileri Düzey Teknoloji Egitimleri’ne
                duyulan ihtiyacin farkinda olan Platon Bilisim Akademi kurumlara
                ve bireylere ekonomik ve evrensel standartlarda egitim sunmak
                amaciyla bir grup Elektrik-Elektronik Mühendisi tarafindan 2002
                yilinda kurulmustur. Kurumumuz faaliyetlerini Bilisim
                Teknolojileri konusunda eğitimler ve danışmanlık hizmetleri
                vererek sürdürmektedir.
              </p>
            </div>
          </div>

          <div className="grow">
            <Carousel className="mx-6 sm:mx-12">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2">
                  <Image
                    src="/car1.jpg"
                    alt="car1"
                    width={750}
                    height={750}
                    className="object-cover rounded-xl"
                  />
                </CarouselItem>
                <CarouselItem className="md:basis-1/2">
                  <Image
                    src="/car2.jpg"
                    alt="car2"
                    width={750}
                    height={750}
                    className="object-cover rounded-xl"
                  />
                </CarouselItem>
                <CarouselItem className="md:basis-1/2">
                  <Image
                    src="/car3.jpg"
                    alt="car3"
                    width={750}
                    height={750}
                    className="object-cover rounded-xl"
                  />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
      <Footer primary={true} />
    </>
  );
}
