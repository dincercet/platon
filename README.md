## Fully Responsive Eğitim Merkezi Yönetim ve Tanıtım Sistemi  
  
Admin panelinden eğitim merkezinize sınıflar ekleyin, bu sınıflara öğrencileri atayın.  
Öğrencileriniz e-posta ile gönderilen davet linki ile kayıt olur ve öğrenci panelinden dönem bilgilerini görmekle birlikte paylaşılan dosyaları indirebilir.  
Müfredatlar yaratın ve hafta hafta işlediğiniz konuları belirtin.  
Dönemler oluşturun ve hangi sınıfın ne zaman başlayıp bittiğini, hangi müfredatı içerdiğini misafirlerin de görebileceği şekilde sunun.  
  
### *You should produce your own config files:*  
#### Create .env 
``` sh
# Prisma connection ("mysqlcontainer" is a db container defined in Docker's compose.yaml file)
DATABASE_URL="mysql://root:userpass@mysqlcontainer:3306/dbname?schema=public"

# Docker environment variables needed to create containers within compose.yaml file.
DB_NAME="dbname"
DB_USER="root"
DB_PASS="userpass"
```
#### Create firebaseAdminConfig.json 
``` json
{
  "type": "service_account",
  "universe_domain": "googleapis.com",
  "all_the_config": "...provided from Firebase Console",
}
```

#### Create firebaseClientConfig.js
``` js
const firebaseClientConfig = {
  apiKey: "AIxxxxxxxxSyC7mxxxxxxxxqfFEf5xxxxxxxBMCw",
  authDomain: "xxxxx.firebaseapp.com",
  // ...all the config provided from Firebase Console
};

export default firebaseClientConfig;
```
