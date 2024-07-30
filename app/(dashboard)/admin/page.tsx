import { Flex, rem, Text, Divider, Paper } from "@mantine/core";

export default function Page() {
  return (
    <Flex direction="column" m={rem(8)}>
      <Paper shadow="xs" radius="lg" withBorder p="lg">
        <Text>
          Dersler, müfredatlar, dönemler ve öğrenciler harmoni içindedir.
        </Text>
        <Text>Bu nedenle rasgele eklenip silinemezler.</Text>
        <Text>
          Bir döneme atanmış öğrencilerin öğrenci panelindeki dönem bilgileri ve
          dökümanlarını kaybetmemesi amacıyla{" "}
          <Text span c="orange">
            eskitme
          </Text>{" "}
          sistemi kullanılır.
        </Text>
      </Paper>

      <Divider my="md" />

      <Paper shadow="xs" radius="lg" withBorder p="lg">
        <Text size="lg" c="blue">
          Dersler:
        </Text>
        <Text>
          Sistemde müfredat ve dönemden önce bir ders eklenmesi gerek.
        </Text>
        <Text>Dersler isim ve açıklamadan oluşur.</Text>
        <Text>
          Ders ekleme konusunda bir kısıtlama yok fakat aynı dersten iki adet
          eklemek gereksiz.
        </Text>
        <Text>
          Bir dersi{" "}
          <Text span c="red">
            silmek
          </Text>{" "}
          için bu derse bağlı müfredatların da silinmiş olması gerekir. Aksi
          takdirde bu ders sadece{" "}
          <Text span c="orange">
            eskitilebilir
          </Text>
          .
        </Text>
        <Text>
          Ders{" "}
          <Text span c="orange">
            eskitilir
          </Text>{" "}
          ise bu derse bağlı müfredatlar da{" "}
          <Text span c="orange">
            eskitilir
          </Text>
          .
        </Text>
        <Text>
          Sadece{" "}
          <Text span c="orange">
            eskitilmemiş
          </Text>{" "}
          dersler Anasayfada sergilenir.
        </Text>
      </Paper>

      <Divider my="md" />

      <Paper shadow="xs" radius="lg" withBorder p="lg">
        <Text size="lg" c="blue">
          Müfredatlar:
        </Text>
        <Text>Ders ekledikten sonra sırada ders müfredatı eklemek var.</Text>
        <Text>
          Her bir müfredat, o müfredata eklenen haftalarda ne yapılacağını
          tanımlar.
        </Text>
        <Text>
          Bir derse ait birden fazla müfredat eklenebilir, ancak sadece bir adet
          güncel müfredatın bulunması gerektiğinden o derse ait diğer
          müfredatların{" "}
          <Text span c="orange">
            eskitilmiş
          </Text>{" "}
          olması gerekir.
        </Text>
        <Text>
          Bir müfredatı{" "}
          <Text span c="red">
            silmek
          </Text>{" "}
          için bu müfredata bağlı bir dönemin olmaması gerekir. Aksi takdirde bu
          müfredat sadece{" "}
          <Text span c="orange">
            eskitilebilir
          </Text>
          .
        </Text>
        <Text>
          Sadece{" "}
          <Text span c="orange">
            eskitilmemiş
          </Text>{" "}
          müfredatlar Eğitimler sayfasında sergilenir.
        </Text>
      </Paper>

      <Divider my="md" />

      <Paper shadow="xs" radius="lg" withBorder p="lg">
        <Text size="lg" c="blue">
          Dönemler:
        </Text>
        <Text>
          Ders müfredatlarını ekledikten sonra sırada öğrencilerin atanacağı
          dönemleri eklemek var.
        </Text>
        <Text>
          Dönemin müfredatı ve başlangıç - bitiş tarihleri seçilerek eklenir.
          Ardından bu döneme haftalık olarak dökümanlar eklenebilir.
        </Text>
        <Text>
          Dönemlerde{" "}
          <Text span c="orange">
            eskitme
          </Text>{" "}
          gereksinimi yok. Ancak bir dönemi{" "}
          <Text span c="red">
            silerken
          </Text>{" "}
          dikkatli davranmak gerekir.
        </Text>
        <Text>
          Dönem{" "}
          <Text span c="red">
            silindiği
          </Text>{" "}
          takdirde o döneme ait tüm dökümanlar silinir ve öğrenciler dönemden
          koparılır.
        </Text>
        <Text>
          Başlangıç tarihi geçen dönemler Eğitimler sayfasında sergilenmez, bu
          nedenle bir dönemi{" "}
          <Text span c="red">
            silmek
          </Text>{" "}
          gereksizdir.
        </Text>
      </Paper>

      <Divider my="md" />

      <Paper shadow="xs" radius="lg" withBorder p="lg">
        <Text size="lg" c="blue">
          Öğrenciler:
        </Text>
        <Text>
          Öğrenci eklemek için bir ön gereksinim yok. Öğrenci eklendikten sonra
          da bir veya birden fazla döneme atanılabilir.
        </Text>
        <Text>
          Öğrenci eklenince öğrenciye e-posta aracılığıyla davet linki
          gönderilir. Linke tıkladıktan sonra Kayıt sayfasına yönlendirilen
          öğrenci şifresini belirler ve kaydolur. Öğrencinin kayıt işlemini
          tamamlama durumu Admin tarafından görülebilir. Bu link sadece{" "}
          <Text span c="red">
            6 saat
          </Text>{" "}
          geçerlidir, zaman aşımına uğraması halinde öğrencinin yeniden
          eklenmesi gerekir.
        </Text>
        <Text>
          Google&apos;ın kısıtlaması sebebiyle{" "}
          <Text span c="red">
            24 saat
          </Text>{" "}
          içinde sadece{" "}
          <Text span c="red">
            5 adet
          </Text>{" "}
          e-posta gönderilebilir.
        </Text>
        <Text>
          Öğrenci paneline giriş yaptığında atandığı dönemlere ait bilgileri
          görebilir ve o dönemlere ait dökümanları indirebilir.
        </Text>
      </Paper>
    </Flex>
  );
}
