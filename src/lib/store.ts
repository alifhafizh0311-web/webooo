import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../firebase';

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

export const useStore = () => {
  return {
    // Testimonials
    subscribeTestimonials: (callback: (data: Testimonial[]) => void) => {
      return onSnapshot(collection(db, 'testimonials'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        callback(data);
      });
    },
    addTestimonial: async (data: Omit<Testimonial, 'id'>) => {
      await addDoc(collection(db, 'testimonials'), data);
    },
    updateTestimonial: async (id: string, data: Partial<Testimonial>) => {
      await updateDoc(doc(db, 'testimonials', id), data);
    },
    deleteTestimonial: async (id: string) => {
      await deleteDoc(doc(db, 'testimonials', id));
    },

    // Packages
    subscribePackages: (callback: (data: Package[]) => void) => {
      return onSnapshot(collection(db, 'packages'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Package));
        callback(data);
      });
    },
    updatePackage: async (id: string, data: Partial<Package>) => {
      await setDoc(doc(db, 'packages', id), data, { merge: true });
    },

    // Promos
    subscribePromos: (callback: (data: Promo[]) => void) => {
      return onSnapshot(collection(db, 'promos'), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Promo);
        callback(data);
      });
    },
    addPromo: async (data: Promo) => {
      await setDoc(doc(db, 'promos', data.code), data);
    },
    deletePromo: async (code: string) => {
      await deleteDoc(doc(db, 'promos', code));
    },

    // Chats
    subscribeUserChats: (email: string, callback: (data: ChatSession[]) => void) => {
      const q = query(collection(db, 'chats'), where('userEmail', '==', email));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
        callback(data);
      });
    },
    subscribeAllChats: (callback: (data: ChatSession[]) => void) => {
      return onSnapshot(collection(db, 'chats'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
        callback(data);
      });
    },
    createChat: async (userEmail: string, packageId: string) => {
      const newChat: Omit<ChatSession, 'id'> = {
        userEmail,
        packageId,
        messages: [],
        status: 'open'
      };
      const docRef = await addDoc(collection(db, 'chats'), newChat);
      return docRef.id;
    },
    sendMessage: async (chatId: string, message: Omit<ChatMessage, 'id'>) => {
      const chatRef = doc(db, 'chats', chatId);
      const newMessage = {
        ...message,
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      };
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage)
      });
    },
    updateChatStatus: async (chatId: string, status: 'open' | 'closed') => {
      await updateDoc(doc(db, 'chats', chatId), { status });
    },
    deleteChat: async (chatId: string) => {
      await deleteDoc(doc(db, 'chats', chatId));
    },

    // Auth
    setUser: (email: string | null) => {
      if (email) {
        localStorage.setItem('webooo_user_email', email);
      } else {
        localStorage.removeItem('webooo_user_email');
      }
      window.dispatchEvent(new Event('webooo_auth_change'));
    },
    getUser: () => localStorage.getItem('webooo_user_email'),
    isAdmin: () => localStorage.getItem('webooo_user_email') === 'alifhafizh0311@gmail.com',
  };
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
