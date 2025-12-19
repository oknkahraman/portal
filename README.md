# 🏭 Endüstriyel İmalat Yönetim Portalı

B2B odaklı, teklif alma ve yönetme sistemi. Müşteriler imalat talepleri oluşturabilir, admin teklifler verebilir.

## 📋 Özellikler

### Müşteri Özellikleri
- ✅ B2B Kayıt sistemi (Şirket, Vergi bilgileri)
- ✅ 5 adımlı teklif talebi wizard'ı
- ✅ 6 farklı imalat kategorisi (Talaşlı, Kaynak, Sac, 3D, Komple, Kaplama)
- ✅ Çoklu parça ekleme
- ✅ 100 MB dosya yükleme limiti
- ✅ Teslimat seçenekleri (Adresime teslim / Fabrikadan al)
- ✅ Teklifler üzerinde onay/ret işlemi
- ✅ Mesajlaşma sistemi
- ✅ Parça bazlı yorum sistemi
- ✅ Tekrar sipariş özelliği (şablon kaydetme)

### Admin Özellikleri
- ✅ Tüm talepleri görüntüleme
- ✅ Müşteri fatura bilgilerini görme
- ✅ Parça bazlı fiyatlandırma
- ✅ Nakliye ücreti ekleme
- ✅ Teklif gönderme
- ✅ Mesajlaşma
- ✅ Parça yorumları
- ✅ Dashboard istatistikleri

## 🛠 Teknoloji Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Shadcn/UI
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **Auth:** JWT (bcrypt ile şifreleme)
- **File Storage:** Local filesystem
- **Validation:** Zod

## 📦 Contabo VPS Kurulumu

### Ön Gereksinimler
- Ubuntu 20.04+ veya Debian 11+
- Minimum 2GB RAM
- Node.js 18+
- PostgreSQL 14+

