'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// ScrollArea iptal edildi
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User, 
  LogOut, 
  Settings, 
  Truck, 
  Package,
  ChevronRight,
  ChevronLeft,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  Bell,
  Menu,
  X,
  Building2,
  FileCheck,
  Layers,
  Calendar,
  DollarSign,
  BarChart3,
  Inbox,
  CheckSquare,
  XSquare,
  Award,
  ShoppingCart,
  Factory,
  ClipboardCheck,
  PackageCheck,
  Download,
  FileDown
} from 'lucide-react';

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_4c42cef6-e9b3-41e4-a1e3-e1e53a26a709/artifacts/89h3a84e_ANES%20%281%29.png';

// Sipariş Aşamaları
const ORDER_STAGES = {
  hammadde: {
    label: 'Hammadde Alımı',
    icon: ShoppingCart,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300'
  },
  imalat: {
    label: 'İmalat Devam Ediyor',
    icon: Factory,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  kalite_kontrol: {
    label: 'Kalite Kontrol',
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  sevkiyat: {
    label: 'Sevkiyat Sürecinde',
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300'
  },
  teslim_edildi: {
    label: 'Teslim Edildi',
    icon: PackageCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300'
  }
};

const ORDER_STAGE_LIST = ['hammadde', 'imalat', 'kalite_kontrol', 'sevkiyat', 'teslim_edildi'];

// Categories
const CATEGORIES = {
  talasli: {
    name: 'Talaşlı İmalat',
    icon: '🔧',
    color: 'from-blue-500 to-blue-600',
    subCategories: [
      { value: 'cnc_torna', label: 'CNC Torna' },
      { value: 'dik_islem', label: 'Dik İşlem (Freze)' },
      { value: 'borwerk', label: 'Borwerk' },
      { value: 'oneriye_acik', label: 'Emin Değilim / Teknik Resme Göre Belirlensin' },
    ],
  },
  kaynak: {
    name: 'Kaynaklı İmalat',
    icon: '⚡',
    color: 'from-orange-500 to-orange-600',
    subCategories: [
      { value: 'mig_mag', label: 'Gazaltı Kaynağı (MIG/MAG)' },
      { value: 'tig_argon', label: 'TIG/Argon Kaynağı' },
      { value: 'elektrot', label: 'Elektrot Kaynağı' },
      { value: 'lazer', label: 'Lazer Kaynak' },
      { value: 'robot', label: 'Robot Kaynağı' },
      { value: 'oneriye_acik', label: 'Öneriye Açığım / Teknik Resme Göre Belirlensin' },
    ],
  },
  sac: {
    name: 'Sac İşleme (Lazer/Büküm)',
    icon: '📐',
    color: 'from-green-500 to-green-600',
    subCategories: [
      { value: 'lazer_kesim', label: 'Lazer Kesim' },
      { value: 'cnc_abkant', label: 'CNC Abkant (Büküm)' },
      { value: 'oneriye_acik', label: 'Öneriye Açığım' },
    ],
  },
  '3d': {
    name: 'Eklemeli İmalat (3D Baskı)',
    icon: '🖨️',
    color: 'from-purple-500 to-purple-600',
    subCategories: [
      { value: 'pla_abs', label: 'PLA/ABS (Hobi/Prototip)' },
      { value: 'petg_nylon', label: 'PETG/Nylon (Fonksiyonel Parça)' },
      { value: 'metal', label: 'Metal (SLS/DMLS)' },
      { value: 'oneriye_acik', label: 'Öneriye Açığım' },
    ],
  },
  komple: {
    name: 'Komple Proje (Montajlı)',
    icon: '🏭',
    color: 'from-indigo-500 to-indigo-600',
    subCategories: [],
  },
  kaplama: {
    name: 'Kaplama/Boya',
    icon: '🎨',
    color: 'from-pink-500 to-pink-600',
    subCategories: [
      { value: 'galvaniz', label: 'Galvaniz Kaplama' },
      { value: 'elektrolitik', label: 'Elektrolitik Kaplama' },
      { value: 'toz_boya', label: 'Toz Boya' },
      { value: 'sivi_boya', label: 'Sıvı Boya' },
      { value: 'oneriye_acik', label: 'Öneriye Açığım' },
    ],
  },
};

const MATERIALS = [
  'ST37', 'ST52', '304L', '316L', 'Alüminyum 6061', 'Alüminyum 7075', 
  'Pirinç', 'Bakır', 'Bronz', 'Paslanmaz Çelik', 'Dökme Demir',
  'C45', '42CrMo4', '16MnCr5', 'Titanyum', 'Nikel Alaşım'
];

const STATUS_COLORS = {
  pending: 'bg-amber-500',
  quoted: 'bg-blue-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-gray-500',
};

const STATUS_LABELS = {
  pending: 'Teklif Bekliyor',
  quoted: 'Teklif Geldi',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

// API helper
async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`/api${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Bir hata oluştu');
  }
  
  return data;
}

// Login/Register Component
function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    tax_office: '',
    tax_number: '',
    address: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const data = await api(endpoint, { method: 'POST', body });
      toast.success(isLogin ? 'Giriş başarılı!' : 'Kayıt başarılı!');
      onSuccess(data.token, data.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img src={LOGO_URL} alt="MANES Logo" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            İmalat Yönetim Portalı
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ad Soyad</Label>
                  <Input 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    minLength={3}
                    className="h-11"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Şirket Ünvanı</Label>
                  <Input 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                    className="h-11"
                    placeholder="ABC Makina Ltd. Şti."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vergi Dairesi</Label>
                    <Input 
                      value={formData.tax_office}
                      onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                      required
                      className="h-11"
                      placeholder="Ankara VD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vergi No / TCKN</Label>
                    <Input 
                      value={formData.tax_number}
                      onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                      required
                      minLength={10}
                      maxLength={11}
                      className="h-11"
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Adres</Label>
                  <Textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    minLength={10}
                    placeholder="Açık adresinizi yazın..."
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Telefon</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="5321234567"
                    required
                    className="h-11"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="h-11"
                placeholder="ornek@sirket.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Şifre</Label>
              <Input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
                className="h-11"
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-300" 
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button 
              type="button"
              className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Request Wizard Component - SCROLLAREA KALDIRILDI
function RequestWizard({ onClose, onSuccess, template }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: template?.category || '',
    sub_category: template?.sub_category || '',
    items: template?.items ? JSON.parse(template.items) : [],
    project_description: '',
    delivery_to_address: false,
    delivery_address: '',
    use_profile_address: true,
    save_as_template: false,
    template_name: '',
    requested_delivery_date: '',
  });
  const [currentItem, setCurrentItem] = useState({
    item_name: '',
    material: '',
    quantity: 1,
    notes: '',
    file: null,
    file_url: '',
    file_name: '',
    file_size: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isKompleProje = formData.category === 'komple';
  const totalSteps = isKompleProje ? 4 : 5;

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (file.size > 104857600) {
      toast.error('Dosya boyutu 100 MB\'ı aşamaz');
      return;
    }

    const allowedExtensions = ['.step', '.stp', '.dxf', '.pdf', '.rar', '.zip'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      toast.error('Geçersiz dosya formatı');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const data = await api('/upload', { method: 'POST', body: formDataUpload });
      setCurrentItem({
        ...currentItem,
        file: file,
        file_url: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
      });
      toast.success('Dosya yüklendi');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const addItem = () => {
    if (!currentItem.item_name || !currentItem.material || !currentItem.file_url) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem, id: Date.now() }],
    });
    setCurrentItem({
      item_name: '',
      material: '',
      quantity: 1,
      notes: '',
      file: null,
      file_url: '',
      file_name: '',
      file_size: 0,
    });
    toast.success('Parça eklendi');
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const requestData = {
        category: formData.category,
        sub_category: formData.sub_category,
        project_description: formData.project_description,
        delivery_to_address: formData.delivery_to_address,
        delivery_address: formData.delivery_to_address 
          ? (formData.use_profile_address ? user.address : formData.delivery_address)
          : null,
        items: formData.items,
        save_as_template: formData.save_as_template,
        template_name: formData.template_name,
        requested_delivery_date: formData.requested_delivery_date,
      };

      const data = await api('/requests', { method: 'POST', body: requestData });
      toast.success(`Talebiniz oluşturuldu: ${data.request_number}`);
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.category !== '';
      case 2:
        if (isKompleProje) {
          return formData.project_description.length >= 50 && formData.items.length > 0;
        }
        return formData.sub_category !== '' || CATEGORIES[formData.category]?.subCategories.length === 0;
      case 3:
        if (isKompleProje) {
          return true;
        }
        return formData.items.length > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">İmalat Kategorisi Seçin</h3>
              <p className="text-slate-500 mt-1">Projeniz için uygun kategoriyi seçin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <div
                  key={key}
                  onClick={() => setFormData({...formData, category: key, sub_category: ''})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.category === key 
                      ? 'border-slate-800 bg-slate-50 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-400 hover:shadow'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        if (isKompleProje) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">Proje Detayları</h3>
                <p className="text-slate-500 mt-1">Projenizi detaylı olarak açıklayın</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Proje Açıklaması (min 50 karakter)</Label>
                <Textarea
                  value={formData.project_description}
                  onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                  rows={4}
                  placeholder="Projenizi detaylı olarak açıklayınız..."
                  className="resize-none"
                />
                <p className={`text-sm ${formData.project_description.length >= 50 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {formData.project_description.length}/50 karakter
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Proje Dosyaları</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="project-file"
                    accept=".step,.stp,.dxf,.pdf,.rar,.zip"
                  />
                  <label htmlFor="project-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="mt-2 font-medium text-slate-600">Dosya yüklemek için tıklayın</p>
                    <p className="text-sm text-slate-400">Max 100 MB - .step, .stp, .dxf, .pdf, .rar, .zip</p>
                  </label>
                </div>
                {currentItem.file_name && (
                  <div className="mt-2 p-3 bg-slate-100 rounded-lg flex items-center justify-between">
                    <span className="text-slate-700">{currentItem.file_name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          items: [...formData.items, { ...currentItem, id: Date.now(), item_name: 'Proje Dosyası', material: 'N/A', quantity: 1 }],
                        });
                        setCurrentItem({ ...currentItem, file: null, file_url: '', file_name: '', file_size: 0 });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ekle
                    </Button>
                  </div>
                )}
                {formData.items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Yüklenen Dosyalar:</Label>
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                        <span className="text-emerald-700">{item.file_name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        const category = CATEGORIES[formData.category];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">Yöntem Seçin</h3>
              <p className="text-slate-500 mt-1">{category?.name} için uygun yöntemi seçin</p>
            </div>
            <div className="space-y-3">
              {category?.subCategories.map((sub) => (
                <div
                  key={sub.value}
                  onClick={() => setFormData({...formData, sub_category: sub.value})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.sub_category === sub.value 
                      ? 'border-slate-800 bg-slate-50 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className="font-medium text-slate-700">{sub.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        if (isKompleProje) {
          return renderDeliveryStep();
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">Parça Ekle</h3>
              <p className="text-slate-500 mt-1">İmalat yapılacak parçaları ekleyin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parça İsmi *</Label>
                <Input
                  value={currentItem.item_name}
                  onChange={(e) => setCurrentItem({...currentItem, item_name: e.target.value})}
                  placeholder="Örnek: Mil, Flanş, Kapak"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Malzeme *</Label>
                <Select
                  value={currentItem.material}
                  onValueChange={(value) => setCurrentItem({...currentItem, material: value})}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Malzeme seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map((mat) => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="mt-2 h-11"
                  value={currentItem.material}
                  onChange={(e) => setCurrentItem({...currentItem, material: e.target.value})}
                  placeholder="veya manuel girin"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Adet *</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Teknik Dosya *</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="item-file"
                    accept=".step,.stp,.dxf,.pdf,.rar,.zip"
                    disabled={uploading}
                  />
                  <label htmlFor="item-file" className="cursor-pointer">
                    {uploading ? (
                      <span className="text-slate-500">Yükleniyor...</span>
                    ) : currentItem.file_name ? (
                      <span className="text-emerald-600 font-medium">{currentItem.file_name}</span>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-sm text-slate-500">Dosya yükle (max 100MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ek Notlar</Label>
              <Textarea
                value={currentItem.notes}
                onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                placeholder="Tolerans, yüzey işlem vb. bilgiler..."
                className="resize-none"
                rows={2}
              />
            </div>
            <Button onClick={addItem} disabled={uploading} className="w-full h-11">
              <Plus className="w-4 h-4 mr-2" /> Parça Ekle
            </Button>

            {formData.items.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-3">Eklenen Parçalar ({formData.items.length})</h4>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">{item.item_name}</span>
                        <span className="text-slate-500 ml-2 text-sm">
                          {item.material} - {item.quantity} Adet
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        if (isKompleProje) {
          return renderSummaryStep();
        }
        return renderDeliveryStep();

      case 5:
        return renderSummaryStep();

      default:
        return null;
    }
  };

  const renderDeliveryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Teslimat Seçenekleri</h3>
        <p className="text-slate-500 mt-1">Teslimat ve termin tercihlerinizi belirtin</p>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-amber-600" />
          <Label className="text-sm font-semibold text-amber-800">İstenen Termin Tarihi</Label>
        </div>
        <Input
          type="date"
          value={formData.requested_delivery_date}
          onChange={(e) => setFormData({...formData, requested_delivery_date: e.target.value})}
          className="h-11"
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-amber-600 mt-2">
          Bu tarih talebinizdir, kesin termin teklif aşamasında belirlenir.
        </p>
      </div>
      
      <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200">
        <Checkbox
          id="delivery"
          checked={formData.delivery_to_address}
          onCheckedChange={(checked) => setFormData({...formData, delivery_to_address: checked})}
        />
        <Label htmlFor="delivery" className="cursor-pointer font-medium">
          <Truck className="w-5 h-5 inline mr-2 text-slate-600" />
          Adresime teslim edilsin
        </Label>
      </div>
      
      {formData.delivery_to_address && (
        <div className="space-y-4 pl-4 border-l-4 border-slate-800 ml-2">
          <RadioGroup
            value={formData.use_profile_address ? 'profile' : 'custom'}
            onValueChange={(value) => setFormData({...formData, use_profile_address: value === 'profile'})}
            className="space-y-3"
          >
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.use_profile_address ? 'border-slate-800 bg-slate-50' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="profile" id="profile-addr" />
                <Label htmlFor="profile-addr" className="cursor-pointer flex-1">
                  <span className="font-medium">Fatura adresime teslim et</span>
                  <p className="text-sm text-slate-500 mt-1">{user?.address}</p>
                </Label>
              </div>
            </div>
            <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!formData.use_profile_address ? 'border-slate-800 bg-slate-50' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom-addr" />
                <Label htmlFor="custom-addr" className="cursor-pointer font-medium">Farklı bir adrese teslim et</Label>
              </div>
            </div>
          </RadioGroup>
          
          {!formData.use_profile_address && (
            <Textarea
              value={formData.delivery_address}
              onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
              placeholder="Teslimat adresi..."
              className="resize-none"
              rows={2}
            />
          )}
          
          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Adresinize teslim seçeneğini işaretlerseniz, nakliye maliyeti teklife dahil edilecektir.
            </p>
          </div>
        </div>
      )}
      
      {!formData.delivery_to_address && (
        <div className="p-4 bg-slate-100 rounded-xl">
          <p className="text-slate-600">Parçaları fabrikadan kendiniz alacaksınız.</p>
        </div>
      )}
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Özet ve Onayla</h3>
        <p className="text-slate-500 mt-1">Bilgilerinizi kontrol edin ve gönderin</p>
      </div>
      
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Fatura Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-slate-500">Şirket:</span> <span className="font-medium">{user?.company_name}</span></p>
          <p><span className="text-slate-500">Vergi Dairesi:</span> <span className="font-medium">{user?.tax_office}</span></p>
          <p><span className="text-slate-500">Vergi No:</span> <span className="font-medium">{user?.tax_number}</span></p>
          <p><span className="text-slate-500">Telefon:</span> <span className="font-medium">{user?.phone}</span></p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4" /> Talep Detayları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-slate-500">Kategori:</span> <span className="font-medium">{CATEGORIES[formData.category]?.name}</span></p>
          {formData.sub_category && (
            <p><span className="text-slate-500">Yöntem:</span> <span className="font-medium">{CATEGORIES[formData.category]?.subCategories.find(s => s.value === formData.sub_category)?.label}</span></p>
          )}
          <p><span className="text-slate-500">Toplam Parça:</span> <span className="font-medium">{formData.items.length}</span></p>
          {formData.requested_delivery_date && (
            <p><span className="text-slate-500">İstenen Termin:</span> <span className="font-medium text-amber-600">{new Date(formData.requested_delivery_date).toLocaleDateString('tr-TR')}</span></p>
          )}
        </CardContent>
      </Card>

      {formData.items.length > 0 && !isKompleProje && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parçalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded text-sm">
                  {item.item_name} - {item.material} - {item.quantity} Adet
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4" /> Teslimat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {formData.delivery_to_address ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-medium">Adresime teslim edilsin</p>
                <p className="text-slate-500">
                  {formData.use_profile_address ? user?.address : formData.delivery_address}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600">
              <XCircle className="w-5 h-5" />
              <p>Fabrikadan kendim alacağım</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200">
        <Checkbox
          id="save-template"
          checked={formData.save_as_template}
          onCheckedChange={(checked) => setFormData({...formData, save_as_template: checked})}
        />
        <Label htmlFor="save-template" className="cursor-pointer">Bu talebi şablon olarak kaydet</Label>
      </div>
      
      {formData.save_as_template && (
        <Input
          value={formData.template_name}
          onChange={(e) => setFormData({...formData, template_name: e.target.value})}
          placeholder="Şablon adı (örnek: Mil Parçası - Aylık Sipariş)"
          className="h-11"
        />
      )}
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* BURADA overflow-y-auto KULLANILDI VE FLEX-COL İLE YERLEŞİM DÜZENLENDİ */}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5" />
            Yeni Teklif Talebi
          </DialogTitle>
          <DialogDescription>
            Adım {step} / {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 flex-shrink-0 mt-2">
          <div 
            className="bg-gradient-to-r from-slate-700 to-slate-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* İÇERİK KISMI - ScrollArea YERİNE NORMAL DIV KULLANILDI */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {renderStep()}
        </div>

        <DialogFooter className="gap-2 border-t pt-4 flex-shrink-0">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Geri
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-slate-800 hover:bg-slate-700">
              İleri <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Request Detail Component - SCROLLAREA KALDIRILDI
function RequestDetail({ requestId, onClose, onUpdate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newComment, setNewComment] = useState({});
  const [quoteForm, setQuoteForm] = useState({
    items: [],
    delivery_cost: 0,
    delivery_date: '',
    notes: '',
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    try {
      const result = await api(`/requests/${requestId}`);
      setData(result);
      
      if (result.items && result.items.length > 0) {
        setQuoteForm({
          ...quoteForm,
          items: result.items.map(item => ({
            request_item_id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: '',
            total_price: 0,
            notes: '',
          })),
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await api('/messages', {
        method: 'POST',
        body: { request_id: requestId, message: newMessage },
      });
      setNewMessage('');
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const addComment = async (itemId) => {
    if (!newComment[itemId]?.trim()) return;
    try {
      await api('/comments', {
        method: 'POST',
        body: { request_item_id: itemId, comment: newComment[itemId] },
      });
      setNewComment({ ...newComment, [itemId]: '' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submitQuote = async () => {
    const totalPrice = quoteForm.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) + (parseFloat(quoteForm.delivery_cost) || 0);
    
    if (!quoteForm.delivery_date) {
      toast.error('Termin tarihi seçin');
      return;
    }

    if (totalPrice <= 0) {
      toast.error('Lütfen en az bir parça için fiyat girin');
      return;
    }
    
    setSubmittingQuote(true);
    try {
      await api('/quotes', {
        method: 'POST',
        body: {
          request_id: requestId,
          total_price: totalPrice,
          delivery_date: quoteForm.delivery_date,
          delivery_cost: parseFloat(quoteForm.delivery_cost) || 0,
          notes: quoteForm.notes,
          items: quoteForm.items.map(item => ({
            request_item_id: item.request_item_id,
            unit_price: parseFloat(item.unit_price) || 0,
            total_price: parseFloat(item.total_price) || 0,
            notes: item.notes,
          })),
        },
      });
      toast.success('Teklif gönderildi');
      loadData();
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingQuote(false);
    }
  };

  const respondToQuote = async (accept) => {
    try {
      await api(`/quotes/${data.quote.id}/respond`, {
        method: 'POST',
        body: { accept },
      });
      toast.success(accept ? 'Teklif onaylandı' : 'Teklif reddedildi');
      loadData();
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateItemPrice = (index, unitPrice) => {
    const items = [...quoteForm.items];
    items[index].unit_price = unitPrice;
    items[index].total_price = (parseFloat(unitPrice) || 0) * items[index].quantity;
    setQuoteForm({ ...quoteForm, items });
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { request, items, quote, messages, quality_documents } = data;
  const isAdmin = user?.role === 'admin';
  const canQuote = isAdmin && request.status === 'pending';
  const canRespond = !isAdmin && quote && quote.status === 'sent';
  const isApproved = request.status === 'approved' || request.status === 'completed';

  // Sipariş aşaması güncelleme (Admin)
  const updateOrderStage = async (stage) => {
    try {
      await api(`/requests/${requestId}/stage`, {
        method: 'PUT',
        body: { stage },
      });
      toast.success('Sipariş aşaması güncellendi');
      loadData();
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Kalite kontrol evrakı yükleme (Admin)
  const uploadQualityDoc = async (file, itemId = null) => {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Sadece PDF dosyaları yüklenebilir');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('request_id', requestId);
    if (itemId) {
      formDataUpload.append('request_item_id', itemId);
    }

    try {
      await api('/quality-documents', { method: 'POST', body: formDataUpload });
      toast.success('Kalite kontrol evrakı yüklendi');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Kalite kontrol evrakı silme (Admin)
  const deleteQualityDoc = async (docId) => {
    if (!confirm('Bu evrakı silmek istediğinizden emin misiniz?')) return;
    try {
      await api(`/quality-documents/${docId}`, { method: 'DELETE' });
      toast.success('Evrak silindi');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Sipariş Takip Komponenti
  const OrderTracker = () => {
    const currentStageIndex = ORDER_STAGE_LIST.indexOf(request.order_stage);
    
    return (
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-800">
            <Package className="w-5 h-5" /> Sipariş Durumu Takibi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-start md:items-center">
            {ORDER_STAGE_LIST.map((stage, index) => {
              const stageInfo = ORDER_STAGES[stage];
              const StageIcon = stageInfo.icon;
              const isActive = request.order_stage === stage;
              const isCompleted = currentStageIndex > index || (currentStageIndex === index && stage === 'teslim_edildi');
              const isPending = currentStageIndex < index;
              
              return (
                <div key={stage} className="flex items-center w-full md:w-auto">
                  <div className={`flex flex-col items-center ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => isAdmin && isApproved && updateOrderStage(stage)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive ? `${stageInfo.bgColor} ${stageInfo.borderColor} ${stageInfo.color} ring-4 ring-offset-2 ring-${stageInfo.color.replace('text-', '')}` : ''}
                      ${isCompleted && !isActive ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : ''}
                      ${isPending ? 'bg-slate-100 border-slate-300 text-slate-400' : ''}
                    `}>
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <StageIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center font-medium max-w-[80px]
                      ${isActive ? stageInfo.color : ''}
                      ${isCompleted && !isActive ? 'text-emerald-600' : ''}
                      ${isPending ? 'text-slate-400' : ''}
                    `}>
                      {stageInfo.label}
                    </span>
                  </div>
                  {index < ORDER_STAGE_LIST.length - 1 && (
                    <div className={`hidden md:block flex-1 h-1 mx-2 rounded ${
                      currentStageIndex > index ? 'bg-emerald-400' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {isAdmin && isApproved && (
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <Label className="text-sm font-medium text-indigo-800">Aşama Değiştir:</Label>
              <Select value={request.order_stage || ''} onValueChange={updateOrderStage}>
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue placeholder="Aşama seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STAGE_LIST.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {ORDER_STAGES[stage].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Kalite Kontrol Evrakları Komponenti
  const QualityDocuments = ({ itemId = null, documents = [] }) => {
    const docs = itemId 
      ? items.find(i => i.id === itemId)?.quality_documents || []
      : quality_documents || [];

    return (
      <div className="space-y-3">
        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800 text-sm">{doc.file_name}</p>
                    <p className="text-xs text-emerald-600">Yükleyen: {doc.uploaded_by_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    download
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {isAdmin && (
                    <button 
                      onClick={() => deleteQualityDoc(doc.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isAdmin && (request.status === 'approved' || request.status === 'completed') && (
          <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors bg-emerald-50/50">
            <input
              type="file"
              onChange={(e) => uploadQualityDoc(e.target.files[0], itemId)}
              className="hidden"
              id={`qc-file-${itemId || 'general'}`}
              accept=".pdf"
            />
            <label htmlFor={`qc-file-${itemId || 'general'}`} className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 mt-2">Kalite Kontrol Evrakı Yükle</p>
              <p className="text-xs text-emerald-500">Sadece PDF (max 50MB)</p>
            </label>
          </div>
        )}
        
        {docs.length === 0 && !isAdmin && (
          <p className="text-sm text-slate-500 text-center py-4">Henüz kalite kontrol evrakı yüklenmemiş</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* BURADA overflow-y-auto KULLANILDI VE FLEX-COL İLE YERLEŞİM DÜZENLENDİ */}
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Talep #{request.request_number}
            <Badge className={`${STATUS_COLORS[request.status]} text-white`}>
              {STATUS_LABELS[request.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* İÇERİK KISMI - ScrollArea YERİNE NORMAL DIV KULLANILDI */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <div className="space-y-4 pb-4">
            {/* SİPARİŞ TAKİP - Onaylanmış siparişler için */}
            {isApproved && <OrderTracker />}

            {/* Müşteri Bilgileri (Admin için) */}
            {isAdmin && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Ad Soyad:</span> <span className="font-medium">{request.full_name}</span></div>
                  <div><span className="text-slate-500">Şirket:</span> <span className="font-medium">{request.company_name}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-medium">{request.email}</span></div>
                  <div><span className="text-slate-500">Telefon:</span> <span className="font-medium">{request.phone}</span></div>
                  <div><span className="text-slate-500">Vergi Dairesi:</span> <span className="font-medium">{request.tax_office}</span></div>
                  <div><span className="text-slate-500">Vergi No:</span> <span className="font-medium">{request.tax_number}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Adres:</span> <span className="font-medium">{request.profile_address}</span></div>
                </CardContent>
              </Card>
            )}

            {/* İstenen Termin Tarihi - Admin'e göster */}
            {request.requested_delivery_date && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Müşterinin İstediği Termin Tarihi</p>
                      <p className="text-lg font-bold text-amber-900">
                        {new Date(request.requested_delivery_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teslimat Bilgisi */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Teslimat Tercihi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {request.delivery_to_address ? (
                  <div className="flex items-start gap-3 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Adresine Teslim İsteniyor</p>
                      <p className="text-slate-500 text-sm">
                        {request.delivery_address || request.profile_address}
                      </p>
                      {isAdmin && (
                        <p className="text-blue-600 text-sm mt-2 font-medium">
                          💡 Nakliye maliyetini hesapla ve teklife ekle!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <XCircle className="w-5 h-5" />
                    <p>Müşteri Kendi Alacak (Fabrikadan teslim)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Talep Detayları */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Talep Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="text-slate-500">Kategori:</span> <span className="font-medium">{CATEGORIES[request.category]?.name}</span></p>
                {request.sub_category && (
                  <p><span className="text-slate-500">Yöntem:</span> <span className="font-medium">{CATEGORIES[request.category]?.subCategories.find(s => s.value === request.sub_category)?.label}</span></p>
                )}
                {request.project_description && (
                  <p><span className="text-slate-500">Proje Açıklaması:</span> <span className="font-medium">{request.project_description}</span></p>
                )}
                <p><span className="text-slate-500">Oluşturulma:</span> <span className="font-medium">{new Date(request.created_at).toLocaleString('tr-TR')}</span></p>
              </CardContent>
            </Card>

            {/* Parçalar - TÜM PARÇALAR GÖSTERİLİYOR */}
            {items && items.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Parçalar ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="font-semibold text-slate-800">{idx + 1}. {item.item_name}</span>
                          <div className="text-slate-500 text-sm mt-1">
                            <span className="inline-block mr-3">Malzeme: {item.material}</span>
                            <span className="inline-block">Adet: {item.quantity}</span>
                          </div>
                        </div>
                        {item.file_url && (
                          <a 
                            href={item.file_url} 
                            target="_blank" 
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg"
                          >
                            <FileText className="w-4 h-4" /> {item.file_name}
                          </a>
                        )}
                      </div>
                      
                      {item.notes && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">📝 {item.notes}</p>
                      )}

                      {/* Admin fiyatlandırma */}
                      {canQuote && (
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                          <Label className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Fiyatlandırma
                          </Label>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <Input
                              type="number"
                              placeholder="Birim Fiyat"
                              className="w-32 h-10"
                              value={quoteForm.items[idx]?.unit_price || ''}
                              onChange={(e) => updateItemPrice(idx, e.target.value)}
                            />
                            <span className="text-slate-600">TRY × {item.quantity} =</span>
                            <span className="font-bold text-emerald-700 text-lg">
                              {(quoteForm.items[idx]?.total_price || 0).toFixed(2)} TRY
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Yorumlar */}
                      <div className="border-t pt-3">
                        <button 
                          className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1 font-medium"
                          onClick={() => document.getElementById(`comments-${item.id}`).classList.toggle('hidden')}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Yorumlar ({item.comments?.length || 0})
                        </button>
                        <div id={`comments-${item.id}`} className="hidden mt-3 space-y-2">
                          {item.comments?.map((comment) => (
                            <div 
                              key={comment.id} 
                              className={`p-3 rounded-lg text-sm ${
                                comment.commenter_role === 'admin' ? 'bg-slate-100' : 'bg-blue-50 ml-4'
                              }`}
                            >
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                <span className="font-medium">{comment.full_name}</span>
                                <span>•</span>
                                <span>{new Date(comment.created_at).toLocaleString('tr-TR')}</span>
                              </div>
                              <p className="text-slate-700">{comment.comment}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Yorum yaz..."
                              value={newComment[item.id] || ''}
                              onChange={(e) => setNewComment({...newComment, [item.id]: e.target.value})}
                              onKeyPress={(e) => e.key === 'Enter' && addComment(item.id)}
                              className="h-10"
                            />
                            <Button size="sm" onClick={() => addComment(item.id)} className="h-10">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Kalite Kontrol Evrakları - Parça Özelinde */}
                      {isApproved && (
                        <div className="border-t pt-3">
                          <button 
                            className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                            onClick={() => document.getElementById(`qc-docs-${item.id}`).classList.toggle('hidden')}
                          >
                            <FileCheck className="w-4 h-4" />
                            Kalite Kontrol Evrakları ({item.quality_documents?.length || 0})
                          </button>
                          <div id={`qc-docs-${item.id}`} className="hidden mt-3">
                            <QualityDocuments itemId={item.id} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Genel Kalite Kontrol Evrakları - Sipariş Bazında */}
            {isApproved && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                    <ClipboardCheck className="w-5 h-5" /> Genel Kalite Kontrol Evrakları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QualityDocuments />
                </CardContent>
              </Card>
            )}

            {/* TEKLİF FORMU (Admin) - DÜZELTİLDİ */}
            {canQuote && (
              <Card className="border-2 border-emerald-500 bg-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                    <Award className="w-5 h-5" /> Teklif Oluştur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.delivery_to_address && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nakliye Ücreti (TRY)</Label>
                      <Input
                        type="number"
                        value={quoteForm.delivery_cost}
                        onChange={(e) => setQuoteForm({...quoteForm, delivery_cost: e.target.value})}
                        className="h-11"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Termin Tarihi *</Label>
                    <Input
                      type="date"
                      value={quoteForm.delivery_date}
                      onChange={(e) => setQuoteForm({...quoteForm, delivery_date: e.target.value})}
                      className="h-11"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notlar</Label>
                    <Textarea
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({...quoteForm, notes: e.target.value})}
                      placeholder="Teklif ile ilgili notlarınız..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                    <span className="font-semibold text-slate-700">Toplam Tutar:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {(
                        quoteForm.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) +
                        (parseFloat(quoteForm.delivery_cost) || 0)
                      ).toFixed(2)} TRY
                    </span>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700" 
                    onClick={submitQuote} 
                    disabled={submittingQuote}
                  >
                    {submittingQuote ? 'Gönderiliyor...' : 'Teklifi Gönder'}
                    <Send className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Teklif Görüntüleme */}
            {quote && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Teklif
                    <Badge className={`${quote.status === 'accepted' ? 'bg-emerald-500' : quote.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                      {quote.status === 'accepted' ? 'Onaylandı' : quote.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.items && (
                    <div className="space-y-2 bg-white p-3 rounded-lg">
                      {quote.items.map((qi) => {
                        const item = items.find(i => i.id === qi.request_item_id);
                        return (
                          <div key={qi.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item?.item_name} × {item?.quantity}</span>
                            <span className="font-medium">{parseFloat(qi.total_price).toFixed(2)} TRY</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {parseFloat(quote.delivery_cost) > 0 && (
                    <div className="flex justify-between text-sm bg-white p-3 rounded-lg">
                      <span className="text-slate-600">Nakliye</span>
                      <span className="font-medium">{parseFloat(quote.delivery_cost).toFixed(2)} TRY</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Toplam</span>
                    <span className="text-xl font-bold text-blue-700">{parseFloat(quote.total_price).toFixed(2)} TRY</span>
                  </div>
                  <div className="text-sm bg-white p-3 rounded-lg">
                    <p><span className="text-slate-500">Termin:</span> <span className="font-medium">{new Date(quote.delivery_date).toLocaleDateString('tr-TR')}</span></p>
                    {quote.notes && <p className="mt-1"><span className="text-slate-500">Notlar:</span> <span className="font-medium">{quote.notes}</span></p>}
                  </div>
                  
                  {canRespond && (
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700" onClick={() => respondToQuote(true)}>
                        <CheckSquare className="w-5 h-5 mr-2" /> Onayla
                      </Button>
                      <Button variant="destructive" className="flex-1 h-12" onClick={() => respondToQuote(false)}>
                        <XSquare className="w-5 h-5 mr-2" /> Reddet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mesajlar - DÜZELTİLDİ */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Mesajlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto mb-4 p-2 bg-slate-50 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">Henüz mesaj yok</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-xl max-w-[85%] ${
                            msg.sender_id === user.id
                              ? 'bg-slate-800 text-white ml-auto'
                              : 'bg-white shadow-sm'
                          }`}
                        >
                          <div className={`text-xs mb-1 ${msg.sender_id === user.id ? 'text-slate-300' : 'text-slate-500'}`}>
                            {msg.full_name} • {new Date(msg.created_at).toLocaleString('tr-TR')}
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mesaj yaz..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="h-11"
                  />
                  <Button onClick={sendMessage} disabled={sendingMessage} className="h-11 px-6">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, templatesData] = await Promise.all([
        api('/requests'),
        api('/templates'),
      ]);
      setRequests(requestsData.requests || []);
      setTemplates(templatesData.templates || []);
      
      if (isAdmin) {
        const statsData = await api('/admin/stats');
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = (status) => {
    if (!status) return requests;
    return requests.filter(r => r.status === status);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="MANES Logo" className="h-10 w-auto" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && stats && (
              <Badge variant="outline" className="hidden sm:flex border-amber-300 text-amber-700 bg-amber-50">
                <Bell className="w-4 h-4 mr-1" />
                {stats.unread_messages} Okunmamış
              </Badge>
            )}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline text-sm font-medium text-slate-700">{user?.full_name}</span>
              {isAdmin && <Badge className="bg-slate-800 text-white text-xs">Admin</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 px-4">
        {/* Admin Stats */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-amber-700">{stats.pending}</div>
                    <p className="text-sm text-amber-600 font-medium">Bekleyen</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">{stats.quoted}</div>
                    <p className="text-sm text-blue-600 font-medium">Teklif Verilmiş</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-700">{stats.approved}</div>
                    <p className="text-sm text-emerald-600 font-medium">Onaylanan</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-700">{stats.completed}</div>
                    <p className="text-sm text-purple-600 font-medium">Tamamlanan</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-700">{stats.unread_messages}</div>
                    <p className="text-sm text-red-600 font-medium">Okunmamış</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar - Mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="fixed left-0 top-0 bottom-0 w-64 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <img src={LOGO_URL} alt="MANES Logo" className="h-8" />
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  <button 
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'requests' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                    onClick={() => { setActiveTab('requests'); setSidebarOpen(false); }}
                  >
                    <Inbox className="w-5 h-5" /> Talepler
                  </button>
                  {!isAdmin && (
                    <button 
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'templates' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                      onClick={() => { setActiveTab('templates'); setSidebarOpen(false); }}
                    >
                      <RefreshCw className="w-5 h-5" /> Şablonlarım
                    </button>
                  )}
                  <button 
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                    onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
                  >
                    <Settings className="w-5 h-5" /> Profil
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button 
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'requests' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                    onClick={() => setActiveTab('requests')}
                  >
                    <Inbox className="w-5 h-5" /> Talepler
                  </button>
                  {!isAdmin && (
                    <button 
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'templates' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                      onClick={() => setActiveTab('templates')}
                    >
                      <RefreshCw className="w-5 h-5" /> Şablonlarım
                    </button>
                  )}
                  <button 
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <Settings className="w-5 h-5" /> Profil
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-slate-800">{isAdmin ? 'Tüm Talepler' : 'Taleplerim'}</h2>
                  {!isAdmin && (
                    <Button onClick={() => setShowWizard(true)} className="bg-slate-800 hover:bg-slate-700 h-11">
                      <Plus className="w-4 h-4 mr-2" /> Yeni Teklif Al
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-white border shadow-sm p-1 h-auto flex-wrap">
                    <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Tümü ({requests.length})</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Bekleyen ({filteredRequests('pending').length})</TabsTrigger>
                    <TabsTrigger value="quoted" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Teklif Geldi ({filteredRequests('quoted').length})</TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Onaylanan ({filteredRequests('approved').length})</TabsTrigger>
                  </TabsList>

                  {['all', 'pending', 'quoted', 'approved', 'completed'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(tab === 'all' ? requests : filteredRequests(tab)).length === 0 ? (
                            <Card className="border-0 shadow-sm">
                              <CardContent className="py-12 text-center">
                                <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 text-lg">Henüz talep yok</p>
                                {!isAdmin && (
                                  <Button className="mt-4 bg-slate-800 hover:bg-slate-700" onClick={() => setShowWizard(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> İlk Talebinizi Oluşturun
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ) : (
                            (tab === 'all' ? requests : filteredRequests(tab)).map((req) => (
                              <Card 
                                key={req.id} 
                                className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" 
                                onClick={() => setSelectedRequest(req.id)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-slate-800">{req.request_number}</span>
                                        <Badge className={`${STATUS_COLORS[req.status]} text-white`}>
                                          {STATUS_LABELS[req.status]}
                                        </Badge>
                                        {req.unread_messages > 0 && (
                                          <Badge className="bg-red-500 text-white">
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            {req.unread_messages}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-500 mt-2">
                                        {CATEGORIES[req.category]?.icon} {CATEGORIES[req.category]?.name} • {req.total_items} Parça
                                      </p>
                                      {isAdmin && (
                                        <p className="text-sm text-slate-600 mt-1 font-medium">
                                          🏢 {req.company_name} - {req.full_name}
                                        </p>
                                      )}
                                      {req.requested_delivery_date && (
                                        <p className="text-sm text-amber-600 mt-1">
                                          📅 İstenen Termin: {new Date(req.requested_delivery_date).toLocaleDateString('tr-TR')}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-slate-400">
                                        {new Date(req.created_at).toLocaleDateString('tr-TR')}
                                      </p>
                                      <Button variant="ghost" size="sm" className="mt-2 group-hover:bg-slate-100">
                                        <Eye className="w-4 h-4 mr-1" /> Detay
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {activeTab === 'templates' && !isAdmin && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Kayıtlı Şablonlarım</h2>
                {templates.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <RefreshCw className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">Henüz kayıtlı şablon yok</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Teklif talebi oluştururken "Şablon olarak kaydet" seçeneğini işaretleyin.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                      <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardHeader>
                          <CardTitle className="text-base">{template.template_name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {CATEGORIES[template.category]?.icon} {CATEGORIES[template.category]?.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-slate-500 mb-4">
                            {JSON.parse(template.items).length} parça
                          </div>
                          <Button 
                            className="w-full bg-slate-800 hover:bg-slate-700" 
                            onClick={() => { setSelectedTemplate(template); setShowWizard(true); }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" /> Bu Şablonu Kullan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileSection user={user} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWizard && (
        <RequestWizard 
          onClose={() => { setShowWizard(false); setSelectedTemplate(null); }}
          onSuccess={() => { setShowWizard(false); setSelectedTemplate(null); loadData(); }}
          template={selectedTemplate}
        />
      )}

      {selectedRequest && (
        <RequestDetail
          requestId={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

// Profile Section Component
function ProfileSection({ user }) {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    company_name: user?.company_name || '',
    tax_office: user?.tax_office || '',
    tax_number: user?.tax_number || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/auth/profile', { method: 'PUT', body: formData });
      updateUser({ ...user, ...formData });
      toast.success('Profil güncellendi');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Profil Ayarları</h2>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> Kişisel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ad Soyad</Label>
              <Input 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Şirket Ünvanı</Label>
              <Input 
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vergi Dairesi</Label>
              <Input 
                value={formData.tax_office}
                onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Vergi No / TCKN</Label>
              <Input 
                value={formData.tax_number}
                onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Telefon</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input value={user?.email} disabled className="h-11 bg-slate-50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Adres</Label>
            <Textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="resize-none"
              rows={2}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-slate-800 hover:bg-slate-700 h-11">
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App Component
export default function App() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={login} />;
  }

  return <Dashboard />;
}