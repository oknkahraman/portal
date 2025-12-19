import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Ad Soyad en az 3 karakter olmali'),
  company_name: z.string().min(2, 'Sirket unvani gerekli'),
  tax_office: z.string().min(2, 'Vergi dairesi gerekli'),
  tax_number: z.string().min(10, 'Vergi numarasi veya TCKN 10-11 haneli olmali').max(11),
  address: z.string().min(10, 'Acik adres en az 10 karakter olmali'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Gecerli bir telefon numarasi girin'),
  email: z.string().email('Gecerli bir email adresi girin'),
  password: z.string().min(8, 'Sifre en az 8 karakter olmali'),
});

export const loginSchema = z.object({
  email: z.string().email('Gecerli bir email adresi girin'),
  password: z.string().min(1, 'Sifre gerekli'),
});

export const requestItemSchema = z.object({
  item_name: z.string().min(2, 'Parca ismi en az 2 karakter olmali'),
  material: z.string().min(2, 'Malzeme bilgisi gerekli'),
  quantity: z.number().min(1, 'Adet en az 1 olmali'),
  notes: z.string().optional(),
});

export const requestSchema = z.object({
  category: z.enum(['talasli', 'kaynak', 'sac', '3d', 'komple', 'kaplama']),
  sub_category: z.string().optional(),
  project_description: z.string().optional(),
  delivery_to_address: z.boolean().default(false),
  delivery_address: z.string().optional(),
});

export const quoteSchema = z.object({
  total_price: z.number().positive('Fiyat pozitif olmali'),
  delivery_date: z.string(),
  delivery_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const messageSchema = z.object({
  message: z.string().min(1, 'Mesaj bos olamaz').max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
  request_item_id: z.string().uuid().optional(),
});

export const commentSchema = z.object({
  comment: z.string().min(1, 'Yorum bos olamaz').max(1000, 'Yorum en fazla 1000 karakter olabilir'),
});

export const CATEGORIES = {
  talasli: {
    name: 'Talasli Imalat',
    subCategories: [
      { value: 'cnc_torna', label: 'CNC Torna' },
      { value: 'dik_islem', label: 'Dik Islem (Freze)' },
      { value: 'borwerk', label: 'Borwerk' },
      { value: 'oneriye_acik', label: 'Emin Degilim / Teknik Resme Gore Belirlensin' },
    ],
  },
  kaynak: {
    name: 'Kaynakli Imalat',
    subCategories: [
      { value: 'mig_mag', label: 'Gazalti Kaynagi (MIG/MAG)' },
      { value: 'tig_argon', label: 'TIG/Argon Kaynagi' },
      { value: 'elektrot', label: 'Elektrot Kaynagi' },
      { value: 'lazer', label: 'Lazer Kaynak' },
      { value: 'robot', label: 'Robot Kaynagi' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim / Teknik Resme Gore Belirlensin' },
    ],
  },
  sac: {
    name: 'Sac Isleme (Lazer/Bukum)',
    subCategories: [
      { value: 'lazer_kesim', label: 'Lazer Kesim' },
      { value: 'cnc_abkant', label: 'CNC Abkant (Bukum)' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
  '3d': {
    name: 'Eklemeli Imalat (3D Baski)',
    subCategories: [
      { value: 'pla_abs', label: 'PLA/ABS (Hobi/Prototip)' },
      { value: 'petg_nylon', label: 'PETG/Nylon (Fonksiyonel Parca)' },
      { value: 'metal', label: 'Metal (SLS/DMLS)' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
  komple: {
    name: 'Komple Proje (Montajli)',
    subCategories: [],
  },
  kaplama: {
    name: 'Kaplama/Boya',
    subCategories: [
      { value: 'galvaniz', label: 'Galvaniz Kaplama' },
      { value: 'elektrolitik', label: 'Elektrolitik Kaplama' },
      { value: 'toz_boya', label: 'Toz Boya' },
      { value: 'sivi_boya', label: 'Sivi Boya' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
};

export const MATERIALS = [
  'ST37', 'ST52', '304L', '316L', 'Aluminyum 6061', 'Aluminyum 7075', 
  'Pirinc', 'Bakir', 'Bronz', 'Paslanmaz Celik', 'Dokme Demir',
  'C45', '42CrMo4', '16MnCr5', 'Titanyum', 'Nikel Alasim'
];

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/octet-stream', // for .step, .stp, .dxf
];

export const ALLOWED_EXTENSIONS = ['.step', '.stp', '.dxf', '.pdf', '.rar', '.zip'];
