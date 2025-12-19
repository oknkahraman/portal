#!/bin/bash

# =====================================================
# IMALAT PORTAL - Contabo VPS PostgreSQL Kurulum Script
# =====================================================
# Bu script'i root olarak calistirin: sudo bash install-postgres.sh

set -e

echo "==========================================="
echo "Imalat Portal - PostgreSQL Kurulumu"
echo "==========================================="

# Sistem guncelle
echo "[1/6] Sistem guncelleniyor..."
apt update && apt upgrade -y

# PostgreSQL kur
echo "[2/6] PostgreSQL kuruluyor..."
apt install -y postgresql postgresql-contrib

# PostgreSQL servisini baslat
echo "[3/6] PostgreSQL servisi baslatiliyor..."
systemctl start postgresql
systemctl enable postgresql

# PostgreSQL versiyonunu kontrol et
psql --version

echo "[4/6] Veritabani ve kullanici olusturuluyor..."

# Kullanici sifresi sor
read -p "Veritabani sifresi girin: " DB_PASSWORD

# SQL script'ini guncelle
sed -i "s/your_secure_password_here/$DB_PASSWORD/g" /app/scripts/setup-postgres.sql

# Veritabani olustur
sudo -u postgres psql -f /app/scripts/setup-postgres.sql

echo "[5/6] .env dosyasi guncelleniyor..."

# .env dosyasini guncelle
cat > /app/.env << EOF
# PostgreSQL Configuration
DATABASE_URL=postgresql://imalat_user:$DB_PASSWORD@localhost:5432/imalat_portal

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_DIR=/app/uploads

# Application URL (bunu kendi domaininizle degistirin)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
EOF

echo "[6/6] Upload dizini olusturuluyor..."
mkdir -p /app/uploads
chmod 755 /app/uploads

echo ""
echo "==========================================="
echo "KURULUM TAMAMLANDI!"
echo "==========================================="
echo ""
echo "PostgreSQL Bilgileri:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: imalat_portal"
echo "  User: imalat_user"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Admin Giris Bilgileri:"
echo "  Email: admin@imalat.com"
echo "  Sifre: admin123 (HEMEN DEGISTIRIN!)"
echo ""
echo "Uygulamayi baslatmak icin:"
echo "  cd /app && yarn install && yarn build && yarn start"
echo ""
