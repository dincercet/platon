import Header from "../components/header/Header";
import { IconMail, IconMapPin, IconPhone, IconUser } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="container flex flex-col justify-center">
        <p className="text-4xl font-bold text-center my-16">Bize ulaşın</p>
        <div className="flex flex-wrap sm:flex-nowrap">
          <div className="sm:w-1/2 z-10 flex justify-center">
            <div className="flex flex-col gap-2 sm:place-content-center">
              <div className="flex  items-center">
                <IconUser size={28} />
                &nbsp;
                <p className="text-xl">Ali Menteş</p>
              </div>

              <div className="flex  items-center ">
                <IconPhone size={28} />
                &nbsp;
                <p className="text-xl">0532 206 6470</p>
              </div>

              <div className="flex items-center">
                <IconMail size={28} />
                &nbsp;
                <p className="text-xl">adana@platon.com.tr</p>
              </div>
            </div>
          </div>

          <Separator className="sm:hidden my-5" />

          <div className="flex flex-col flex-wrap w-full gap-2 sm:flex-row sm:w-1/2">
            <div className="flex sm:w-full items-center">
              <IconMapPin size={28} />
              &nbsp;
              <p className="text-xl">Uğur Mumcu Bulvarı, Adana</p>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3184.221218811765!2d35.29595527699728!3d37.05221115345126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152885e430861eed%3A0x56346e2254a1a301!2sPlaton%20Bili%C5%9Fim%20Akademi!5e0!3m2!1sen!2str!4v1709496531169!5m2!1sen!2str"
              className="border-0 w-[300px] h-[225px] sm:w-[600px] sm:h-[450px]"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
