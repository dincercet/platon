## Fully Responsive Eğitim Merkezi Yönetim ve Tanıtım Sistemi  
  
Admin panelinden eğitim merkezinize sınıflar ekleyin, bu sınıflara öğrencileri atayın.  
Öğrencileriniz e-posta ile gönderilen davet linki ile kayıt olur ve öğrenci panelinden dönem bilgilerini görmekle birlikte paylaşılan dosyaları indirebilir.  
Müfredatlar yaratın ve hafta hafta işlediğiniz konuları belirtin.  
Dönemler oluşturun ve hangi sınıfın ne zaman başlayıp bittiğini, hangi müfredatı içerdiğini misafirlerin de görebileceği şekilde sunun.  
  
### *You should produce your own config files:*  
#### .env
(Prisma connection, Docker Compose MySQL environment variables)  
``` sh
DATABASE_URL="mysql://username:userpass@mysqlcontainer:3306/dbname?schema=public"

DB_NAME="dbname"
DB_USER="username"
DB_PASS="userpass"
```
#### firebaseAdminConfig.json
(acquire from Firebase Console)  
``` json
{
  "type": "service_account",
  "rest_of_the_config": "provided from Firebase",
  "universe_domain": "googleapis.com"
}
```

#### firebaseClientConfig.js
(acquire from Firebase Console)  
``` js
const firebaseClientConfig = {
  // config provided from Firebase
};

export default firebaseClientConfig;
```
