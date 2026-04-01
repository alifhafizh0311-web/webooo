export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface Promo {
  code: string;
  discountPercent: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userEmail: string;
  packageId: string;
  messages: ChatMessage[];
  status: 'open' | 'closed';
}

const defaultTestimonials: Testimonial[] = [
  { id: '1', name: 'Budi Santoso', role: 'Pemilik UMKM', text: 'Website saya jadi lebih profesional, penjualan meningkat tajam. Terima kasih Webooo!' },
  { id: '2', name: 'Siti Aminah', role: 'Freelancer', text: 'Portofolio saya terlihat sangat modern. Proses pembuatannya juga cepat banget.' },
];

const defaultPackages: Package[] = [
  { id: 'basic', name: 'Basic', price: 50000, features: ['1 Halaman Landing Page', 'Desain Modern', 'Gratis Hosting', 'Revisi 1x'] },
  { id: 'standard', name: 'Standard', price: 150000, features: ['3 Halaman Website', 'Desain Premium', 'Gratis Hosting & Domain (.my.id)', 'Revisi 3x', 'SEO Basic'] },
  { id: 'premium', name: 'Premium', price: 350000, features: ['Hingga 10 Halaman', 'Desain Custom Eksklusif', 'Gratis Hosting & Domain (.com)', 'Revisi Unlimited', 'SEO Advanced', 'Prioritas Support'] },
];

const defaultPromos: Promo[] = [
  { code: 'WEBOOO50', discountPercent: 50 },
  { code: 'MURAH', discountPercent: 10 },
];

export const getStoreData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
};

export const setStoreData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getUser = () => getStoreData<string | null>('webooo_user_email', null);
export const setUser = (email: string | null) => {
  setStoreData('webooo_user_email', email);
  window.dispatchEvent(new Event('webooo_auth_change'));
};

export const useStore = () => {
  return {
    getTestimonials: () => getStoreData<Testimonial[]>('webooo_testimonials', defaultTestimonials),
    setTestimonials: (data: Testimonial[]) => setStoreData('webooo_testimonials', data),
    
    getPackages: () => getStoreData<Package[]>('webooo_packages', defaultPackages),
    setPackages: (data: Package[]) => setStoreData('webooo_packages', data),
    
    getPromos: () => getStoreData<Promo[]>('webooo_promos', defaultPromos),
    setPromos: (data: Promo[]) => setStoreData('webooo_promos', data),
    
    getChats: () => getStoreData<ChatSession[]>('webooo_chats', []),
    setChats: (data: ChatSession[]) => setStoreData('webooo_chats', data),

    getUser,
    setUser,
  };
};
