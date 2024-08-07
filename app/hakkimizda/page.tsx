import Image from "next/image";
import Header from "../components/header/Header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="bg-background min-h-dvh flex flex-col">
      <Header />
      <main className="container grow flex flex-col">
        <div className="justify-center flex flex-col items-center gap-8">
          <div className="flex justify-center max-w-96 max-h-48">
            <Image
              src="/classroom.jpg"
              alt="classroom picture"
              width={600}
              height={300}
              className="rounded-[50%] object-none object-left opacity-75"
              style={{
                maskImage:
                  "radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
              }}
            />
          </div>
          <p>
            Adana ve Akdeniz Bölgesinde Ileri Düzey Teknoloji Egitimleri’ne
            duyulan ihtiyacin farkinda olan Platon Bilisim Akademi kurumlara ve
            bireylere ekonomik ve evrensel standartlarda egitim sunmak amaciyla
            bir grup Elektrik-Elektronik Mühendisi tarafindan 2002 yilinda
            kurulmustur. Kurumumuz faaliyetlerini Bilisim Teknolojileri
            konusunda eğitimler ve danışmanlık hizmetleri vererek
            sürdürmektedir.
          </p>
        </div>

        <Carousel className="w-full max-w-md self-center">
          <CarouselContent>
            <CarouselItem className="sm:basis-1/2 md:basis-1/3">
              <div className="p-1 sm:p-0">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <Image
                      src="/car1.jpg"
                      alt="car1"
                      width={500}
                      height={500}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
            <CarouselItem className="sm:basis-1/2 md:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <Image
                      src="/car2.jpg"
                      alt="car2"
                      width={500}
                      height={500}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
            <CarouselItem className="sm:basis-1/2 md:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <Image
                      src="/car3.jpg"
                      alt="car3"
                      width={500}
                      height={500}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="self-center">
          <p className="text-center text-3xl">Baş Eğitmen</p>
          <div className=" flex flex-wrap md:flex-nowrap gap-8 align-items-center ">
            <Image
              src="/alimentes.jpeg"
              alt="Dr. Erinç Ali Menteş"
              width={200}
              height={200}
              className="rounded-full opacity-75"
            />
            <div className="self-center">
              <p>
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
        </div>
      </main>
    </div>
  );
}
