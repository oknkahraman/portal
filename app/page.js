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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Factory, 
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
  Edit,
  Eye,
  RefreshCw,
  Bell,
  Menu,
  X,
  Building2,
  FileCheck,
  Layers
} from 'lucide-react';

// Categories
const CATEGORIES = {
  talasli: {
    name: 'Talasli Imalat',
    icon: '🔧',
    subCategories: [
      { value: 'cnc_torna', label: 'CNC Torna' },
      { value: 'dik_islem', label: 'Dik Islem (Freze)' },
      { value: 'borwerk', label: 'Borwerk' },
      { value: 'oneriye_acik', label: 'Emin Degilim / Teknik Resme Gore Belirlensin' },
    ],
  },
  kaynak: {
    name: 'Kaynakli Imalat',
    icon: '⚡',
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
    icon: '📐',
    subCategories: [
      { value: 'lazer_kesim', label: 'Lazer Kesim' },
      { value: 'cnc_abkant', label: 'CNC Abkant (Bukum)' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
  '3d': {
    name: 'Eklemeli Imalat (3D Baski)',
    icon: '🖨️',
    subCategories: [
      { value: 'pla_abs', label: 'PLA/ABS (Hobi/Prototip)' },
      { value: 'petg_nylon', label: 'PETG/Nylon (Fonksiyonel Parca)' },
      { value: 'metal', label: 'Metal (SLS/DMLS)' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
  komple: {
    name: 'Komple Proje (Montajli)',
    icon: '🏭',
    subCategories: [],
  },
  kaplama: {
    name: 'Kaplama/Boya',
    icon: '🎨',
    subCategories: [
      { value: 'galvaniz', label: 'Galvaniz Kaplama' },
      { value: 'elektrolitik', label: 'Elektrolitik Kaplama' },
      { value: 'toz_boya', label: 'Toz Boya' },
      { value: 'sivi_boya', label: 'Sivi Boya' },
      { value: 'oneriye_acik', label: 'Oneriye Acigim' },
    ],
  },
};

const MATERIALS = [
  'ST37', 'ST52', '304L', '316L', 'Aluminyum 6061', 'Aluminyum 7075', 
  'Pirinc', 'Bakir', 'Bronz', 'Paslanmaz Celik', 'Dokme Demir',
  'C45', '42CrMo4', '16MnCr5', 'Titanyum', 'Nikel Alasim'
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  quoted: 'bg-blue-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-gray-500',
};

const STATUS_LABELS = {
  pending: 'Teklif Bekliyor',
  quoted: 'Teklif Geldi',
  approved: 'Onaylandi',
  rejected: 'Reddedildi',
  completed: 'Tamamlandi',
  cancelled: 'Iptal Edildi',
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
    throw new Error(data.error || 'Bir hata olustu');
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
      toast.success(isLogin ? 'Giris basarili!' : 'Kayit basarili!');
      onSuccess(data.token, data.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Factory className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Imalat Portal</CardTitle>
          <CardDescription>
            {isLogin ? 'Hesabiniza giris yapin' : 'Yeni hesap olusturun'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label>Ad Soyad</Label>
                  <Input 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <Label>Sirket Unvani</Label>
                  <Input 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vergi Dairesi</Label>
                    <Input 
                      value={formData.tax_office}
                      onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Vergi No / TCKN</Label>
                    <Input 
                      value={formData.tax_number}
                      onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                      required
                      minLength={10}
                      maxLength={11}
                    />
                  </div>
                </div>
                <div>
                  <Label>Adres</Label>
                  <Textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    minLength={10}
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="5321234567"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Sifre</Label>
              <Input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Yukleniyor...' : (isLogin ? 'Giris Yap' : 'Kayit Ol')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button 
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Hesabiniz yok mu? Kayit olun' : 'Zaten hesabiniz var mi? Giris yapin'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Request Wizard Component
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
      toast.error('Dosya boyutu 100 MB\'i asamaz');
      return;
    }

    const allowedExtensions = ['.step', '.stp', '.dxf', '.pdf', '.rar', '.zip'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      toast.error('Gecersiz dosya formati');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await api('/upload', { method: 'POST', body: formData });
      setCurrentItem({
        ...currentItem,
        file: file,
        file_url: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
      });
      toast.success('Dosya yuklendi');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const addItem = () => {
    if (!currentItem.item_name || !currentItem.material || !currentItem.file_url) {
      toast.error('Lutfen tum zorunlu alanlari doldurun');
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
    toast.success('Parca eklendi');
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
      };

      const data = await api('/requests', { method: 'POST', body: requestData });
      toast.success(`Talebiniz olusturuldu: ${data.request_number}`);
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
          return true; // Teslimat adimi
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Imalat Kategorisi Secin</h3>
            <RadioGroup
              value={formData.category}
              onValueChange={(value) => setFormData({...formData, category: value, sub_category: ''})}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer text-base">
                    <span className="text-2xl">{cat.icon}</span>
                    {cat.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        if (isKompleProje) {
          // Komple proje - aciklama ve dosya
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Proje Detaylari</h3>
              <div>
                <Label>Proje Aciklamasi (min 50 karakter)</Label>
                <Textarea
                  value={formData.project_description}
                  onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                  rows={4}
                  placeholder="Projenizi detayli olarak aciklayiniz..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.project_description.length}/50 karakter
                </p>
              </div>
              <div>
                <Label>Proje Dosyalari</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="project-file"
                    accept=".step,.stp,.dxf,.pdf,.rar,.zip"
                  />
                  <label htmlFor="project-file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="mt-2">Dosya yuklemek icin tiklayin</p>
                    <p className="text-sm text-muted-foreground">Max 100 MB - .step, .stp, .dxf, .pdf, .rar, .zip</p>
                  </label>
                </div>
                {currentItem.file_name && (
                  <div className="mt-2 p-2 bg-muted rounded flex items-center justify-between">
                    <span>{currentItem.file_name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          items: [...formData.items, { ...currentItem, id: Date.now(), item_name: 'Proje Dosyasi', material: 'N/A', quantity: 1 }],
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
                    <Label>Yuklenen Dosyalar:</Label>
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="p-2 bg-green-50 rounded flex items-center justify-between">
                        <span>{item.file_name}</span>
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
        
        // Diger kategoriler - alt kategori secimi
        const category = CATEGORIES[formData.category];
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Yontem Secin</h3>
            <RadioGroup
              value={formData.sub_category}
              onValueChange={(value) => setFormData({...formData, sub_category: value})}
              className="space-y-3"
            >
              {category?.subCategories.map((sub) => (
                <div key={sub.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={sub.value} id={sub.value} />
                  <Label htmlFor={sub.value} className="cursor-pointer">{sub.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        if (isKompleProje) {
          // Komple proje - teslimat adimi
          return renderDeliveryStep();
        }
        
        // Diger kategoriler - parca ekleme
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Parca Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Parca Ismi *</Label>
                <Input
                  value={currentItem.item_name}
                  onChange={(e) => setCurrentItem({...currentItem, item_name: e.target.value})}
                  placeholder="Ornek: Mil, Flans, Kapak"
                />
              </div>
              <div>
                <Label>Malzeme *</Label>
                <Select
                  value={currentItem.material}
                  onValueChange={(value) => setCurrentItem({...currentItem, material: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Malzeme secin veya yazin" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map((mat) => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="mt-2"
                  value={currentItem.material}
                  onChange={(e) => setCurrentItem({...currentItem, material: e.target.value})}
                  placeholder="veya manuel girin"
                />
              </div>
              <div>
                <Label>Adet *</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label>Teknik Dosya *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
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
                      <span>Yukleniyor...</span>
                    ) : currentItem.file_name ? (
                      <span className="text-green-600">{currentItem.file_name}</span>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm">Dosya yukle (max 100MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div>
              <Label>Ek Notlar</Label>
              <Textarea
                value={currentItem.notes}
                onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                placeholder="Tolerans, yuzey islem vb. bilgiler..."
              />
            </div>
            <Button onClick={addItem} disabled={uploading}>
              <Plus className="w-4 h-4 mr-2" /> Parca Ekle
            </Button>

            {formData.items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Eklenen Parcalar ({formData.items.length})</h4>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.item_name}</span>
                        <span className="text-muted-foreground ml-2">
                          {item.material} - {item.quantity} Adet
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Teslimat Secenekleri</h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="delivery"
          checked={formData.delivery_to_address}
          onCheckedChange={(checked) => setFormData({...formData, delivery_to_address: checked})}
        />
        <Label htmlFor="delivery" className="cursor-pointer">Adresime teslim edilsin</Label>
      </div>
      
      {formData.delivery_to_address && (
        <div className="space-y-4 pl-6 border-l-2 border-primary">
          <RadioGroup
            value={formData.use_profile_address ? 'profile' : 'custom'}
            onValueChange={(value) => setFormData({...formData, use_profile_address: value === 'profile'})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="profile" id="profile-addr" />
              <Label htmlFor="profile-addr" className="cursor-pointer">
                Fatura adresime teslim et
                <p className="text-sm text-muted-foreground">{user?.address}</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom-addr" />
              <Label htmlFor="custom-addr" className="cursor-pointer">Farkli bir adrese teslim et</Label>
            </div>
          </RadioGroup>
          
          {!formData.use_profile_address && (
            <Textarea
              value={formData.delivery_address}
              onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
              placeholder="Teslimat adresi..."
            />
          )}
          
          <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <Truck className="w-5 h-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-700">
              Adresinize teslim secenegini isaretlerseniz, admin konumunuzu gorerek 
              nakliye maliyetini teklifine dahil edecektir.
            </p>
          </div>
        </div>
      )}
      
      {!formData.delivery_to_address && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">Parcalari fabrikadan kendiniz alacaksiniz.</p>
        </div>
      )}
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Ozet ve Onayla</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fatura Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Sirket:</strong> {user?.company_name}</p>
          <p><strong>Vergi Dairesi:</strong> {user?.tax_office}</p>
          <p><strong>Vergi No:</strong> {user?.tax_number}</p>
          <p><strong>Adres:</strong> {user?.address}</p>
          <p><strong>Telefon:</strong> {user?.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talep Detaylari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Kategori:</strong> {CATEGORIES[formData.category]?.name}</p>
          {formData.sub_category && (
            <p><strong>Yontem:</strong> {CATEGORIES[formData.category]?.subCategories.find(s => s.value === formData.sub_category)?.label}</p>
          )}
          <p><strong>Toplam Parca:</strong> {formData.items.length}</p>
          {formData.project_description && (
            <p><strong>Proje Aciklamasi:</strong> {formData.project_description}</p>
          )}
        </CardContent>
      </Card>

      {formData.items.length > 0 && !isKompleProje && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parcalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-2 bg-muted rounded text-sm">
                  {item.item_name} - {item.material} - {item.quantity} Adet
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teslimat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {formData.delivery_to_address ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p>Adresime teslim edilsin</p>
                <p className="text-muted-foreground">
                  {formData.use_profile_address ? user?.address : formData.delivery_address}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <p>Fabrikadan kendim alacagim</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="save-template"
          checked={formData.save_as_template}
          onCheckedChange={(checked) => setFormData({...formData, save_as_template: checked})}
        />
        <Label htmlFor="save-template">Bu talebi sablon olarak kaydet</Label>
      </div>
      
      {formData.save_as_template && (
        <Input
          value={formData.template_name}
          onChange={(e) => setFormData({...formData, template_name: e.target.value})}
          placeholder="Sablon adi (ornek: Mil Parcasi - Aylik Siparis)"
        />
      )}
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Yeni Teklif Talebi
          </DialogTitle>
          <DialogDescription>
            Adim {step} / {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="py-4">
          {renderStep()}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Geri
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Ileri <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Gonderiliyor...' : 'Teklif Talebini Gonder'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Request Detail Component
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
      
      // Initialize quote form with items
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
      toast.error('Termin tarihi secin');
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
      toast.success('Teklif gonderildi');
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
      toast.success(accept ? 'Teklif onaylandi' : 'Teklif reddedildi');
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { request, items, quote, messages } = data;
  const isAdmin = user?.role === 'admin';
  const canQuote = isAdmin && request.status === 'pending';
  const canRespond = !isAdmin && quote && quote.status === 'sent';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Talep #{request.request_number}
            <Badge className={STATUS_COLORS[request.status]}>
              {STATUS_LABELS[request.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Musteri Bilgileri (Admin icin) */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Musteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Ad Soyad:</strong> {request.full_name}</div>
                  <div><strong>Sirket:</strong> {request.company_name}</div>
                  <div><strong>Email:</strong> {request.email}</div>
                  <div><strong>Telefon:</strong> {request.phone}</div>
                  <div><strong>Vergi Dairesi:</strong> {request.tax_office}</div>
                  <div><strong>Vergi No:</strong> {request.tax_number}</div>
                  <div className="col-span-2"><strong>Adres:</strong> {request.profile_address}</div>
                </CardContent>
              </Card>
            )}

            {/* Teslimat Bilgisi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Teslimat Tercihi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {request.delivery_to_address ? (
                  <div className="flex items-start gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Adresine Teslim Isteniyor</p>
                      <p className="text-muted-foreground text-sm">
                        {request.delivery_address || request.profile_address}
                      </p>
                      {isAdmin && (
                        <p className="text-blue-600 text-sm mt-1">
                          Nakliye maliyetini hesapla ve teklife ekle!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <p>Musteri Kendi Alacak (Fabrikadan teslim)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Talep Detaylari */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Talep Detaylari
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Kategori:</strong> {CATEGORIES[request.category]?.name}</p>
                {request.sub_category && (
                  <p><strong>Yontem:</strong> {CATEGORIES[request.category]?.subCategories.find(s => s.value === request.sub_category)?.label}</p>
                )}
                {request.project_description && (
                  <p><strong>Proje Aciklamasi:</strong> {request.project_description}</p>
                )}
                <p><strong>Olusturulma:</strong> {new Date(request.created_at).toLocaleString('tr-TR')}</p>
              </CardContent>
            </Card>

            {/* Parcalar */}
            {items && items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Parcalar ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{item.item_name}</span>
                          <span className="text-muted-foreground ml-2">
                            {item.material} | {item.quantity} Adet
                          </span>
                        </div>
                        {item.file_url && (
                          <a 
                            href={item.file_url} 
                            target="_blank" 
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" /> {item.file_name}
                          </a>
                        )}
                      </div>
                      
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}

                      {/* Admin fiyatlandirma */}
                      {canQuote && (
                        <div className="bg-muted p-3 rounded-lg">
                          <Label className="text-sm">Fiyatlandirma</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="number"
                              placeholder="Birim Fiyat"
                              className="w-32"
                              value={quoteForm.items[idx]?.unit_price || ''}
                              onChange={(e) => updateItemPrice(idx, e.target.value)}
                            />
                            <span>TRY x {item.quantity} =</span>
                            <span className="font-semibold">
                              {quoteForm.items[idx]?.total_price?.toFixed(2) || '0.00'} TRY
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Yorumlar */}
                      <div className="border-t pt-3">
                        <button 
                          className="text-sm text-primary flex items-center gap-1"
                          onClick={() => document.getElementById(`comments-${item.id}`).classList.toggle('hidden')}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Yorumlar ({item.comments?.length || 0})
                        </button>
                        <div id={`comments-${item.id}`} className="hidden mt-2 space-y-2">
                          {item.comments?.map((comment) => (
                            <div 
                              key={comment.id} 
                              className={`p-2 rounded text-sm ${
                                comment.commenter_role === 'admin' ? 'bg-gray-100 ml-0' : 'bg-blue-50 ml-4'
                              }`}
                            >
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span className="font-medium">{comment.full_name}</span>
                                <span>{new Date(comment.created_at).toLocaleString('tr-TR')}</span>
                              </div>
                              <p>{comment.comment}</p>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Yorum yaz..."
                              value={newComment[item.id] || ''}
                              onChange={(e) => setNewComment({...newComment, [item.id]: e.target.value})}
                              onKeyPress={(e) => e.key === 'Enter' && addComment(item.id)}
                            />
                            <Button size="sm" onClick={() => addComment(item.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Teklif Formu (Admin) */}
            {canQuote && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Teklif Olustur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.delivery_to_address && (
                    <div>
                      <Label>Nakliye Ucreti (TRY)</Label>
                      <Input
                        type="number"
                        value={quoteForm.delivery_cost}
                        onChange={(e) => setQuoteForm({...quoteForm, delivery_cost: e.target.value})}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Termin Tarihi</Label>
                    <Input
                      type="date"
                      value={quoteForm.delivery_date}
                      onChange={(e) => setQuoteForm({...quoteForm, delivery_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Notlar</Label>
                    <Textarea
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({...quoteForm, notes: e.target.value})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Toplam Tutar:</span>
                    <span className="text-xl font-bold">
                      {(
                        quoteForm.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) +
                        (parseFloat(quoteForm.delivery_cost) || 0)
                      ).toFixed(2)} TRY
                    </span>
                  </div>
                  <Button className="w-full" onClick={submitQuote} disabled={submittingQuote}>
                    {submittingQuote ? 'Gonderiliyor...' : 'Teklif Gonder'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Teklif Goruntuleme */}
            {quote && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Teklif
                    <Badge className={quote.status === 'accepted' ? 'bg-green-500' : quote.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'}>
                      {quote.status === 'accepted' ? 'Onaylandi' : quote.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.items && (
                    <div className="space-y-2">
                      {quote.items.map((qi) => {
                        const item = items.find(i => i.id === qi.request_item_id);
                        return (
                          <div key={qi.id} className="flex justify-between text-sm">
                            <span>{item?.item_name} x {item?.quantity}</span>
                            <span>{parseFloat(qi.total_price).toFixed(2)} TRY</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {parseFloat(quote.delivery_cost) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Nakliye</span>
                      <span>{parseFloat(quote.delivery_cost).toFixed(2)} TRY</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Toplam</span>
                    <span>{parseFloat(quote.total_price).toFixed(2)} TRY</span>
                  </div>
                  <div className="text-sm">
                    <strong>Termin:</strong> {new Date(quote.delivery_date).toLocaleDateString('tr-TR')}
                  </div>
                  {quote.notes && (
                    <div className="text-sm">
                      <strong>Notlar:</strong> {quote.notes}
                    </div>
                  )}
                  
                  {canRespond && (
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => respondToQuote(true)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Onayla
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => respondToQuote(false)}>
                        <XCircle className="w-4 h-4 mr-2" /> Reddet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mesajlar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Mesajlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 mb-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Henuz mesaj yok</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg max-w-[80%] ${
                            msg.sender_id === user.id
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {msg.full_name} - {new Date(msg.created_at).toLocaleString('tr-TR')}
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mesaj yaz..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={sendingMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Factory className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Imalat Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && stats && (
              <Badge variant="outline" className="hidden sm:flex">
                <Bell className="w-4 h-4 mr-1" />
                {stats.unread_messages} Okunmamis
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user?.full_name}</span>
              {isAdmin && <Badge variant="secondary">Admin</Badge>}
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Admin Stats */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.quoted}</div>
                <p className="text-sm text-muted-foreground">Teklif Verilmis</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-sm text-muted-foreground">Onaylanan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.unread_messages}</div>
                <p className="text-sm text-muted-foreground">Okunmamis Mesaj</p>
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
              <div className="fixed left-0 top-0 bottom-0 w-64 bg-background p-4 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold">Menu</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  <button 
                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'requests' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => { setActiveTab('requests'); setSidebarOpen(false); }}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Talepler
                  </button>
                  {!isAdmin && (
                    <button 
                      className={`w-full text-left p-3 rounded-lg ${activeTab === 'templates' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => { setActiveTab('templates'); setSidebarOpen(false); }}
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" /> Sablonlarim
                    </button>
                  )}
                  <button 
                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
                  >
                    <Settings className="w-4 h-4 inline mr-2" /> Profil
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button 
                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'requests' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTab('requests')}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Talepler
                  </button>
                  {!isAdmin && (
                    <button 
                      className={`w-full text-left p-3 rounded-lg ${activeTab === 'templates' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => setActiveTab('templates')}
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" /> Sablonlarim
                    </button>
                  )}
                  <button 
                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <Settings className="w-4 h-4 inline mr-2" /> Profil
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{isAdmin ? 'Tum Talepler' : 'Taleplerim'}</h2>
                  {!isAdmin && (
                    <Button onClick={() => setShowWizard(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Yeni Teklif Al
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">Tumu ({requests.length})</TabsTrigger>
                    <TabsTrigger value="pending">Bekleyen ({filteredRequests('pending').length})</TabsTrigger>
                    <TabsTrigger value="quoted">Teklif Geldi ({filteredRequests('quoted').length})</TabsTrigger>
                    <TabsTrigger value="approved">Onaylanan ({filteredRequests('approved').length})</TabsTrigger>
                  </TabsList>

                  {['all', 'pending', 'quoted', 'approved', 'completed'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(tab === 'all' ? requests : filteredRequests(tab)).length === 0 ? (
                            <Card>
                              <CardContent className="py-12 text-center">
                                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Henuz talep yok</p>
                                {!isAdmin && (
                                  <Button className="mt-4" onClick={() => setShowWizard(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Ilk Talebinizi Olusturun
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ) : (
                            (tab === 'all' ? requests : filteredRequests(tab)).map((req) => (
                              <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(req.id)}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold">{req.request_number}</span>
                                          <Badge className={STATUS_COLORS[req.status]}>
                                            {STATUS_LABELS[req.status]}
                                          </Badge>
                                          {req.unread_messages > 0 && (
                                            <Badge variant="destructive">
                                              <MessageSquare className="w-3 h-3 mr-1" />
                                              {req.unread_messages}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {CATEGORIES[req.category]?.name} | {req.total_items} Parca
                                        </p>
                                        {isAdmin && (
                                          <p className="text-sm text-muted-foreground">
                                            {req.company_name} - {req.full_name}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(req.created_at).toLocaleDateString('tr-TR')}
                                      </p>
                                      <Button variant="ghost" size="sm">
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
                <h2 className="text-2xl font-bold">Kayitli Sablonlarim</h2>
                {templates.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henuz kayitli sablon yok</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Teklif talebi olustururken "Sablon olarak kaydet" secenegini isaretleyin.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{template.template_name}</CardTitle>
                          <CardDescription>
                            {CATEGORIES[template.category]?.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-4">
                            {JSON.parse(template.items).length} parca
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => { setSelectedTemplate(template); setShowWizard(true); }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" /> Bu Sablonu Kullan
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
      toast.success('Profil guncellendi');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profil Ayarlari</h2>
      <Card>
        <CardHeader>
          <CardTitle>Kisisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Sirket Unvani</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Vergi Dairesi</Label>
              <Input
                value={formData.tax_office}
                onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
              />
            </div>
            <div>
              <Label>Vergi No / TCKN</Label>
              <Input
                value={formData.tax_number}
                onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email} disabled />
            </div>
          </div>
          <div>
            <Label>Adres</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={login} />;
  }

  return <Dashboard />;
}
