import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, Settings, MessageSquare, Tag, Users, Trash2 } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useStore, storeActions, Promo, Testimonial, Package, ChatSession, ChatMessage } from '../lib/store';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'promos' | 'testimonials' | 'packages' | 'chats' | 'public_chats'>('chats');

  const { 
    subscribePromos, addPromo, deletePromo,
    subscribeTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    subscribePackages, updatePackage, seedPackages,
    subscribeAllChats, sendMessage: sendChatMessage, updateChatStatus, deleteChat,
    subscribePublicChats, sendPublicMessage, deletePublicMessage
  } = storeActions;

  const [promosList, setPromosList] = useState<Promo[]>([]);
  const [testisList, setTestisList] = useState<Testimonial[]>([]);
  const [packagesList, setPackagesList] = useState<Package[]>([]);
  const [chatsList, setChatsList] = useState<ChatSession[]>([]);
  const [publicChatsList, setPublicChatsList] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const adminAuth = localStorage.getItem('webooo_admin_auth');
    if (adminAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubPromos = subscribePromos(setPromosList);
    const unsubTestis = subscribeTestimonials(setTestisList);
    const unsubPackages = subscribePackages(setPackagesList);
    const unsubChats = subscribeAllChats(setChatsList);
    const unsubPublic = subscribePublicChats(setPublicChatsList);

    return () => {
      unsubPromos();
      unsubTestis();
      unsubPackages();
      unsubChats();
      unsubPublic();
    };
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === 'alifhafizh0311@gmail.com') {
        localStorage.setItem('webooo_admin_auth', 'true');
        setIsLoggedIn(true);
        setError('');
      } else {
        await signOut(auth);
        setError('Email tidak terdaftar sebagai admin');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login dibatalkan karena jendela popup ditutup.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain belum terdaftar di Firebase Authorized Domains.');
      } else {
        setError('Gagal login dengan Google');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('webooo_admin_auth');
    setIsLoggedIn(false);
    setEmail('');
  };

  // Promo Handlers
  const handleAddPromo = async () => {
    const code = prompt('Masukkan kode promo:');
    const discount = prompt('Masukkan diskon (%):');
    if (code && discount) {
      await addPromo({ code: code.toUpperCase(), discountPercent: Number(discount) });
    }
  };
  
  const handleDeletePromo = async (code: string) => {
    if (confirm('Hapus promo ini?')) {
      await deletePromo(code);
    }
  };

  // Testimonial Handlers
  const handleAddTesti = async () => {
    await addTestimonial({
      name: 'Nama Baru',
      role: 'Jabatan',
      text: 'Testimoni baru...'
    });
  };
  
  const handleUpdateTesti = async (id: string, field: keyof Testimonial, value: string) => {
    await updateTestimonial(id, { [field]: value });
  };

  const handleDeleteTesti = async (id: string) => {
    if (confirm('Hapus testimoni ini?')) {
      await deleteTestimonial(id);
    }
  };

  // Package Handlers
  const handleUpdatePackagePrice = async (id: string, price: number) => {
    await updatePackage(id, { price });
  };

  // Chat Handlers
  const handleSendAdminMsg = async (chatId: string, text: string) => {
    if (!text) return;
    await sendChatMessage(chatId, {
      sender: 'admin',
      senderEmail: 'alifhafizh0311@gmail.com',
      text,
      timestamp: Date.now()
    });
  };

  const handleSendPublicAdminMsg = async (text: string) => {
    if (!text) return;
    await sendPublicMessage({
      sender: 'ADMIN',
      senderEmail: 'alifhafizh0311@gmail.com',
      text,
      timestamp: Date.now()
    });
  };

  const handleToggleChatStatus = async (chatId: string, currentStatus: 'open' | 'closed') => {
    await updateChatStatus(chatId, currentStatus === 'open' ? 'closed' : 'open');
  };

  const handleDeleteChat = async (id: string) => {
    if (confirm('Hapus chat ini?')) {
      await deleteChat(id);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Masuk dengan Google untuk mengelola Webooo</p>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold tracking-tighter">Web<span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">ooo</span> Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare className="w-5 h-5 mr-3" /> Chats
          </button>
          <button
            onClick={() => setActiveTab('public_chats')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'public_chats' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Public Chat
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'promos' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Tag className="w-5 h-5 mr-3" /> Promos
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'testimonials' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Testimonials
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'packages' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings className="w-5 h-5 mr-3" /> Packages
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 capitalize">{activeTab} Management</h2>

        {activeTab === 'chats' && (
          <div className="space-y-4">
            {chatsList.length === 0 ? (
              <p className="text-gray-400">Belum ada chat masuk.</p>
            ) : (
              chatsList.map(chat => (
                <div key={chat.id} className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{chat.userEmail}</h4>
                      <p className="text-sm text-gray-400">Paket: {chat.packageId}</p>
                      <p className={`text-xs font-semibold mt-1 ${chat.status === 'open' ? 'text-green-400' : 'text-red-400'}`}>
                        Status: {chat.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleToggleChatStatus(chat.id, chat.status)}
                        className="text-xs px-2 py-1 border border-white/20 rounded hover:bg-white/10"
                      >
                        {chat.status === 'open' ? 'Close Chat' : 'Open Chat'}
                      </button>
                      <button onClick={() => handleDeleteChat(chat.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 bg-black p-4 rounded-lg max-h-60 overflow-y-auto mb-4">
                    {chat.messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-[80%] text-sm ${msg.sender === 'admin' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Balas pesan..." 
                      id={`reply-${chat.id}`}
                      className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30" 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          if (!input.value) return;
                          handleSendAdminMsg(chat.id, input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById(`reply-${chat.id}`) as HTMLInputElement;
                        if (!input || !input.value) return;
                        handleSendAdminMsg(chat.id, input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'public_chats' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-black rounded-lg">
                {publicChatsList.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderEmail === 'alifhafizh0311@gmail.com' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl relative group ${msg.senderEmail === 'alifhafizh0311@gmail.com' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}>
                      <button 
                        onClick={() => {
                          if (confirm('Hapus pesan ini?')) deletePublicMessage(msg.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="flex justify-between items-baseline mb-1 space-x-4">
                        <span className="text-[10px] font-bold uppercase opacity-70">{msg.sender}</span>
                        <span className="text-[9px] opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Kirim pesan ke publik..." 
                  id="public-admin-reply"
                  className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      if (!input.value) return;
                      handleSendPublicAdminMsg(input.value);
                      input.value = '';
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('public-admin-reply') as HTMLInputElement;
                    if (!input || !input.value) return;
                    handleSendPublicAdminMsg(input.value);
                    input.value = '';
                  }}
                  className="px-6 py-3 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div>
            <button onClick={handleAddPromo} className="mb-6 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200">
              + Tambah Promo
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promosList.map(promo => (
                <div key={promo.code} className="bg-zinc-900 border border-white/10 p-6 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">{promo.code}</h4>
                    <p className="text-green-400">{promo.discountPercent}% OFF</p>
                  </div>
                  <button onClick={() => handleDeletePromo(promo.code)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div>
            <button onClick={handleAddTesti} className="mb-6 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200">
              + Tambah Testimoni
            </button>
            <div className="space-y-4">
              {testisList.map(testi => (
                <div key={testi.id} className="bg-zinc-900 border border-white/10 p-6 rounded-xl flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <input 
                      type="text" 
                      value={testi.name} 
                      onChange={(e) => handleUpdateTesti(testi.id, 'name', e.target.value)}
                      className="bg-black border border-white/10 rounded px-2 py-1 text-sm w-full font-bold" 
                    />
                    <input 
                      type="text" 
                      value={testi.role} 
                      onChange={(e) => handleUpdateTesti(testi.id, 'role', e.target.value)}
                      className="bg-black border border-white/10 rounded px-2 py-1 text-sm w-full text-gray-400" 
                    />
                    <textarea 
                      value={testi.text} 
                      onChange={(e) => handleUpdateTesti(testi.id, 'text', e.target.value)}
                      className="bg-black border border-white/10 rounded px-2 py-1 text-sm w-full min-h-[60px]" 
                    />
                  </div>
                  <button onClick={() => handleDeleteTesti(testi.id)} className="text-red-400 hover:text-red-300 mt-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Package Management</h3>
              <button 
                onClick={async () => {
                  if (confirm('Isi data paket default?')) {
                    await seedPackages();
                    alert('Data paket berhasil diisi!');
                  }
                }}
                className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
              >
                Seed Default Packages
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packagesList.map(pkg => (
              <div key={pkg.id} className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                <h4 className="font-bold text-xl mb-4">{pkg.name}</h4>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={pkg.price} 
                    onChange={(e) => handleUpdatePackagePrice(pkg.id, Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Fitur (Pisahkan dengan koma)</label>
                  <textarea 
                    value={pkg.features.join(', ')} 
                    onChange={async (e) => {
                      const features = e.target.value.split(',').map(f => f.trim()).filter(f => f !== '');
                      await updatePackage(pkg.id, { features });
                    }}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-white/30 text-sm min-h-[80px]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  </div>
);
}
