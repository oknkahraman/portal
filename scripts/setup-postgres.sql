-- =====================================================
-- IMALAT PORTAL - PostgreSQL Veritabani Kurulum Script
-- =====================================================
-- Bu script'i Contabo VPS'inizde calistirin
-- Oncelikle PostgreSQL'i kurun, sonra bu script'i calistirin

-- 1. Veritabani ve Kullanici Olustur
-- (Bu komutlari postgres kullanicisi olarak calistirin)

-- Eger veritabani varsa sil (dikkatli kullanin!)
-- DROP DATABASE IF EXISTS imalat_portal;
-- DROP USER IF EXISTS imalat_user;

-- Kullanici olustur
CREATE USER imalat_user WITH PASSWORD 'your_secure_password_here';

-- Veritabani olustur
CREATE DATABASE imalat_portal OWNER imalat_user;

-- Kullaniciya tum yetkiler ver
GRANT ALL PRIVILEGES ON DATABASE imalat_portal TO imalat_user;

-- Veritabanina baglan
\c imalat_portal;

-- UUID extension'i etkinlestir
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLO OLUSTURMA
-- =====================================================

-- Profiller (Kullanicilar)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tax_office TEXT NOT NULL,
  tax_number TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Talepler
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  request_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('talasli', 'kaynak', 'sac', '3d', 'komple', 'kaplama')),
  sub_category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'approved', 'rejected', 'completed', 'cancelled')),
  total_items INTEGER DEFAULT 0,
  project_description TEXT,
  delivery_to_address BOOLEAN DEFAULT false,
  delivery_address TEXT,
  requested_delivery_date DATE,
  files_cleaned BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Talep Parcalari
CREATE TABLE IF NOT EXISTS request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  material TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teklifler
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  delivery_date DATE NOT NULL,
  delivery_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teklif Kalemleri
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  request_item_id UUID REFERENCES request_items(id),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  notes TEXT
);

-- Mesajlar
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  request_item_id UUID REFERENCES request_items(id),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yorumlar
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_item_id UUID REFERENCES request_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tekrar Siparis Sablonlari
CREATE TABLE IF NOT EXISTS reorder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  original_request_id UUID REFERENCES requests(id),
  template_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dosya Temizlik Loglari
CREATE TABLE IF NOT EXISTS file_cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id),
  files_deleted JSONB,
  reason TEXT CHECK (reason IN ('rejected', 'inactive_1_year', 'manual')),
  cleaned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX'LER (Performans icin)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_last_activity ON requests(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_comments_item_id ON comments(request_item_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =====================================================
-- ADMIN KULLANICI OLUSTUR
-- =====================================================
-- Sifre: admin123 (bunu degistirin!)
-- NOT: Asagidaki hash bcrypt ile olusturulmustur

INSERT INTO profiles (id, email, password_hash, full_name, company_name, tax_office, tax_number, address, phone, role)
VALUES (
  gen_random_uuid(),
  'admin@imalat.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4oaSYuKgqZ/lrV8i', -- admin123
  'Sistem Yoneticisi',
  'Imalat Portal',
  'Merkez VD',
  '1234567890',
  'Merkez Ofis',
  '5551234567',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- TABLOLARA YETKI VER
-- =====================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO imalat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO imalat_user;

-- =====================================================
-- KURULUM TAMAMLANDI!
-- =====================================================

\echo 'Veritabani kurulumu basariyla tamamlandi!'
\echo 'Admin girisi: admin@imalat.com / admin123'
\echo 'ONEMLI: Admin sifresini hemen degistirin!'
