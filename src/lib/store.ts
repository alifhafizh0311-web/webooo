import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc,
  arrayUnion
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { create } from 'zustand';

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
  sender: string;
  senderEmail: string;
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

interface StoreState {
  userEmail: string | null;
  setUser: (email: string | null) => void;
  getUser: () => string | null;
  isAdmin: () => boolean;
}

export const useStore = create<StoreState>((set, get) => ({
  userEmail: localStorage.getItem('webooo_user_email'),
  setUser: (email) => {
    if (email) {
      localStorage.setItem('webooo_user_email', email);
    } else {
      localStorage.removeItem('webooo_user_email');
    }
    set({ userEmail: email });
  },
  getUser: () => get().userEmail,
  isAdmin: () => get().userEmail === 'alifhafizh0311@gmail.com',
}));

export const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'Paket Hemat',
    price: 50000,
    features: ['1 Halaman Landing Page', 'Gratis Hosting 1 Bulan', 'Desain Responsif', 'Support 24/7']
  },
  {
    id: 'standard',
    name: 'Paket Bisnis',
    price: 150000,
    features: ['5 Halaman Website', 'Gratis Hosting 1 Tahun', 'Domain .com (Opsional)', 'SEO Basic', 'Support Prioritas']
  },
  {
    id: 'premium',
    name: 'Paket Custom',
    price: 500000,
    features: ['Halaman Unlimited', 'E-commerce Ready', 'Custom Design', 'Full SEO & Analytics', 'Maintenance 6 Bulan']
  }
];

export const storeActions = {
  // Testimonials
  subscribeTestimonials: (callback: (data: Testimonial[]) => void) => {
    const path = 'testimonials';
    return onSnapshot(collection(db, path), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  addTestimonial: async (data: Omit<Testimonial, 'id'>) => {
    const path = 'testimonials';
    try {
      await addDoc(collection(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  updateTestimonial: async (id: string, data: Partial<Testimonial>) => {
    const path = `testimonials/${id}`;
    try {
      await updateDoc(doc(db, 'testimonials', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteTestimonial: async (id: string) => {
    const path = `testimonials/${id}`;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Packages
  subscribePackages: (callback: (data: Package[]) => void) => {
    const path = 'packages';
    return onSnapshot(collection(db, path), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package));
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  updatePackage: async (id: string, data: Partial<Package>) => {
    const path = `packages/${id}`;
    try {
      await setDoc(doc(db, 'packages', id), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Promos
  subscribePromos: (callback: (data: Promo[]) => void) => {
    const path = 'promos';
    return onSnapshot(collection(db, path), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Promo);
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  addPromo: async (data: Promo) => {
    const path = `promos/${data.code}`;
    try {
      await setDoc(doc(db, 'promos', data.code), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deletePromo: async (code: string) => {
    const path = `promos/${code}`;
    try {
      await deleteDoc(doc(db, 'promos', code));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Chats
  subscribePublicChats: (callback: (data: ChatMessage[]) => void) => {
    const path = 'public_chats';
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
        .sort((a, b) => a.timestamp - b.timestamp);
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  sendPublicMessage: async (message: Omit<ChatMessage, 'id'>) => {
    const path = 'public_chats';
    try {
      await addDoc(collection(db, path), {
        ...message,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deletePublicMessage: async (id: string) => {
    const path = `public_chats/${id}`;
    try {
      await deleteDoc(doc(db, 'public_chats', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
  seedPackages: async () => {
    const path = 'packages';
    try {
      for (const pkg of DEFAULT_PACKAGES) {
        await setDoc(doc(db, 'packages', pkg.id), pkg, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  subscribeUserChats: (email: string, callback: (data: ChatSession[]) => void) => {
    const path = 'chats';
    const q = query(collection(db, path), where('userEmail', '==', email));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  subscribeAllChats: (callback: (data: ChatSession[]) => void) => {
    const path = 'chats';
    return onSnapshot(collection(db, path), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      callback(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },
  createChat: async (userEmail: string, packageId: string) => {
    const path = 'chats';
    const newChat: Omit<ChatSession, 'id'> = {
      userEmail,
      packageId,
      messages: [],
      status: 'open'
    };
    try {
      const docRef = await addDoc(collection(db, path), newChat);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  },
  sendMessage: async (chatId: string, message: Omit<ChatMessage, 'id'>) => {
    const path = `chats/${chatId}`;
    const chatRef = doc(db, 'chats', chatId);
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  updateChatStatus: async (chatId: string, status: 'open' | 'closed') => {
    const path = `chats/${chatId}`;
    try {
      await updateDoc(doc(db, 'chats', chatId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteChat: async (chatId: string) => {
    const path = `chats/${chatId}`;
    try {
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};

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