### Adım 1: Sistem Hazırlığı

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Node.js kur (Node 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Yarn kur
npm install -g yarn

# Git kur
sudo apt install -y git
```

### Adım 2: PostgreSQL Kurulumu

```bash
# PostgreSQL kur
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL servisini başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL versiyonunu kontrol et
psql --version
```

### Adım 3: Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Kullanıcı oluştur (şifreyi değiştirin!)
CREATE USER imalat_user WITH PASSWORD 'GucluBirSifre123!';

# Veritabanı oluştur
CREATE DATABASE imalat_portal OWNER imalat_user;

# Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE imalat_portal TO imalat_user;

# Çıkış
\q
```

### Adım 4: Tabloları Oluşturma

```bash
# Veritabanına bağlan
sudo -u postgres psql -d imalat_portal

# UUID extension'ı etkinleştir
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Tabloları oluştur (scripts/setup-postgres.sql dosyasındaki SQL'leri çalıştırın)
\i /app/scripts/setup-postgres.sql
```

### Adım 5: Proje Kurulumu

```bash
# Proje dizinine git
cd /var/www

# Projeyi klonla (veya dosyaları kopyala)
git clone <repo-url> imalat-portal
cd imalat-portal

# Bağımlılıkları kur
yarn install

# .env dosyasını oluştur
cp .env.example .env
nano .env
```

### Adım 6: Environment Variables

`.env` dosyasını düzenleyin:

```env
# PostgreSQL
DATABASE_URL=postgresql://imalat_user:GucluBirSifre123!@localhost:5432/imalat_portal

# JWT (güçlü bir secret oluşturun)
JWT_SECRET=cok-guclu-ve-uzun-bir-jwt-secret-key-buraya
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_DIR=/var/www/imalat-portal/uploads

# Application
NEXT_PUBLIC_BASE_URL=https://sizin-domain.com
CORS_ORIGINS=*
```

### Adım 7: Upload Dizini

```bash
mkdir -p /var/www/imalat-portal/uploads
chmod 755 /var/www/imalat-portal/uploads
```

### Adım 8: Build ve Çalıştırma

```bash
# Production build
yarn build

# Uygulamayı başlat
yarn start
```

### Adım 9: PM2 ile Sürekli Çalıştırma

```bash
# PM2 kur
npm install -g pm2

# Uygulamayı PM2 ile başlat
pm2 start yarn --name "imalat-portal" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

### Adım 10: Nginx Reverse Proxy (Opsiyonel)

```bash
sudo apt install -y nginx

# Nginx konfigürasyonu
sudo nano /etc/nginx/sites-available/imalat-portal
```

```nginx
server {
    listen 80;
    server_name sizin-domain.com;

    client_max_body_size 110M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Siteyi aktifleştir
sudo ln -s /etc/nginx/sites-available/imalat-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Adım 11: SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sizin-domain.com
```

## 👤 Admin Girişi

Varsayılan admin hesabı:
- **Email:** admin@imalat.com
- **Şifre:** admin123

⚠️ **ÖNEMLİ:** İlk girişten sonra admin şifresini değiştirin!

## 📁 Proje Yapısı

```
/app
├── app/
│   ├── api/[[...path]]/route.js  # Tüm API endpoint'leri
│   ├── page.js                    # Ana sayfa (React)
│   ├── layout.js                  # Layout ve Auth Context
│   └── globals.css               # Global stiller
├── lib/
│   ├── db.js                     # PostgreSQL bağlantısı
│   ├── auth.js                   # JWT authentication
│   ├── validations.js            # Zod şemaları
│   └── init-db.js                # Veritabanı başlatma
├── components/ui/                # Shadcn/UI componentleri
├── scripts/
│   ├── setup-postgres.sql        # PostgreSQL kurulum SQL
│   └── install-postgres.sh       # Otomatik kurulum scripti
├── uploads/                      # Yüklenen dosyalar
├── .env                          # Environment variables
├── package.json
└── README.md
```

## 🔒 Güvenlik Notları

1. **JWT_SECRET:** Güçlü ve benzersiz bir secret kullanın
2. **Admin Şifresi:** Varsayılan şifreyi hemen değiştirin
3. **PostgreSQL:** Uzaktan erişimi kapatın veya güvenli hale getirin
4. **SSL:** Production'da mutlaka HTTPS kullanın
5. **Dosya Yükleme:** Sadece izin verilen formatlar kabul edilir

## 📊 API Endpoint'leri

### Auth
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi
- `PUT /api/auth/profile` - Profil güncelleme

### Requests (Talepler)
- `GET /api/requests` - Talepleri listele
- `POST /api/requests` - Yeni talep oluştur
- `GET /api/requests/:id` - Talep detayı
- `PUT /api/requests/:id/status` - Durum güncelle

### Quotes (Teklifler)
- `POST /api/quotes` - Yeni teklif oluştur (Admin)
- `POST /api/quotes/:id/respond` - Teklifi onayla/reddet

### Messages
- `POST /api/messages` - Mesaj gönder

### Comments
- `POST /api/comments` - Yorum ekle

### Templates
- `GET /api/templates` - Şablonları listele
- `DELETE /api/templates/:id` - Şablon sil

### Files
- `POST /api/upload` - Dosya yükle
- `GET /api/files/:filename` - Dosya indir

### Admin
- `GET /api/admin/stats` - Dashboard istatistikleri

## 🔄 Dosya Saklama Politikası

- **Aktif talepler:** Süresiz saklanır
- **Reddedilen talepler:** 7 gün sonra dosyalar silinir
- **1 yıl inaktif talepler:** Dosyalar otomatik silinir
- **Tamamlanan siparişler:** 1 yıl sonra silinir

## 🐛 Sorun Giderme

### PostgreSQL bağlantı hatası
```bash
# PostgreSQL servisini kontrol et
sudo systemctl status postgresql

# Logları kontrol et
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Node.js bellek hatası
```bash
# NODE_OPTIONS ile bellek limitini artır
export NODE_OPTIONS="--max-old-space-size=2048"
yarn build
```

### Dosya yükleme hatası
```bash
# Upload dizini izinlerini kontrol et
ls -la /var/www/imalat-portal/uploads
chmod 755 /var/www/imalat-portal/uploads
```

## 📞 Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
